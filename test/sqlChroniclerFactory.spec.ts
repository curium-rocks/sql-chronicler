import { describe, it} from 'mocha';
import { expect } from 'chai';
import { SqlChroniclerFactory } from '../src/sqlChroniclerFactory';
import { IChroniclerDescription, ProviderSingleton } from '@curium.rocks/data-emitter-base';
import { SqlChronicler } from '../src/sqlChronicler';

const factory = new SqlChroniclerFactory();
ProviderSingleton.getInstance().registerChroniclerFactory(SqlChronicler.TYPE, factory);

describe( 'SqlChronicerFactory', function() {
    describe( 'buildChronicler()', function() {
        it('Should build to specifications', async function() {
            const description: IChroniclerDescription = {
                id: 'test-id',
                name: 'test-name',
                description: 'test-description',
                type: SqlChronicler.TYPE,
                chroniclerProperties: {
                    type: 'mariadb'
                }
            }
            const chronicler = await ProviderSingleton.getInstance().buildChronicler(description);
            expect(chronicler).to.be.instanceOf(SqlChronicler);
            expect(chronicler.id).to.be.eq(description.id);
            expect(chronicler.name).to.be.eq(description.name);
            expect(chronicler.description).to.be.eq(description.description);
        });
    });
});