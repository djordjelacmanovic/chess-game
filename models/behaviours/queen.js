let rookBehaviour = require('./rook');
let bishopBehaviour = require('./bishop');

module.exports = {
    movable: function*(piece, board) {
        for (let position of rookBehaviour.movable(piece, board)) {
            yield position;
        }
        for (let position of bishopBehaviour.movable(piece, board)) {
            yield position;
        }
    },
    attacking: function*(piece, board) {
        for (let position of rookBehaviour.attacking(piece, board)) {
            yield position;
        }
        for (let position of bishopBehaviour.attacking(piece, board)) {
            yield position;
        }
    },
    possibleMoves: function*(piece, board) {
        for (let pos of this.movable(piece, board)) {
            yield pos;
        }
    }
};