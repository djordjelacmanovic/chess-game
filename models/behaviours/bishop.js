let Position = require('../position');

module.exports = {
    movable: function*(piece, board) {
        for (let position of this.attacking(piece, board)) {
            if (!board.getPiece(position) || board.getPiece(position).color !== piece.color)
                yield position;
        }
    },
    attacking: function*(piece, board) {
        let {x, y} = piece.position;
        for (var checkPos = new Position(x - 1, y - 1);
             !checkPos.outOfBounds();
             checkPos = new Position(checkPos.x - 1, checkPos.y - 1)) {
            yield checkPos;
            if (board.getPiece(checkPos)) {
                break;
            }
        }
        for (var checkPos = new Position(x + 1, y + 1);
             !checkPos.outOfBounds();
             checkPos = new Position(checkPos.x + 1, checkPos.y + 1)) {
            yield checkPos;
            if (board.getPiece(checkPos)) {
                break;
            }
        }

        for (var checkPos = new Position(x + 1, y - 1);
             !checkPos.outOfBounds();
             checkPos = new Position(checkPos.x + 1, checkPos.y - 1)) {
            yield checkPos;
            if (board.getPiece(checkPos)) {
                break;
            }
        }

        for (var checkPos = new Position(x - 1, y + 1);
             !checkPos.outOfBounds();
             checkPos = new Position(checkPos.x - 1, checkPos.y + 1)) {
            yield checkPos;
            if (board.getPiece(checkPos)) {
                break;
            }
        }
    },
    possibleMoves: function*(piece, board) {
        for (let pos of this.movable(piece, board)) {
            yield pos;
        }
    }
};