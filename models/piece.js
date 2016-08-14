let behaviourResolver = require('./behaviours/index');

class Piece {
    constructor(name, color, position, board) {
        this.name = name;
        this.position = position;
        this.color = color;
        this.board = board;
        this.strategy = behaviourResolver(this.name)
    }

    legalMoves() {
        var moves = [];
        for (let pos of this.strategy.possibleMoves(this, this.board)) {
            let pieceCopy = this.board.getPiece(pos);
            this.board.removePiece(this.position);
            this.board.addPiece(pos, new Piece(this.name, this.color));
            if(!this.board.isInCheck()){
                moves.push(pos);
            }
            this.board.removePiece(pos);
            this.board.addPiece(this.position, new Piece(this.name, this.color));
            if(pieceCopy)
                this.board.addPiece(pos, pieceCopy);
        }
        return moves;
    }

    attacking() {
        var attackingFields = [];
        for (let pos of this.strategy.attacking(this, this.board)) {
            attackingFields.push(pos);
        }
        return attackingFields;
    }
}


module.exports = Piece;
