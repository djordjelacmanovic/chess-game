let Position = require('../../models/position');
let should = require('should');

describe('Position tests', function(){
    describe('#getRow()', function(){
        it('should return the correct row value', 
            () => (new Position(1,2)).getRow().should.equal(2));
    });

    describe('#getColumn()', function(){
        it('should return the correct column value', 
        () => (new Position(1,2)).getColumn().should.equal(1));
    });

    describe('#outOfBounds()', function(){
        it('should return true if row < 1', function(){ 
            (new Position(1,0)).outOfBounds().should.be.true;
            (new Position(1,-2)).outOfBounds().should.be.true;
        });
        it('should return true if row > 8', function(){ 
            (new Position(1,9)).outOfBounds().should.be.true;
            (new Position(1,1000)).outOfBounds().should.be.true;
        });
        it('should return true if column < 1', function(){ 
            (new Position(0, 2)).outOfBounds().should.be.true;
            (new Position(-1,2)).outOfBounds().should.be.true;
        });
        it('should return true if column > 8', function(){ 
            (new Position(9,1)).outOfBounds().should.be.true;
            (new Position(10,4)).outOfBounds().should.be.true;
        });
        it('should return true if any combination of values is out of bounds', function(){ 
            (new Position(9,1)).outOfBounds().should.be.true;
            (new Position(1,10)).outOfBounds().should.be.true;
            (new Position(9,9)).outOfBounds().should.be.true;
        });
         it('should return false if position is in bounds', function(){ 
            (new Position(1,1)).outOfBounds().should.be.false;
            (new Position(1,2)).outOfBounds().should.be.false;
            (new Position(2,1)).outOfBounds().should.be.false;
            (new Position(5,2)).outOfBounds().should.be.false;
            (new Position(8,8)).outOfBounds().should.be.false;
            (new Position(5,8)).outOfBounds().should.be.false;
        });
    });
});