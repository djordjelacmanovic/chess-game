let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');

let redis = require('redis');
let client = redis.createClient(process.env.REDIS_URL);

client.on("error", function (err) {
    console.log("Error " + err);
});

let Board = require('./models/board');
let Position = require('./models/position');
var board = new Board();

let Notation = require('./utils/notation');

var boardPieces = board.boardMatrix.map(function (row) {
    return row.map(function (piece) {
        if (!piece)
            return;
        let {position, name, color} = piece;
        return {
            position, name, color
        }
    });
});

client.set('board', JSON.stringify(boardPieces));

app.use(express.static(path.join(__dirname, './static')));

app.all('/*', function (req, res) {
    return res.sendFile(path.join(__dirname, './static/index.html'));
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('piece exists', function (square) {
        console.log(square);
        let piece = board.getPiece(Notation.notationToPosition(square));
        socket.emit('piece exists ' + square, piece != null);
    });

    socket.on('allowed moves', function (square) {
        console.log(square);
        let piece = board.getPiece(Notation.notationToPosition(square));
        var allowedMoves = [];
        if (piece) {
            allowedMoves = piece.possibleMoves().map(function (position) {
                return position.getNotation();
            });
        }
        socket.emit('allowed moves ' + square, allowedMoves);
    });

    socket.on('move', function (move) {
        let {start, end} = Notation.moveNotationToPositions(move);
        board.move(start, end);
        socket.broadcast.emit('move', move);
    });

    socket.on('disconnect', function () {
        board = new Board();
    });
});

http.listen(process.env.PORT, function () {
    console.log('Express and Socket.io running at port ' + process.env.PORT);
});