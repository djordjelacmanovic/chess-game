let Position = require('../position');

module.exports = {

    movable: function*(piece, board) {
        for(let position of this.attacking(piece, board)){
            if(!board.getPiece(position) || board.getPiece(position).color !== piece.color)
                yield position;
        }
    },

    attacking: function* (piece) {
        let {x,y} = piece.position;

        let possibleMoves = [
            new Position(x-1, y+2),
            new Position(x+1, y+2),
            new Position(x-1, y-2),
            new Position(x+1, y-2),
            new Position(x+2, y+1),
            new Position(x+2, y-1),
            new Position(x-2, y+1),
            new Position(x-2, y-1),
        ];

        for(let position of possibleMoves){
            if(!position.outOfBounds())
                yield position;
        }
    },
    possibleMoves: function* (piece, board) {
        for(let pos of this.movable(piece, board)){
            yield pos;
        }
    }
};