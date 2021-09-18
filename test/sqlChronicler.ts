import { describe, it} from 'mocha';
import { expect } from 'chai';
import { DbType, SqlChronicler, SqlChroniclerOptions } from '../src/sqlChronicler';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { createConnection } from 'net';
import { getConnection } from 'typeorm';
import { Record } from '../src/entities/record';

describe( 'SqlChronicler', function() {
    const dbTypes = [DbType.MARIA_DB, DbType.MS_SQL, DbType.MY_SQL, DbType.POSTGRES, DbType.SQL_LITE];
    dbTypes.forEach((type) => {
        describe(type.toString(), function() {
            let container: StartedTestContainer;
            this.timeout(120000);
            
            // TODO: cleanup/organize the test container management likely by moving out to different location

            /**
             * 
             * @param {DbType} type 
             * @return {string} 
             */
            function getContainerName(type: DbType) : string {
                switch (type) {
                    case DbType.MARIA_DB:
                        return type.toString();
                    case DbType.MS_SQL:
                        return "mcr.microsoft.com/mssql/server";
                    case DbType.MY_SQL:
                        return "mysql";
                    case DbType.POSTGRES:
                        return "postgres";
                    default:
                        return "busybox";
                }
            }

            /**
             * setup maria db container
             * @param {GenericContainer} container
             */
            function setupMariaDb(container: GenericContainer) : void {
                container.withEnv("MARIADB_ALLOW_EMPTY_ROOT_PASSWORD", "true")
                    .withExposedPorts(getPort(DbType.MARIA_DB))
            }

            /**
             * @param {GenericContainer} container
             * setup mysql container
             */
            function setupMySQL(container: GenericContainer) : void {
                container.withEnv("MYSQL_ROOT_PASSWORD", "password")
                    .withExposedPorts(3306)
            }

            /**
             * setup postgres container
             * @param {GenericContainer} container
             */
            function setupPostgres(container: GenericContainer) : void {
                container.withEnv("POSTGRES_PASSWORD", "postgres")
                    .withExposedPorts(getPort(DbType.POSTGRES));
            }

            /**
             * setup sql server container
             * @param {GenericContainer} container
             */
            function setupMsSQL(container: GenericContainer): void {
                container.withEnv("ACCEPT_EULA", "Y")
                    .withEnv("MSSQL_PID", "EXPRESS")
                    .withEnv("SA_PASSWORD", "test")
                    .withExposedPorts(getPort(DbType.MS_SQL))
            }


            /**
             * 
             * @param {DbType} type
             * @param {GenericContainer} container
             */
            function setEnvVars(type: DbType, container: GenericContainer) : void {
                switch(type) {
                    case DbType.MARIA_DB: 
                        setupMariaDb(container);
                        break;
                    case DbType.MS_SQL:
                        setupMsSQL(container);
                        break;
                    case DbType.MY_SQL:
                        setupMySQL(container);
                        break;
                    case DbType.POSTGRES:
                        setupPostgres(container);
                        break;
                }
            }

            beforeEach(async () => {
                if(type == DbType.SQL_LITE) return;
                const containerDesc = new GenericContainer(getContainerName(type));
                setEnvVars(type, containerDesc)
                container = await containerDesc.start();
            });

            
            afterEach(async () => {
                await container?.stop();
            });


            /**
             * 
             * @param {DbType} type 
             * @return {number}
             */
            function getPort(type: DbType) : number {
                switch(type) {
                    case DbType.MARIA_DB:
                    case DbType.MY_SQL:
                        return 3306;
                    case DbType.POSTGRES:
                        return 5432;
                    case DbType.MS_SQL:
                        return 1433
                }
                return -1;
            }

            /**
             * 
             * @param {DbType} type 
             * @return {string} 
             */
            function getUsername(type: DbType) : string | undefined {
                switch(type) {
                    case DbType.POSTGRES:
                        return "postgres";
                    case DbType.MARIA_DB:
                    case DbType.MY_SQL:
                        return 'root';
                    case DbType.MS_SQL:
                        return "admin";
                    default:
                        return undefined;
                }
            }

            /**
             * 
             * @param {DbType} type 
             * @return {string}
             */
            function getPassword(type: DbType) : string | undefined {
                switch(type) {
                    case DbType.POSTGRES:
                        return "postgres";
                    case DbType.MY_SQL:
                        return "password";
                    default:
                        return undefined;
                }
            }

            /**
             * @param {DbType} type
             * @return {SqlChroniclerOptions}
             */
            function buildConfig(type: DbType) : SqlChroniclerOptions {
                return {
                    type: type,
                    id: 'test-' + type,
                    name: 'test-' + type,
                    description: 'test-' + type,
                    credentials: {
                        username: getUsername(type),
                        password: getPassword(type)
                    },
                    statusRetention: 30,
                    dataRetention: 30,
                    database: 'chronicler',
                    host: type == DbType.SQL_LITE ? undefined : container.getHost(),
                    port: type == DbType.SQL_LITE ? undefined : container.getMappedPort(getPort(type))
                }
            }

            it('Should record general data', async () => {
                const chronicler = new SqlChronicler(buildConfig(type));
                const testData = {
                    "test1": "test1",
                    "test2": "test2",
                    "test3": "test3"
                };
                try {
                    await chronicler.saveRecord({
                        toJSON: () => {
                            return testData;
                        }
                    });

                    // pull record out and confirm
                    const conn = getConnection();
                    const records = await conn.manager.find(Record);
                    expect(records).to.not.be.null;
                    expect(records.length).to.be.eq(1);
                    
                    const savedRecord = records[0];
                    expect(savedRecord.id).to.not.be.null;
                    expect(savedRecord.data).to.not.be.null;
                    console.log(JSON.stringify(savedRecord.data));
                    expect(savedRecord.data).to.be.eq(testData)
                } finally {
                    await chronicler.disposeAsync();
                }
            });
        });
    });
});