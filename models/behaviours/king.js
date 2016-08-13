let Position = require('../position');

module.exports = {
    movable: function*(piece, board) {
        for (let position of this.attacking(piece)) {
            if (!board.isFieldAttacked(position, piece.color === 'white' ? 'black' : 'white')
                && (!board.getPiece(position) || board.getPiece(position).color !== piece.color)) {
                yield position;
            }
        }
    },
    attacking: function*(piece, board) {
        let {x, y} = piece.position;
        let positions = [
            new Position(x, y + 1),
            new Position(x + 1, y + 1),
            new Position(x + 1, y),
            new Position(x + 1, y - 1),
            new Position(x, y - 1),
            new Position(x - 1, y - 1),
            new Position(x - 1, y),
            new Position(x - 1, y + 1)
        ];
        for (let position of positions) {
            if (!position.outOfBounds())
                yield position;
        }
    },
    possibleMoves: function*(piece, board) {
        for (let pos of this.movable(piece, board)) {
            yield pos;
        }
    }
};