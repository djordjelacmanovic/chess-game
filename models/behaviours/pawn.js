let Position = require('../position');

module.exports = {
    movable: function* pawnMoveRule(piece, board) {
        let {color, position} = piece;
        let {x, y} = position;
        let direction = color.toLowerCase() === 'white' ? 1 : -1;
        let forward = new Position(x, y + direction);
        let forwardByTwo = new Position(x, y + direction * 2);
        if (!forward.outOfBounds() && !board.getPiece(forward)) {
            yield forward;
        }
        if (!forwardByTwo.outOfBounds() && (y === 2 || y === 7) && !board.getPiece(forwardByTwo)) {
            yield forwardByTwo;
        }
    },
    attacking: function* pawnAttackRule(piece) {
        let {color, position} = piece;
        let {x, y} = position;
        let direction = color.toLowerCase() === 'white' ? 1 : -1;
        let attack1 = new Position(x - 1, y + direction);
        let attack2 = new Position(x + 1, y + direction);
        if (!attack1.outOfBounds()) {
            yield attack1;
        }
        if (!attack2.outOfBounds()) {
            yield attack2;
        }
    },
    possibleMoves: function* possiblePawnMoves(piece, board) {
        for (let position of this.movable(piece, board)) {
            yield position;
        }
        for (let position of this.attacking(piece)) {
            if (board.getPiece(position) && board.getPiece(position).color !== piece.color)
                yield position;
        }
    }
};