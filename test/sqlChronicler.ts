import { describe, it} from 'mocha';
import { expect } from 'chai';

describe( 'SqlChronicler', function() {
    const dbTypes = ['postgres', 'sqllite', 'mysql', 'mariadb', 'mssql'];
    dbTypes.forEach((type) => {
        describe(type, function() {
            describe( 'canary()', function() {
                it( 'Should allow assertions', function() {
                    expect(true).to.be.false;
                });
            });
        });
    });
});