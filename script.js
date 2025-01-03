let secretCode = '';
let attempts = 0;
let maxAttempts = 12;
const maxAttemptsFour = 12;
const maxAttemptsFive = 18;
let guesses = [];
let repeatableSecret = false;
let gameLength = 4; // Default to 4 digits
let end = false;
let guessResult = null;
let guessResultEnd = null;

function startNewGame() {
    if (repeatableSecret) {
        alert("Generating Repeatable " + gameLength + " digit secret...");
        startGame(gameLength);
    } else {
        alert("Generating Non-Repeatable " + gameLength + " digit secret...");
        startGameWithNonRepeatableSecret(gameLength);
    }

    // Clear user input
    document.getElementById('guess').value = '';
    end = false;
    guessResult = null;
    guessResultEnd = null;
}

function startGame(digits) {
    secretCode = generateSecretCode(digits);
    attempts = 0;
    guesses = [];
    document.getElementById('result').innerHTML = '';
    document.getElementById('guess-history').innerHTML = '';
    console.log('Secret Code:', secretCode);
}

function startGameWithNonRepeatableSecret(digits) {
    const numbers = Array.from({ length: 10 }, (v, k) => k); // Array from 0 to 9
    const shuffledNumbers = shuffleArray(numbers);
    secretCode = shuffledNumbers.slice(0, digits).join('');
    attempts = 0;
    guesses = [];
    document.getElementById('result').innerHTML = '';
    document.getElementById('guess-history').innerHTML = '';
    console.log('Secret Code:', secretCode);
}

function generateSecretCode(digits) {
    if (repeatableSecret) {
        let code = '';
        const numbers = Array.from({ length: 10 }, (v, k) => k); // Array from 0 to 9
        for (let i = 0; i < digits; i++) {
            const index = Math.floor(Math.random() * numbers.length);
            code += numbers.splice(index, 1)[0]; // Remove the selected number from the array
        }
        return code;
    } else {
        const numbers = Array.from({ length: 10 }, (v, k) => k); // Array from 0 to 9
        const shuffledNumbers = shuffleArray(numbers);
        return shuffledNumbers.slice(0, digits).join('');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function toggleSecretType() {
    const repeatable = document.getElementById('repeatable-secret');
    if (repeatable.checked) {
        repeatableSecret = true;
    } else {
        repeatableSecret = false;
    }
    // Restart the game with the new settings
    startNewGame();
}

function toggleGameLength() {
    const fourDigits = document.getElementById('four-digits');
    if (fourDigits.checked) {
        gameLength = 4;
        maxAttempts = maxAttemptsFour;
    } else {
        gameLength = 5;
        maxAttempts = maxAttemptsFive;
    }
    // Restart the game with the new settings
    startNewGame();
}

function checkGuess() {
    const guess = document.getElementById('guess').value;
    const validLength = (guess.length === gameLength);
    const validDigits = (!isNaN(guess));
    const validGuess = (repeatableSecret || isNonRepeating(guess));
    if (!validLength || !validDigits || !validGuess) {
        alert('Please enter a valid ' + gameLength + '-digit number' + (repeatableSecret ? '' : ' with non-repeating digits.'));
        return;
    }
    if (attempts >= maxAttempts) {
        alert('You have reached the maximum number of attempts.');
        return;
    }
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secretCode[i]) {
            bulls++;
        } else if (secretCode.includes(guess[i])) {
            cows++;
        }
    }
    attempts++;
    guesses.push({ guess: guess, bulls: bulls, cows: cows });
    updateGuessHistory();

    document.getElementById('result').innerHTML = '<br>Result : Bulls: <span class="green">' + bulls + '</span>, Cows: <span class="orange">' + cows + '</span>';
    if (bulls === secretCode.length) {
        document.getElementById('new-game').innerHTML = '<button onclick="startNewGame()">New Game</button>';
    } else if (attempts >= maxAttempts) {
        document.getElementById('new-game').innerHTML = '<button onclick="startNewGame()">New Game</button>';
    }


    // for blink
    if (bulls === secretCode.length) {
        end = true;
        updateGuessHistory();
        document.getElementById('result').innerHTML = '<br><br><span class="blink-green">Congratulations! You guessed the secret code!</span>';
        document.getElementById('new-game').innerHTML = '<button onclick="startNewGame()">New Game</button>';
    } else if (attempts >= maxAttempts) {
        end = true;
        updateGuessHistory();
        const gameOverMessage = '<br><span class="blink-red">Game Over! </span><span class="blink-purple">You have used all attempts. The secret code was </span><span class="blink-blue">' + secretCode + '</span>';
        document.getElementById('result').innerHTML = gameOverMessage;
        document.getElementById('new-game').innerHTML = '<button onclick="startNewGame()">New Game</button>';
    }


}

function isNonRepeating(number) {
    return new Set(number).size === number.length;
}

function updateGuessHistory() {
    const historyDiv = document.getElementById('guess-history');
    historyDiv.innerHTML = '<br clear="left"/><h3>Guess History</h3>';


    guesses.forEach(function (guess, index) {

        //end = false
        let guessResult = '<p>Guess ' + (index + 1) + ': ' + guess.guess;
        //For Debug --> guessResult += ' - Bulls: <span class="green">' + guess.bulls + '</span>, Cows: <span class="orange">' + guess.cows + ' End : ' + end + '</span></p>';
        guessResult += ' - Bulls: <span class="green">' + guess.bulls + '</span>, Cows: <span class="orange">' + guess.cows + '</span></p>';
        //end = true
        let guessResultEnd = '<p>Guess ' + (index + 1) + ': ';
        for (let i = 0; i < guess.guess.length; i++) {
            if (guess.guess[i] === secretCode[i]) {
                //For Debug --> guessResultEnd += '<span class="green">' + guess.guess[i] + ' End : ' + end + '</span>'; // Bull (correct position)
                guessResultEnd += '<span class="green">' + guess.guess[i] + '</span>'; // Bull (correct position)
            } else if (secretCode.includes(guess.guess[i])) {
                //For Debug --> guessResultEnd += '<span class="orange">' + guess.guess[i] + ' End : ' + end + '</span>'; // Cow (wrong position)
                guessResultEnd += '<span class="orange">' + guess.guess[i] + '</span>'; // Cow (wrong position)
            } else {
                guessResultEnd += guess.guess[i]; // Not a Bull or Cow
            }
        }

        //For Debug --> guessResultEnd += ' - Bulls: <span class="green">' + guess.bulls + '</span>, Cows: <span class="orange">' + guess.cows + ' End : ' + end + '</span></p>';
        guessResultEnd += ' - Bulls: <span class="green">' + guess.bulls + '</span>, Cows: <span class="orange">' + guess.cows + '</span></p>';

        if (end) {
            historyDiv.innerHTML += guessResultEnd;
        }
        else {
            historyDiv.innerHTML += guessResult;
        }

    });

}

window.onload = function () {
    startNewGame();
};
