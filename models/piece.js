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

    canCastle(type){
        if(this.name !== 'king') return false;
        if(this.board.isInCheck()) return false;
        var fieldsToCheck;
        if(type === 'big'){
            if(!this.board.bigCastleLegal[this.color]) return false;
            fieldsToCheck = [new Position(6,1), new Position (7,1)];
        }
        if(type === 'small'){
            if(!this.board.smallCastleLegal[this.color]) return false;
            fieldsToCheck = [new Position(4,1), new Position(3,1)];
        }
        return !(this.board.isFieldAttacked(fieldsToCheck[0]) || this.board.isFieldAttacked(fieldsToCheck[1]));
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
