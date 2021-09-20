import { describe, it} from 'mocha';
import { expect } from 'chai';
import { DbType, SqlChronicler, SqlChroniclerOptions } from '../src/sqlChronicler';
import { PingPongEmitter } from '@curium.rocks/ping-pong-emitter';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { getConnection } from 'typeorm';
import { Record } from '../src/entities/record';
import { Emitter } from '../src/entities/emitter';
import { EmitterData } from '../src/entities/emitterData';
import { EmitterStatusHistory } from '../src/entities/emitterStatusHistory';
import { randomUUID } from 'crypto';


/**
 * 
 * @param {number} sleepMs 
 * @return {Promise<void>} 
 */
function sleep(sleepMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, sleepMs);
    });
}

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
                    .withEnv("MARIADB_DATABASE", "chronicler")
                    .withExposedPorts(getPort(DbType.MARIA_DB))
            }

            /**
             * @param {GenericContainer} container
             * setup mysql container
             */
            function setupMySQL(container: GenericContainer) : void {
                container.withEnv("MYSQL_ROOT_PASSWORD", "password")
                    .withEnv("MYSQL_DATABASE", "chronicler")
                    .withExposedPorts(3306)
            }

            /**
             * setup postgres container
             * @param {GenericContainer} container
             */
            function setupPostgres(container: GenericContainer) : void {
                container.withEnv("POSTGRES_PASSWORD", "postgres")
                    .withEnv("POSTGRES_DB", "chronicler")
                    .withExposedPorts(getPort(DbType.POSTGRES));
            }

            /**
             * setup sql server container
             * @param {GenericContainer} container
             */
            function setupMsSQL(container: GenericContainer): void {
                container.withEnv("ACCEPT_EULA", "Y")
                    .withEnv("MSSQL_PID", "EXPRESS")
                    .withEnv("SA_PASSWORD", "str0ngPassw0rd")
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
                const logs = await container.logs();
                logs.pipe(process.stderr)
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
                        return "sa";
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
                    case DbType.MS_SQL:
                        return "str0ngPassw0rd";
                    default:
                        return undefined;
                }
            }


            /**
             * 
             * @param {DbType} type 
             * @param {string} testName 
             * @return {string} 
             */
            function getDatabaseName(type: DbType, testName: string) : string {
                switch(type) {
                    case DbType.SQL_LITE:
                        return `${testName}-chronicler`;
                    case DbType.MS_SQL:
                        return 'master';
                    default:
                        return 'chronicler';
                }
            }

            /**
             * @param {DbType} type
             * @param {string} testName
             * @return {SqlChroniclerOptions}
             */
            function buildConfig(type: DbType, testName: string) : SqlChroniclerOptions {
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
                    database: getDatabaseName(type, testName),
                    connectionName: type + "-" + testName,
                    host: type == DbType.SQL_LITE ? undefined : container.getHost(),
                    port: type == DbType.SQL_LITE ? undefined : container.getMappedPort(getPort(type)),
                    extra: type == DbType.MS_SQL ? {
                        validateConnection: false,
                        trustServerCertificate: true
                    } : undefined
                }
            }

            it('Should record general data', async () => {
                const chronicler = new SqlChronicler(buildConfig(type, "record"));
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
                    const conn = getConnection(`${type}-record`);
                    const records = await conn.manager.find(Record);
                    expect(records).to.not.be.null;
                    expect(records.length).to.be.eq(1);
                    
                    const savedRecord = records[0];
                    expect(savedRecord.id).to.not.be.null;
                    expect(savedRecord.data).to.not.be.null;
                    expect(savedRecord.data).to.be.deep.eq(testData);
                    expect(savedRecord.createdAt).to.not.be.null;
                    expect(savedRecord.updatedAt).to.not.be.null;
                } finally {
                    await chronicler.disposeAsync();
                }
            });

            it('Should record data events', async () => {
                const chronicler = new SqlChronicler(buildConfig(type, "data"));
                const pingPongEmitter = new PingPongEmitter(`data-${randomUUID()}`, 'test', 'test', 100);
                try {
                    pingPongEmitter.onData(chronicler.saveRecord.bind(chronicler));
                    pingPongEmitter.start();
                    await sleep(1000);
                    const conn = getConnection(`${type}-data`);
                    const emitters = await conn.manager.find(Emitter);
                    expect(emitters.length).to.be.eq(1);
                    const emitterData = await conn.manager.find(EmitterData);
                    expect(emitterData.length).to.be.greaterThan(0);

                } finally {
                    pingPongEmitter.dispose();
                    await chronicler.disposeAsync();
                }
            });

            it('Should record status events', async () => {
                const chronicler = new SqlChronicler(buildConfig(type, "status"));
                const pingPongEmitter = new PingPongEmitter(`status-${randomUUID()}`, 'test', 'test', 100);
                try {
                    pingPongEmitter.onStatus(chronicler.saveRecord.bind(chronicler));
                    pingPongEmitter.start();
                    await sleep(1000);
                    const conn = getConnection(`${type}-status`);
                    const emitters = await conn.manager.find(Emitter);
                    expect(emitters.length).to.be.eq(1);
                    const statusHistory = await conn.manager.find(EmitterStatusHistory);
                    expect(statusHistory.length).to.be.greaterThan(0);

                } finally {
                    pingPongEmitter.dispose();
                    await chronicler.disposeAsync();
                }
            });
        });
    });
});