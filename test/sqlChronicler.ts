import { describe, it} from 'mocha';
import { expect } from 'chai';

describe( 'SqlChronicler', function() {
    const dbTypes = ['Postgres', 'SQL-Lite', 'MySQL', 'MariaDB', 'MS-SQL'];
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