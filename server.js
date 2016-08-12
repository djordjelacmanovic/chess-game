let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let redis = require('redis');
let client = redis.createClient();

let Board = require('./models/board');
let Position = require('./models/position');
var board = new Board();

var boardPieces = board.boardMatrix.map(function (row) {
   return row.map(function (piece) {
       if(!piece)
           return;
       let {position, name, color} = piece;
       return {
           position, name, color
       }
   });
});

client.set('board', JSON.stringify(boardPieces));

let squareMapping = {
    a : 1,
    b : 2,
    c : 3,
    d : 4,
    e : 5,
    f : 6,
    g : 7,
    h : 8
};

app.use(express.static(path.join(__dirname, './static')));

app.all('/*', function (req, res) {
    return res.sendFile(path.join(__dirname, './static/index.html'));
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('piece exists', function (square) {
        console.log(square);
        let piece = board.getPiece(squareToIndexes(square));
        socket.emit('piece exists '+square, piece != null );
    });

    socket.on('allowed moves', function (square) {
        console.log(square);
        let piece = board.getPiece(squareToIndexes(square));
        var allowedMoves = [];
        if(piece){
            allowedMoves = piece.possibleMoves().map(function (position) {
                return position.getNotation();
            });
        }
        socket.emit('allowed moves '+square, allowedMoves);
    });

    socket.on('move', function (move) {
        let {start, end} = moveToPositions(move);
        let piece = board.getPiece(start);
        board.addPiece(end, piece);
        board.removePiece(start);
        socket.broadcast.emit('move', move);
    })
});

http.listen(80, function () {
    console.log('Express and Socket.io running at localhost:80');
});

function squareToIndexes(square) {
    var xLetter = square[0];
    var y = square[1];
    return new Position(squareMapping[xLetter], y);
}

function moveToPositions(move) {
    let [start,end] = move.split('-');
    return {
        start: squareToIndexes(start),
        end: squareToIndexes(end)
    }
}