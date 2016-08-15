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

    describe('#toggleMove()', function () {
       it('should correctly change who\'s on the move', function () {
          let board = new Board();
           board.toMove = 'white';
           board.toggleMove();
           board.toMove.should.equal('black');
           board.toggleMove();
           board.toMove.should.equal('white');
       });
    });

    describe('#findKing(color)', function () {
       it('should return the correct Piece that represents the white king when \'white\' is passed', function () {
           let board = new Board();
           board.initBoard();
           let king = board.findKing('white');
           king.color.should.equal('white');
           king.name.should.equal('king');
           king.position.x.should.equal(5);
           king.position.y.should.equal(1);
       });
        it('should return the correct Piece that represents the black king when \'black\' is passed', function () {
            let board = new Board();
            board.initBoard();
            let king = board.findKing('black');
            king.color.should.equal('black');
            king.name.should.equal('king');
            king.position.x.should.equal(5);
            king.position.y.should.equal(8);
        });
        it('should return the correct Piece that represents the current player\'s king when called without arguments', function () {
            let board = new Board();
            board.initBoard();
            var king = board.findKing();
            //expect white king
            king.color.should.equal('white');
            king.name.should.equal('king');
            king.position.x.should.equal(5);
            king.position.y.should.equal(1);

            board.toggleMove();

            //expect black king
            king.color.should.equal('white');
            king.name.should.equal('king');
            king.position.x.should.equal(5);
            king.position.y.should.equal(1);
        });
    });

    describe('#getPiecesOfColor(color)', function () {
        it('should return white pieces when \'white\' is passed', function () {
            let board = new Board();
            board.addPiece(new Position(1,1), new Piece('pawn','white'));
            board.addPiece(new Position(8,8), new Piece('king','white'));
            board.addPiece(new Position(7,8), new Piece('king','black'));
            let pieces = board.getPiecesOfColor('white');
            pieces.should.not.be.empty;
            pieces.length.should.equal(2);

            let [piece1, piece2] = pieces;

            piece1.name.should.equal('pawn');
            piece1.color.should.equal('white');
            piece1.position.x.should.equal(1);
            piece1.position.y.should.equal(1);

            piece2.name.should.equal('king');
            piece2.color.should.equal('white');
            piece2.position.x.should.equal(8);
            piece2.position.y.should.equal(8);
        });

        it('should return black pieces when \'black\' is passed', function () {
            let board = new Board();
            board.addPiece(new Position(1,1), new Piece('pawn','black'));
            board.addPiece(new Position(8,8), new Piece('king','black'));
            board.addPiece(new Position(7,8), new Piece('king','white'));
            let pieces = board.getPiecesOfColor('black');
            pieces.should.not.be.empty;
            pieces.length.should.equal(2);

            let [piece1, piece2] = pieces;

            piece1.name.should.equal('pawn');
            piece1.color.should.equal('black');
            piece1.position.x.should.equal(1);
            piece1.position.y.should.equal(1);

            piece2.name.should.equal('king');
            piece2.color.should.equal('black');
            piece2.position.x.should.equal(8);
            piece2.position.y.should.equal(8);
        })
    })

});