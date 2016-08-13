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
        return {position, name, color};
    });
});

client.set('board', JSON.stringify(boardPieces));

app.use(express.static(path.join(__dirname, './static')));

app.all('/*', function (req, res) {
    return res.sendFile(path.join(__dirname, './static/index.html'));
});

io.on('connection', function (socket) {

    client.srandmember('users_waiting', function (err, result) {
        if(err)
            return console.log(err);
        console.log(result);
        if(!result){
            console.log('No users waiting at the moment');
            return client.sadd('users_waiting', socket.id, function (err, result) {
                if(err)
                    return console.log(err);
                console.log(result);
            });
        }
        console.log('Paired ' +socket.id + ' with ' + result);
        socket.emit('paired', 'black');
        io.to(result).emit('paired','white');
    });

    socket.on('piece exists', function (square) {
        let piece = board.getPiece(Notation.notationToPosition(square));
        socket.emit('piece exists ' + square, piece != null);
    });

    socket.on('allowed moves', function (square) {
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
        let toMove = board.toMove;

        let isChecked = board.isInCheck();
        let kingPosition = board.findKing(toMove).position.getNotation();
        board.move(start, end);
        socket.broadcast.emit('move', move);

        if(board.isCheckMate()){
            socket.broadcast.emit('checkmate', board.toMove);
            return socket.emit('checkmate', board.toMove);
        }

        if(isChecked){
            if(!board.isInCheck(toMove)){
                socket.broadcast.emit('uncheck', kingPosition);
                socket.emit('uncheck', kingPosition);
            }
        }

        if(board.isInCheck()){
            let kingPosition = board.findKing(board.toMove).position.getNotation();
            socket.broadcast.emit('check', kingPosition);
            socket.emit('check', kingPosition);
        }
    });

    socket.on('disconnect', function () {
        board = new Board();
        console.log('Removing '+socket.id);
        client.srem('users_waiting', socket.id, function (err, res) {
            if(err)
                return console.log(err);
            console.log(res);
        });
    });
});

http.listen(process.env.PORT, function () {
    console.log('Express and Socket.io running at port ' + process.env.PORT);
});