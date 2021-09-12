import { IChronicler, IDataEvent, IFormatSettings, IJsonSerializable, IStatusEvent } from '@curium.rocks/data-emitter-base';
import { Sequelize } from 'sequelize/types';


export enum DbType {
    SQL_LITE,
    POSTGRES,
    MY_SQL,
    MARIA_DB,
    MS_SQL
}
export interface DbCredentials {
    username: string;
    password: string;
}
export interface SqlChroniclerOptions {
    id: string;
    name: string;
    description: string;
    type: DbType;
    credentials: DbCredentials;
    storagePath?: string;
    host?: string;
}

/**
 * 
 */
export class SqlChronicler implements IChronicler {
    /**
     * Id of the chronicler
     */
    id: string;
    /**
     * Name of the chronicler
     */
    name: string;

    /**
     * Description of the chronicler
     */
    description: string;

    private readonly sequelize: Sequelize;

    /**
     * @param {SqlChroniclerOptions} options 
     */
    constructor(options: SqlChroniclerOptions) {
        this.id = options.id;
        this.name = options.name;
        this.description = options.description;
        this.sequelize = this.buildSequelize(options);
    }


    /**
     * 
     * @param {SqlChroniclerOptions} options 
     * @return {Sequelize} 
     */
    private buildSequelize(options: SqlChroniclerOptions) : Sequelize {
        return new Sequelize({
            dialect: 'sqlite',
            storage: options.storagePath as string
        });
    }

    /**
     * 
     */
    disposeAsync(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     * @param {IJsonSerializable|DataEvent|IStatusEvent} record 
     */
    saveRecord(record: IJsonSerializable|IDataEvent|IStatusEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     * @param {IFormatSettings} settings 
     */
    serializeState(settings: IFormatSettings): Promise<string> {
        throw new Error('Method not implemented.');
    }

}