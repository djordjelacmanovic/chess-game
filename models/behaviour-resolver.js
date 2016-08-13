module.exports = function (pieceType) {
    return require('./behaviours/' + pieceType.toLowerCase());
};
