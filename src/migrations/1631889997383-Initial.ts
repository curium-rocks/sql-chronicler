import {MigrationInterface, QueryRunner, TableIndex} from "typeorm";
import { FKPatch } from "../fkPatch";
import { TablePatch } from "../tablePatch";

/**
 * Initial migration to create tables
 */
export class Initial1631889997383 implements MigrationInterface {

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
                    type: "text"
                },
                {
                    name: "latitude",
                    type: "float"
                },
                {
                    name: "longitude",
                    type: "float"
                },
                {
                    name: "altitude",
                    type: "float"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));
        // create emitter data table
        await queryRunner.createTable(new TablePatch({
            name: "emitter_data",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true
                },
                {
                    name: "emitterId",
                    type: "varchar"
                },
                {
                    name: "meta",
                    type: queryRunner.connection.driver.options.type === "postgres" || queryRunner.connection.driver.options.type === "sqlite" ? "text" : "simple-json"
                },
                {
                    name: "data",
                    type: queryRunner.connection.driver.options.type === "postgres" || queryRunner.connection.driver.options.type === "sqlite" ? "text" : "simple-json"
                },
                {
                    name: "timestamp",
                    type: "timestamp"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
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
                    type: "uuid",
                    isPrimary: true
                },
                {
                    name: "emitterId",
                    type: "varchar"
                },
                {
                    name: "connected",
                    type: "boolean"
                },
                {
                    name: "bit",
                    type: "boolean"
                },
                {
                    name: "timestamp",
                    type: "timestamp"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));
        // create general record table
        await queryRunner.createTable(new TablePatch({
            name: "record",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true
                },
                {
                    name: "data",
                    type: queryRunner.connection.driver.options.type === "postgres" || queryRunner.connection.driver.options.type === "sqlite"  ? "text" : "simple-json"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
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
