let Position = require('../models/position');

class Notation {

    static mapColumnToIndex(columnLetter) {
        let mapping = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8};
        return mapping[columnLetter];
    }

    static notationToPosition(square) {
        var columnLetter = square[0];
        var row = square[1];
        return new Position(this.mapColumnToIndex(columnLetter), row);
    }

    static moveNotationToPositions(move) {
        let [start,end] = move.split('-');
        return {
            start: this.notationToPosition(start),
            end: this.notationToPosition(end)
        }
    }
}

module.exports = Notation;