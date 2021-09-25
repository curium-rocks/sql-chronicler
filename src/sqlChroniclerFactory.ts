import { BaseChroniclerFactory, IChronicler, IChroniclerDescription, IChroniclerFactory } from "@curium.rocks/data-emitter-base";
import { DbType, SqlChronicler, SqlChroniclerOptions } from "./sqlChronicler";

/**
 * 
 */
export class SqlChroniclerFactory extends BaseChroniclerFactory implements IChroniclerFactory {
    
    /**
     * 
     * @param {string} dbTypeStr 
     * @return {DbType} 
     */
    private getDbTypeFromStr(dbTypeStr: string) : DbType {
        switch(dbTypeStr.toLowerCase()) {
            case 'mysql':
                return DbType.MY_SQL;
            case 'mariadb':
                return DbType.MARIA_DB;
            case 'mssql':
                return DbType.MS_SQL;
            case 'postgres':
                return DbType.POSTGRES;
            default:
                return DbType.SQL_LITE;
        }
    }

    /**
     * 
     * @param {IChroniclerDescription} description 
     * @return {Promise<IChronicler>}
     */
    buildChronicler(description: IChroniclerDescription): Promise<IChronicler> {
        const props = description.chroniclerProperties as Record<string, unknown>;
        // validate the properties
        if (!props.type) return Promise.reject(new Error("Missing required dbType property for SqlChronicler"));
        const creds = props.credentials as Record<string, unknown>;
        const options: SqlChroniclerOptions = {
            name: description.name,
            description: description.description,
            id: description.id,
            type: this.getDbTypeFromStr(props.type as string),
            credentials: {
                username: creds.username as string, 
                password: creds.password as string
            },
            logger: this.loggerFacade,
            statusRetentionDays: props.statusRetentionDays as number,
            dataRetentionDays: props.dataRetentionDays as number,
            extra: props.extra,
            queryLogging: props.queryLogging as string[],
            database: props.database as string,
            connectionName: props.connectionName as string,
            host: props.host as string,
            port: props.port as number
        };
        const chronicler: SqlChronicler = new SqlChronicler(options);
        return Promise.resolve(chronicler);
    }
    
}