module.exports = function (pieceType) {
    return require('./' + pieceType.toLowerCase());
};
