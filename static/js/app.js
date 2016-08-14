function init() {
    window.socket = io({transports: ['websocket']});

    window.socket.on('move', function (move) {
        window.board.move(move);
        displayMoveInList(move);
        toggleMove();
    });

    window.socket.on('checkmate', function (color) {
        alert(color + ' defeated.');
    });

    window.socket.on('check', function (square) {
        getSquareElement(square).addClass('in-check');
    });

    window.socket.on('uncheck', function (square) {
        getSquareElement(square).removeClass('in-check');
    });

    window.socket.on('paired', function (color) {
        window.board.orientation(color);
        window.gameOn = true;
        window.toMove = 'white';
        $('#information').text('Playing as ' + color);
        $('#to-move').text('white to move');
        $('#moves-list').text('');
        window.board.start();
        bindClickListeners();
    });

    window.board = new ChessBoard('board', {
        onMouseoverSquare: mouseOverSquare,
        onMouseoutSquare: function () {
            if (window.selectedPiece)
                return;
            removeGreySquares();
        }
    });

    window.selectedPiece = null;
    window.toMove = 'white';

    window.board.start();
    bindClickListeners();
}

function getSquareElement(square) {
    return $('#board').find('.square-' + square);
}

function getPieceAtSquare(square){
    return getSquareElement(square).find('img').data('piece').substring(1).toUpperCase();
}

function removeGreySquares() {
    $('#board').find('.square-55d63').css('background', '').removeClass('selected');
}

function greySquare(square) {
    var squareEl = getSquareElement(square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
    squareEl.addClass('selected');
}

function mouseOverSquare(square, piece) {
    if(!window.gameOn)
        return;
    if (window.selectedPiece)
        return;
    removeGreySquares();

    if (!piece)
        return;

    if(!isTurn()
        || piece.search(window.toMove === 'white'
            ? /^w/
            : /^b/
        ) === -1){
        return;
    }

    window.socket.on('piece exists ' + square, function (exists) {
        if (exists) {
            greySquare(square);
            window.socket.on('allowed moves ' + square, function (moves) {
                moves.forEach(function (sq) {
                    greySquare(sq);
                });
            });

            window.socket.emit('allowed moves', square);
        }
    });

    window.socket.emit('piece exists', square);

}

function bindClickListeners() {
    $('.square-55d63').click(function () {
        if(!window.gameOn)
            return;
        var el = jQuery(this);
        var sq = el.data('square');
        var piece = el.find('img').data('piece');
        if (window.selectedPiece) {
            if(sq === window.selectedPiece){
                window.selectedPiece = null;
                el.css('background', '');
                greySquare(sq);
                return;
            }
            if (!el.hasClass('selected'))
                return;
            var move = window.selectedPiece + '-' + sq;
            window.board.move(move);
            window.selectedPiece = null;
            displayMoveInList(move);
            toggleMove();
            socket.emit('move', move);
            return removeGreySquares();
        }

        if( !isTurn() || piece.search(window.toMove === 'white' ? /^w/ : /^b/) === -1)
            return;
        window.selectedPiece = sq;
        el.css('background', '#cc0000');
    });
}

function displayMoveInList(move) {
    var square = move.split('-')[1];
    var whoseMove = window.toMove;
    setTimeout(function () {
        var piece = getPieceAtSquare(square);
        var pieceNotation = piece === 'P' ? '' : piece;
        if(whoseMove === 'white'){
            $('#moves-list').append('<li>'+pieceNotation + move+'</li>');
        }else{
            $('#moves-list').children().last().append(', '+pieceNotation + move);
        }
    }, 250);
}

function isTurn() {
    return window.toMove === window.board.orientation();
}

function toggleMove() {
    window.toMove = window.toMove === 'white' ? 'black' : 'white';
    $('#to-move').text(window.toMove + ' to move.');
}

init();