import { IChronicler, IDataEmitter, IDataEvent, IFormatSettings, IJsonSerializable, isDataEvent, isStatusEvent, IStatusEvent, LoggerFacade } from '@curium.rocks/data-emitter-base';
import { BaseChronicler } from '@curium.rocks/data-emitter-base/build/src/chronicler';
import { createConnection, getConnectionManager, Connection, DatabaseType, ConnectionOptions, EntityManager } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { SqlServerConnectionOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionOptions';
import { Emitter } from './entities/emitter';
import { EmitterData } from './entities/emitterData';
import { EmitterStatusHistory } from './entities/emitterStatusHistory';
import { Record } from './entities/record';
import { Initial1631889997383 } from './migrations/1631889997383-Initial';
import "reflect-metadata";

export enum DbType {
    SQL_LITE = "sqlite",
    POSTGRES = "postgres",
    MY_SQL = "mysql",
    MARIA_DB = "mariadb",
    MS_SQL = "mssql"
}
export interface DbCredentials {
    username?: string;
    password?: string;
}
export interface SqlChroniclerOptions {
    id: string;
    name: string;
    description: string;
    type: DbType;
    credentials?: DbCredentials;
    storagePath?: string;
    host?: string;
    port?: number;
    database?: string;
    statusRetentionDays?: number;
    dataRetentionDays?: number;
    connectionName?: string;
    extra?: unknown;
    queryLogging?: string[];
    logger?: LoggerFacade;
}

/**
 * 
 */
export class SqlChronicler extends BaseChronicler implements IChronicler {


    public static readonly TYPE: string = "SQL-CHRONICLER";


    /**
     * 
     */
    private connection?: Connection;

    private connectionProm?: Promise<Connection>;

    private readonly options: SqlChroniclerOptions;

    private disposed = false;
    private readonly logger?: LoggerFacade;


    /**
     * @param {SqlChroniclerOptions} options 
     */
    constructor(options: SqlChroniclerOptions) {
        super({
            id: options.id,
            name: options.name,
            description: options.description,
            type: SqlChronicler.TYPE,
            chroniclerProperties: {}
        })
        this.options = options;
        this.logger = options.logger;

    }

    /**
     * @return {Promise<Connection>}
     */
    private buildConnection(): Promise<Connection> {
        this.logger?.trace('building connection with db type');
        if(this.connectionProm != null) return this.connectionProm;
        const options = this.getConnOptions();
        const connName = options.name || 'default';
        if(getConnectionManager().has(connName)) {
            this.logger?.debug('cleaning up existing connection');
            this.connectionProm = Promise.resolve(getConnectionManager().get(connName)).then(async (conn) => {
               if(conn.isConnected) {
                   await conn.close();
               }
               this.logger?.trace('creating new connection');
               const retConn = getConnectionManager().create(options);
               this.logger?.trace('creating new connection');
               await retConn.connect();
               this.logger?.info('running migrations');
               await retConn.runMigrations();
               return retConn;
            });
        } else {
            this.connectionProm = createConnection(this.getConnOptions()).then(async (conn)=>{
                this.logger?.info('running migrations');
                await conn.runMigrations();
                return conn;
            });
        }
        
        return this.connectionProm;
    }

    /**
     * 
     * @return {ConnectionOptions}
     */
    private getConnOptions(): ConnectionOptions {
        const opts = {
            type: this.getDbType(),
            name: this.options.connectionName,
            host: this.options.host as string,
            port: this.options.port as number,
            username: this.options.credentials?.username,
            password: this.options.credentials?.password,
            database: this.options.database as string,
            entities: [
                Emitter,
                EmitterData, 
                EmitterStatusHistory,
                Record
            ],
            migrations: [
                Initial1631889997383
            ],
            synchronize: false,
            logging: this.options.queryLogging || false,
            migrationsRun: false,
            extra: this.options.extra
        };

        switch(opts.type) {
            case 'mssql':
                return opts as SqlServerConnectionOptions;
            case 'sqlite':
                return opts as SqliteConnectionOptions;
            case 'postgres':
                return opts as PostgresConnectionOptions;
            default:
                return opts as MysqlConnectionOptions;
        }
    }

    /**
     * Get the TypeORM matching type string from the enum
     * @return {string}
     */
    private getDbType(): DatabaseType {
        switch (this.options.type) {
            case DbType.MARIA_DB:
                return 'mariadb';
            case DbType.MY_SQL:
                return 'mysql';
            case DbType.POSTGRES:
                return 'postgres';
            case DbType.SQL_LITE:
                return 'sqlite';
            case DbType.MS_SQL:
                return 'mssql';
        }
    }

    /**
     * @return {Promise<void>}
     */
    async disposeAsync(): Promise<void> {
        this.logger?.debug('disposing');
        this.disposed = true;
        if (this.connectionProm) await this.connectionProm;
        await this.connection?.close();
    }

    /**
     * 
     * @param {IJsonSerializable|DataEvent|IStatusEvent} record 
     */
    async saveRecord(record: IJsonSerializable|IDataEvent|IStatusEvent): Promise<void> {
        if(this.disposed) throw new Error("Object disposed, cannot save data");
        const conn = await this.buildConnection();
        this.logger?.trace("creating transaction for record save");
        await conn.transaction("SERIALIZABLE", async  (transactionalEntityManager) => {
            if(isDataEvent(record)) {
                this.logger?.trace("saving record for data event");
                await this.saveDataEvent(record as IDataEvent, transactionalEntityManager);
            } else if (isStatusEvent(record)) {
                // save status event
                this.logger?.trace("saving record for status event");
                await this.saveStatusEvent(record as IStatusEvent, transactionalEntityManager);
            } else {
                // save general record
                this.logger?.trace("saving general record");
                await this.saveGeneralRecord(record, transactionalEntityManager);
            }
        });
    }

    /**
     * 
     * @param {IDataEmitter} emitter 
     * @param {EntityManager} em 
     */
    private async upsertEmitter(emitter: IDataEmitter, em: EntityManager) : Promise<void> {
        // check if emitter exists
        const id = emitter.id;
        this.logger?.trace(`looking up emitter with id ${id}`);
        const dbEmitter = await em.findOne(Emitter, id);
        if(dbEmitter) {
            this.logger?.trace(`found matching emitter with id and name ${id}, ${dbEmitter.name}`);
            dbEmitter.updateFromDataEmitter(emitter);
            this.logger?.trace(`saving updates to emitter`);
            await em.save(dbEmitter);
        } else {
            this.logger?.trace(`do did not find existing match for emitter, creating a new one`);
            const newEmitter = em.create(Emitter, Emitter.createFromDataEmitter(emitter));
            await em.save(newEmitter);
        }
        this.logger?.trace(`finished upsert operation on emitter ${id}`);
    }

    /**
     * 
     * @param {IDataEvent} data 
     * @param {EntityManager} em 
     */
    private async saveDataEvent(data:IDataEvent, em: EntityManager) : Promise<void> {
        this.logger?.trace(`start saveDataEvent`);
        await this.upsertEmitter(data.emitter, em);
        const dataEvent = EmitterData.createFromDataEvent(data);
        await em.save(dataEvent);
        this.logger?.trace(`end saveDataEvent`);
    }

    /**
     * 
     * @param {IStatusEvent} status 
     * @param {EntityManager} em 
     */
    private async saveStatusEvent(status:IStatusEvent, em: EntityManager) : Promise<void>  {
        this.logger?.trace(`start saveStatusEvent`);
        await this.upsertEmitter(status.emitter, em);
        const statusEvent = EmitterStatusHistory.createFromStatusEvent(status);
        await em.save(statusEvent);
        this.logger?.trace(`end saveStatusEvent`);
    }

    /**
     * 
     * @param {IJsonSerializable} rec 
     * @param {EntityManager} em 
     */
    private async saveGeneralRecord(rec:IJsonSerializable, em: EntityManager) : Promise<void> {
        this.logger?.trace(`start saveGeneralRecord`);
        const record = new Record();
        record.data = rec.toJSON();
        await em.save(record);
        this.logger?.trace(`end saveGeneralRecord`);
    }

    /**
     * 
     * @return {unknown}
     */
    getChroniclerProperties(): unknown {
        return this.options;
    }

    /**
     * 
     * @return {string}
     */
    getType(): string {
        return SqlChronicler.TYPE;
    }
}