import { type } from "os";
import {MigrationInterface, QueryRunner, TableIndex} from "typeorm";
import { FKPatch } from "../fkPatch";
import { TablePatch } from "../tablePatch";

/**
 * Initial migration to create tables
 */
export class Initial1631889997383 implements MigrationInterface {


    /**
     * 
     * @param {string} dbType 
     * @return {string} 
     */
    private getJsonType(dbType: string) : string {
        switch(dbType.toLowerCase()) {
            case 'postgres':
                return 'json';
            case 'sqlite':
            case 'mssql':
            case 'mariadb':
            case 'mysql':
                return 'text';
            default:
                return 'simple-json';
        }
    }

    /**
     * 
     * @param {string} dbType 
     * @return {string}
     */
    private getNowFunc(dbType: string) : string {
        switch(dbType.toLowerCase()) {
            case 'sqlite':
                return "time('now')";
            case 'mssql':
                return "getdate()"
            default: 
                return "now()";
        }
    }

    /**
     * 
     * @param {DbType} dbType 
     * @return {string}
     */
    private getBoolType(dbType: string) : string {
        switch(dbType.toLowerCase()) {
            case 'mssql':
                return "bit";
            default: 
                return "boolean";
        }
    }

    /**
     * 
     * @param {DbType} dbType 
     * @return {string} 
     */
    private getUuidType(dbType: string) : string {
        switch(dbType.toLowerCase()) {
            case 'mariadb':
            case 'mysql':
                return "varchar";
            case 'mssql':
                return "uniqueidentifier";
            default:
                return "uuid";
        }
    }

    /**
     * 
     * @param {DbType} dbType 
     * @return {string}
     */
    private getTimeStamptype(dbType: string): string {
        switch(dbType.toLowerCase()) {
            case 'mssql':
                return "datetime";
            default:
                return "timestamp";
        }
    }

    /**
     * 
     * @param {string} dbType 
     * @return {string | undefined}  
     */
    private getDefaultForUUID(dbType: string) : string | undefined {
        switch(dbType.toLowerCase()) {
            case 'postgres':
                return "uuid_generate_v4()";
            default: 
                return undefined;
        }
    }

    /**
     * 
     * @param {QueryRunner} queryRunner 
     */
    public async up(queryRunner: QueryRunner): Promise<void> {
        // create emitter table
        await queryRunner.createTable( new TablePatch( {
            name: "emitter",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    isPrimary: true
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "description",
                    type: "varchar"                },
                {
                    name: "latitude",
                    isNullable: true,
                    type: "float"
                },
                {
                    name: "longitude",
                    isNullable: true,
                    type: "float"
                },
                {
                    name: "altitude",
                    isNullable: true,
                    type: "float"
                },
                {
                    name: "created_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                },
                {
                    name: "updated_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                }
            ]
        }));
        // create emitter data table
        await queryRunner.createTable(new TablePatch({
            name: "emitter_data",
            columns: [
                {
                    name: "id",
                    type: this.getUuidType(queryRunner.connection.driver.options.type),
                    default: this.getDefaultForUUID(queryRunner.connection.driver.options.type),
                    isPrimary: true
                },
                {
                    name: "emitterId",
                    type: "varchar"
                },
                {
                    name: "meta",
                    type: this.getJsonType(queryRunner.connection.driver.options.type)
                },
                {
                    name: "data",
                    type: this.getJsonType(queryRunner.connection.driver.options.type)
                },
                {
                    name: "timestamp",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type)
                },
                {
                    name: "created_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                },
                {
                    name: "updated_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                }
            ]
        }));
        
        // create emitter status history table
        // create emitter data table
        await queryRunner.createTable(new TablePatch({
            name: "emitter_status_history",
            columns: [
                {
                    name: "id",
                    type: this.getUuidType(queryRunner.connection.driver.options.type),
                    default: this.getDefaultForUUID(queryRunner.connection.driver.options.type),
                    isPrimary: true
                },
                {
                    name: "emitterId",
                    type: "varchar"
                },
                {
                    name: "connected",
                    type: this.getBoolType(queryRunner.connection.driver.options.type)
                },
                {
                    name: "bit",
                    type: this.getBoolType(queryRunner.connection.driver.options.type)
                },
                {
                    name: "timestamp",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type)
                },
                {
                    name: "created_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                },
                {
                    name: "updated_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                }
            ]
        }));
        // create general record table
        await queryRunner.createTable(new TablePatch({
            name: "record",
            columns: [
                {
                    name: "id",
                    type: this.getUuidType(queryRunner.connection.driver.options.type),
                    default: this.getDefaultForUUID(queryRunner.connection.driver.options.type),
                    isPrimary: true
                },
                {
                    name: "data",
                    type: this.getJsonType(queryRunner.connection.driver.options.type)
                },
                {
                    name: "created_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                },
                {
                    name: "updated_at",
                    type: this.getTimeStamptype(queryRunner.connection.driver.options.type),
                    default: this.getNowFunc(queryRunner.connection.driver.options.type)
                }
            ]
        }));

        // create FK
        await queryRunner.createForeignKey("emitter_data", new FKPatch({
            columnNames: ["emitterId"],
            referencedColumnNames: ["id"],
            referencedTableName: "emitter",
            onDelete: "CASCADE"
        }));

        // create FK
        await queryRunner.createForeignKey("emitter_status_history", new FKPatch({
            columnNames: ["emitterId"],
            referencedColumnNames: ["id"],
            referencedTableName: "emitter",
            onDelete: "CASCADE"
        }));
        
        // create indices
        await queryRunner.createIndex("emitter", new TableIndex({
            name: "IDX_EMITTER_NAME",
            columnNames: ["name"]
        }))
        await queryRunner.createIndex("emitter", new TableIndex({
            name: "IDX_EMITTER_DESCRIPTION",
            
            columnNames: ["description"]
        }))
    }

    /**
     * 
     * @param {QueryRunner} queryRunner 
     */
    public async down(queryRunner: QueryRunner): Promise<void> {
        // destroy emitter data table
        await queryRunner.dropTable("emitter_data");

        // destroy emitter status history table
        await queryRunner.dropTable("emitter_status_history");
        
        // destroy emitter table
        await queryRunner.dropTable("emitter");

        // destroy general record table
        await queryRunner.dropTable("record");
    }

}
