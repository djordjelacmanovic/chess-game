let Notation = require('../../utils/notation');
let should = require('should');

describe('Notation tests', () => {
    describe('#mapColumnToIndex()', () => {
       it('should return correct index for a valid lowercase column letter', () => {
          Notation.mapColumnToIndex('a').should.equal(1);
           Notation.mapColumnToIndex('b').should.equal(2);
           Notation.mapColumnToIndex('c').should.equal(3);
           Notation.mapColumnToIndex('d').should.equal(4);
           Notation.mapColumnToIndex('e').should.equal(5);
           Notation.mapColumnToIndex('f').should.equal(6);
           Notation.mapColumnToIndex('g').should.equal(7);
           Notation.mapColumnToIndex('h').should.equal(8);
       });

        it('should return correct index for a valid lowercase column letter', () => {
            Notation.mapColumnToIndex('A').should.equal(1);
            Notation.mapColumnToIndex('B').should.equal(2);
            Notation.mapColumnToIndex('C').should.equal(3);
            Notation.mapColumnToIndex('D').should.equal(4);
            Notation.mapColumnToIndex('E').should.equal(5);
            Notation.mapColumnToIndex('F').should.equal(6);
            Notation.mapColumnToIndex('G').should.equal(7);
            Notation.mapColumnToIndex('H').should.equal(8);
        });

        it('should return undefined for not valid column letter', () =>{
           should(Notation.mapColumnToIndex('z') ).not.be.ok;
        });
    });
});