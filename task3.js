const crypto = require('crypto');
const readline = require('readline');
var AsciiTable = require('ascii-table');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (process.argv.length < 4 || process.argv.length % 2 === 0) {
    console.error('Invalid number of arguments. Please provide an odd number of unique moves.');
    process.exit(1);
}

const getKey = () => crypto.randomBytes(32).toString('hex');

const getHmac = (key, move) => {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(move);
    const hmacResult = hmac.digest('hex');
    return hmacResult;
}

const moves = process.argv.slice(2);

const key = getKey();
const computerMove = moves[Math.floor(Math.random() * moves.length)];
const hmacResult = getHmac(key, computerMove);


console.log('HMAC:', hmacResult);
console.log('Avaliable moves:');
moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
});
console.log('0 - exit');
console.log('? - help');

const getResult = (userMove, computerMove) => {
    const moveIndexDiff = Math.abs(moves.indexOf(userMove) - moves.indexOf(computerMove));
    const halfLength = Math.floor(moves.length / 2);

    if (moveIndexDiff === 0) {
        return 'Draw';
    } else if (moveIndexDiff <= halfLength) {
        return 'Win';
    } else {
        return 'Lose';
    }
};

const printHelpTable = () => {
    const table = new AsciiTable(`Table from the user's point of view:`);
    table.setHeading('v PC|User >', ...moves);

    for (const userMove of moves) {
        const row = [userMove];
        for (const computerMove of moves) {
            row.push(getResult(userMove, computerMove));
        }
        table.addRow(...row);
    }
    console.log(table.toString());
};

const getUserMove = () => {
    rl.question('Insert your move: ', (userInput) => {
        switch (userInput) {
            case '?':
                printHelpTable();
                getUserMove(); 
                break;
            case '0': 
                process.exit(1);
            default: 
                const moveIndex = parseInt(userInput, 10);
                if (isNaN(moveIndex) || moveIndex < 0 || moveIndex >= moves.length + 1) {
                    console.error('Invalid move. Please insert a valid move.');
                    getUserMove();
                } else {
                    rl.close();
                    handleUserMove(moveIndex);
                }
        }
    });
};

const handleUserMove = (userMoveIndex) => {
    const userMove = moves[userMoveIndex - 1];

    console.log('Your move:', userMove);
    console.log('Computer move:', computerMove);

    const result = getResult(userMove, computerMove);

    if (result === 'Draw') {
        console.log(`It's a draw`);
    } else if (result === 'Win') {
        console.log('You won!');
    } else {
        console.log('Computer won!');
    }

    console.log('Key:', key);
};

getUserMove();
