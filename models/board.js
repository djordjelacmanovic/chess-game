let Position = require('./position');
let Piece = require('./piece');

class Board {
    constructor() {
        this.toMove = 'white';
        this.smallCastleLegal = {
            white: true,
                black: true
        };
        this.bigCastleLegal = {
            white: true,
            black: true
        };
        this.boardMatrix = [];
        for (var j = 1; j <= 8; j++) {
            this.boardMatrix[j] = [];
            for (var i = 1; i <= 8; i++) {
                this.boardMatrix[j][i] = null;
            }
        }
    }

    initBoard() {
        //add pawns
        for (var i = 1; i <= 8; i++) {
            this.addPiece(new Position(i, 2), new Piece('pawn', 'white'));
            this.addPiece(new Position(i, 7), new Piece('pawn', 'black'));
        }
        //add rooks
        this.addPiece(new Position(1, 1), new Piece('rook', 'white'));
        this.addPiece(new Position(8, 1), new Piece('rook', 'white'));
        this.addPiece(new Position(1, 8), new Piece('rook', 'black'));
        this.addPiece(new Position(8, 8), new Piece('rook', 'black'));
        //add knights
        this.addPiece(new Position(2, 1), new Piece('knight', 'white'));
        this.addPiece(new Position(2, 8), new Piece('knight', 'black'));
        this.addPiece(new Position(7, 8), new Piece('knight', 'black'));
        this.addPiece(new Position(7, 1), new Piece('knight', 'white'));
        //add bishops
        this.addPiece(new Position(3, 1), new Piece('bishop', 'white'));
        this.addPiece(new Position(3, 8), new Piece('bishop', 'black'));
        this.addPiece(new Position(6, 8), new Piece('bishop', 'black'));
        this.addPiece(new Position(6, 1), new Piece('bishop', 'white'));
        //add queens
        this.addPiece(new Position(4, 1), new Piece('queen', 'white'));
        this.addPiece(new Position(4, 8), new Piece('queen', 'black'));
        //add kaingz
        this.addPiece(new Position(5, 8), new Piece('king', 'black'));
        this.addPiece(new Position(5, 1), new Piece('king', 'white'));

        return this;
    }

    addPiece(position, piece) {
        if (position.outOfBounds())
            throw 'Position was out of bounds.';
        else {
            let {x, y} = position;
            this.boardMatrix[y][x] = piece;
            piece.position = position;
            piece.board = this;
            return this.getBoardState();
        }
    }

    getPiece(position) {
        if (position.outOfBounds()) {
            throw 'Out of bounds';
        } else {
            let {y, x} = position;
            return this.boardMatrix[y][x];
        }
    }

    move(start, end) {
        let piece = this.getPiece(start);

        if(piece.name === 'king'){
            this.bigCastleLegal[this.toMove] = false;
            this.smallCastleLegal[this.toMove] = false;
        }
        if(piece.name === 'rook'){
            if(piece.position.x === 1){
                this.bigCastleLegal[this.toMove] = false;
            }
            if(piece.position.y === 8){
                this.smallCastleLegal[this.toMove] = false;
            }
        }
        let piece2 = this.getPiece(end);
        if (piece) {
            if (!piece2 || piece2.color !== piece.color) {
                this.removePiece(end);
                this.removePiece(start);
                this.addPiece(end, new Piece(piece.name, piece.color));
                this.toggleMove();
            }
        }
    }

    castle(type){
        if(type==='small'){
            if(!this.smallCastleLegal[this.toMove])
                throw 'Cannot small castle.';
        }
        if(type==='big') {
            if(!this.bigCastleLegal[this.toMove])
                throw 'Cannot big castle';
        }
    }

    toggleMove(){
        this.toMove = this.toMove === 'white' ? 'black' : 'white';
    }

    removePiece(position) {
        if (position.outOfBounds()) {
            throw 'Out of bounds';
        } else {
            let {y, x} = position;
            this.boardMatrix[y][x] = null;
        }
    }

    getBoardState() {
        return this.boardMatrix;
    }

    isFieldAttacked(position, attackingPieceColor) {
        for (var j = 1; j <= 8; j++) {
            for (var i = 1; i <= 8; i++) {
                var piece = this.boardMatrix[j][i];
                if (!piece)
                    continue;
                for (let attacked of piece.attacking()) {
                    if (attacked.x === position.x && attacked.y === position.y) {
                        if (attackingPieceColor) {
                            if (piece.color === attackingPieceColor)
                                return true;
                        } else {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    findKing(color){
        let col = color || this.toMove;
        for(var j = 1; j <= 8; j++){
            for(var i = 1; i <= 8; i++){
                let piece = this.boardMatrix[j][i];
                if(piece && piece.name === 'king' && piece.color === col){
                    return piece;
                }
            }
        }
    }

    getPiecesOfColor(color){
        let col = color || this.toMove;
        var pieces = [];
        for(var j = 1; j <=8; j++){
            pieces = pieces.concat(this.boardMatrix[j].filter(piece => piece && piece.color === col));
        }
        return pieces;
    }

    isInCheck(color){
        let col = color || this.toMove;
        let king = this.findKing(col);
        return this.isFieldAttacked(king.position, col  === 'white' ? 'black' : 'white');
    }

    isCheckMate(color){
        let col = color || this.toMove;
        let king = this.findKing(col);
        return this.isFieldAttacked(king.position, col  === 'white' ? 'black' : 'white')
            && this.getPiecesOfColor(col).filter(piece => piece && piece.legalMoves().length > 0).length === 0;
    }

    toJson(){
        return JSON.stringify({
            boardState : this.boardMatrix.map(function (row) {
                return row.map(piece => {
                    if (!piece)
                        return null;
                    let {position, name, color} = piece;
                    return {position, name, color};
                });
            }),
            toMove : this.toMove,
            smallCastleLegal : this.smallCastleLegal,
            bigCastleLegal : this.bigCastleLegal
        });
    }

    static fromJson(json){
        let obj = JSON.parse(json);
        let board = new Board();
        board.toMove = obj.toMove;
        board.smallCastleLegal = obj.smallCastleLegal;
        board.bigCastleLegal = obj.bigCastleLegal;
        for(let row of obj.boardState.filter(row => row)){
            for(let piece of row.filter(piece => piece)){
                board.addPiece(new Position(piece.position.x, piece.position.y), new Piece(piece.name, piece.color));
            }
        }
        return board;
    }
}

module.exports = Board;