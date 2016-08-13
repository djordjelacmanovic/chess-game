let Position = require('../../models/position');
let Board = require('../../models/board');
let Piece = require('../../models/piece');

describe('Board tests', function () {
    describe('#addPiece()', function () {
        it('should add a piece to a correct position', function () {
            let board = new Board();
            board.addPiece(new Position(1, 1), new Piece('pawn'));
            let piece = board.getPiece(new Position(1, 1));
            piece.name.should.equal('pawn');
        });
    });
});