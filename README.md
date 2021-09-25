# SQL-Chronicler

This library archives data events, status events, and general records from data emitters to a sql database. 
Supported database types include MariaDB, MySQL, Postgres, Sqlite, and SQL Server. It's intended to be included in a project as a library, see https://github.com/curium-rocks/maestro for an example of emitter and chronicler usage.

## How to install

`npm install --save @curium.rocks/sql-chronicler`

## How to create a chronicler

``` typescript
// create a factory and register it with the provider
const factory = new SqlChroniclerFactory();
ProviderSingleton.getInstance().registerChroniclerFactory(SqlChronicler.TYPE, factory);

const description: IChroniclerDescription = {
    id: 'test-id',
    name: 'test-name',
    description: 'test-description',
    type: SqlChronicler.TYPE,
    chroniclerProperties: {
        type: 'sqlite'
    }
}
const chronicler = await ProviderSingleton.getInstance().buildChronicler(description);
```

## How to connect an emitter to a chronicler

``` typescript
yourEmitter.onData(yourChronicler.saveRecord.bind(yourChronicler));
```