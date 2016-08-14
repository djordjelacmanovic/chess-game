let Board = require('./board');

class Game {
    constructor(id, whitePlayerSocketId, blackPlayerSocketId, board, redis){
        this.id = id;
        this.whitePlayer = whitePlayerSocketId;
        this.blackPlayer = blackPlayerSocketId;
        this.board = board;
        this.redis = redis;
    }

    saveGame(callback){
        let json = this.board.toJson();
        this.redis.hmset([this.id,
                            'whitePlayer', this.whitePlayer,
                            'blackPlayer', this.blackPlayer,
                            'board',       json],
            callback);
    }

    static loadGame(redis, id, callback){
        redis.hmget(id, 'whitePlayer', 'blackPlayer', 'board', function (err, result) {
            if(err)
                return callback(err, null);
            if(!result)
                return callback(null, null);
            return callback(null, new Game(id,
                result[0],
                result[1],
                Board.fromJson(result[2]),
                redis));
        })
    }

}

module.exports = Game;