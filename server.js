let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let guid = require('node-uuid');
let redis = require('redis');
let client = redis.createClient(process.env.REDIS_URL);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.flushall();

let Board = require('./models/board');
let Position = require('./models/position');
let Game = require('./models/game');

let Notation = require('./utils/notation');

app.use(express.static(path.join(__dirname, './static')));

app.all('/*', function (req, res) {
    return res.sendFile(path.join(__dirname, './static/index.html'));
});

io.on('connection', function (socket) {

    registerNewPlayer(socket);

    socket.on('piece exists', function (square) {
        client.get(socket.id, (err, result) => {
            if(!result)
                return;
           Game.loadGame(client, result, (err, game) =>{
               if(!game) return;
               let piece = game.board.getPiece(Notation.notationToPosition(square));
               socket.emit('piece exists ' + square, piece != null);
           })
        });
    });

    socket.on('allowed moves', function (square) {
        client.get(socket.id, (err, result) => {
            if(!result)
                return;
            Game.loadGame(client, result, (err, game) =>{
                if(!game) return;
                let piece = game.board.getPiece(Notation.notationToPosition(square));
                var allowedMoves = [];
                if (piece)
                    allowedMoves = piece.legalMoves().map(position => position.getNotation());
                socket.emit('allowed moves '+square, allowedMoves)
            })
        });
    });

    socket.on('move', function (move) {
        client.get(socket.id, (err, result) => {
            if(!result)
                return;
            Game.loadGame(client, result, (err, game) =>{
                if(!game)
                    return;
                let other = socket.id !== game.whitePlayer ? game.whitePlayer : game.blackPlayer;
                let {start, end} = Notation.moveNotationToPositions(move);
                let toMove = game.board.toMove;
                let isChecked = game.board.isInCheck();
                let kingPosition = game.board.findKing(toMove).position.getNotation();
                game.board.move(start, end);
                game.saveGame((err, res) => {
                    if(err)
                        console.log(err);
                    console.log(res);
                });
                io.to(other).emit('move', move);

                if(game.board.isCheckMate()){
                    io.to(other).emit('checkmate', game.board.toMove);
                    return socket.emit('checkmate', game.board.toMove);
                }
                if(isChecked){
                    if(!game.board.isInCheck(toMove)){
                        io.to(other).emit('uncheck', kingPosition);
                        socket.emit('uncheck', kingPosition);
                    }
                }
                if(game.board.isInCheck()){
                    let kingPosition = game.board.findKing(game.board.toMove).position.getNotation();
                    io.to(other).emit('check', kingPosition);
                    socket.emit('check', kingPosition);
                }
            })
        });
    });

    socket.on('disconnect', function () {
        console.log('Removing '+socket.id);
        client.get(socket.id, (err, game) => {
            if(game){
                client.hmget(game, 'whitePlayer', 'blackPlayer', (err, res) => {
                    let other = res[0] !== socket.id ? res[0] : res[1];
                    client.sadd('users_waiting', other);
                    client.del(other);
                    client.del(game);
                });
            }
            client.del(socket.id);
            client.srem('users_waiting', socket.id);
        })
    });
});

function registerNewPlayer(socket) {
    client.srandmember('users_waiting', function (err, result) {
        if(err)
            return console.log(err);

        if(!result){
            console.log('No users waiting at the moment');
            return client.sadd('users_waiting', socket.id, function (err) {
                if (err)
                    return console.log(err);
            });
        }
        console.log('Paired ' +socket.id + ' with ' + result);
        socket.emit('paired', 'black');
        io.to(result).emit('paired','white');
        client.srem('users_waiting', result);
        let gameId = guid.v4();
        console.log(gameId);
        console.log(socket.id);
        console.log(result);
        client.set(socket.id, gameId, (err, res) => {if(err) console.log(err)});
        client.set(result, gameId, (err,res) => {if(err) console.log(err)} );
        let newGame = new Game(gameId, result, socket.id, new Board().initBoard(), client);
        newGame.saveGame((err, result) => {
            if(err)
                return console.log(err);
            console.log(result);
        });
    });
}

http.listen(process.env.PORT, function () {
    console.log('Express and Socket.io running at port ' + process.env.PORT);
});