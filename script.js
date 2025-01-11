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
let isNumberOfDay = false;
let lastCheckedDate;
let dailyMode = 'non-repeatable'; // Can be 'non-repeatable' or 'repeatable'
let currentGuess = '';

const placeholderHTML = `
    <h3>Guess History</h3>
    <div class="placeholder-text">
        Your guesses will appear here...
        <ul>
            <li>Each guess will show Bulls (correct number, correct position) in <span style="color: blue">blue</span></li>
            <li>And Cows (correct number, wrong position) in <span style="color: purple">purple</span></li>
        </ul>
        <div class="example-section">
            <p><u>Example:</u></p>
            <p> 4 Digits - If Secret code is 1234</p>
            <div class="example-guess">
                <span>Guess: 5<span style="color: blue">2</span><span style="color: purple">4</span><span style="color: purple">1</span></span>
                <span class="example-result">→ <span style="color: blue">1</span> Bull, <span style="color: purple">1</span> Cow</span>
            </div>
            <div class="example-explanation">
                <div>• <span style="color: blue">2</span> is in correct position (<span style="color: blue">blue</span>)</div>
                <div>• <span style="color: purple">1</span> and <span style="color: purple">4</span> exists but wrong position (<span style="color: purple">purple</span>)</div>
                <div>• <span class="unmatched">5</span> is not in the Secret code</div>
            </div>
            <p> </p>
            <p> 5 Digits - If Secret code is 12345</p>
            <div class="example-guess">
                <span>Guess: 6<span style="color: blue">2</span><span style="color: purple">4</span>7<span style="color: blue">5</span></span>
                <span class="example-result">→ <span style="color: blue">2</span> Bull, <span style="color: purple">1</span> Cow</span>
            </div>
            <div class="example-explanation">
                <div>• <span style="color: blue">2</span> and <span style="color: blue">5</span> are in correct position</div>
                <div>• <span style="color: purple">4</span> exists but wrong position (<span style="color: purple">purple</span>)</div>
                <div>• <span class="unmatched">6</span> and <span class="unmatched">7</span> are not in the Secret code</div>
            </div>
           
        </div>
    </div>
`;

function startNewGame() {
    // Reset game state
    attempts = 0;
    guesses = [];
    end = false;
    guessResult = null;
    guessResultEnd = null;
    currentGuess = '';

    // Clear results and show initial state
    document.getElementById('result').innerHTML = '';  // This will show the empty state with underscores
    document.getElementById('guess-history').innerHTML = placeholderHTML;

    // Generate new secret code based on current settings
    if (isNumberOfDay) {
        const modeText = repeatableSecret ? "Repeatable" : "Non-Repeatable";
        alert(`Loading ${modeText} Secret of The Day (${gameLength} digits)...`);
        secretCode = generateDailyNumber(gameLength, repeatableSecret);
    } else {
        const modeText = repeatableSecret ? "Repeatable" : "Non-Repeatable";
        alert(`Generating ${modeText} ${gameLength} digit secret...`);
        if (repeatableSecret) {
            startGame(gameLength);
        } else {
            startGameWithNonRepeatableSecret(gameLength);
        }
    }

    // Update the result display with empty state
    updateCurrentGuessDisplay();
    console.log('Secret Code:', secretCode);
}

function startGame(digits) {
    secretCode = generateSecretCode(digits);
    attempts = 0;
    guesses = [];
    document.getElementById('result').innerHTML = '';
    document.getElementById('guess-history').innerHTML = placeholderHTML;
    console.log('Secret Code:', secretCode);
}

function startGameWithNonRepeatableSecret(digits) {
    const numbers = Array.from({ length: 10 }, (v, k) => k);
    const shuffledNumbers = shuffleArray(numbers);
    secretCode = shuffledNumbers.slice(0, digits).join('');
    attempts = 0;
    guesses = [];
    document.getElementById('result').innerHTML = '';
    document.getElementById('guess-history').innerHTML = placeholderHTML;
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
    repeatableSecret = repeatable.checked;
    
    // Start a new game with current settings
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
    
    // Update the current display before starting new game
    currentGuess = '';
    updateCurrentGuessDisplay();
    
    // Restart the game with the new settings
    startNewGame();
}

function checkGuess() {
    const guess = currentGuess;
    
    // Add validation for empty guess
    if (!guess) {
        alert('Please enter a guess first.');
        return;
    }

    // Check if maximum attempts reached
    if (attempts >= maxAttempts) {
        alert('You have reached the maximum number of attempts.');
        return;
    }

    const validLength = (guess.length === gameLength);
    const validDigits = (!isNaN(guess));
    const validGuess = (repeatableSecret || isNonRepeating(guess));

    // Check for duplicate guess
    const isDuplicate = guesses.some(g => g.guess === guess);
    if (isDuplicate) {
        alert('You have already tried this number. Try a different one!');
        currentGuess = '';  // Clear current guess
        updateCurrentGuessDisplay();
        return;
    }

    if (!validLength || !validDigits || !validGuess) {
        alert('Please enter a valid ' + gameLength + '-digit number' + (repeatableSecret ? '' : ' with non-repeating digits.'));
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

    // Increment attempts before pushing to guesses array
    attempts++;
    guesses.push({ guess: guess, bulls: bulls, cows: cows });
    updateGuessHistory();

    // Clear currentGuess after successful guess
    currentGuess = '';

    // Game over conditions
    if (bulls === secretCode.length) {
        end = true;
        updateGuessHistory();
        document.getElementById('result').innerHTML = '<span class="blink-green">Congratulations! You guessed the secret code!</span>';
        scrollToResult();
    } else if (attempts >= maxAttempts) {
        end = true;
        updateGuessHistory();
        const gameOverMessage = '<span class="blink-red">Game Over! </span><span class="blink-purple">You have used all attempts. The secret code was </span><span class="blink-blue">' + secretCode + '</span>';
        document.getElementById('result').innerHTML = gameOverMessage;
        scrollToResult();
    } else {
        // Show latest guess and remaining attempts
        const remainingAttempts = maxAttempts - attempts;
        const attemptsText = remainingAttempts === 1 ? 'attempt' : 'attempts';
        const resultHTML = `
            <div class="result-container">
                <div class="guess-content">
                    <span class="guess-number">${attempts}</span>
                    <span class="guess-value">${guess}</span>
                    <span>→</span>
                    <div class="guess-result">
                        <span>Bulls: <span class="green">${bulls}</span></span>
                        <span>Cows: <span class="orange">${cows}</span></span>
                    </div>
                </div>
                <div class="attempts-info">
                    ${remainingAttempts} ${attemptsText} remaining
                </div>
            </div>
        `;
        document.getElementById('result').innerHTML = resultHTML;
        keepKeyboardVisible();
    }
}

function isNonRepeating(number) {
    return new Set(number).size === number.length;
}

function updateGuessHistory() {
    const historyDiv = document.getElementById('guess-history');
    
    if (guesses.length === 0) {
        // Show placeholder when there are no guesses
        historyDiv.innerHTML = placeholderHTML;
        return;
    }

    historyDiv.innerHTML = `
        <h3>Guess History</h3>
        <div class="history-content">
            ${guesses.map((guess, index) => {
                let guessValue = '';
                
                if (end) {
                    // Color code each digit when game ends
                    for (let i = 0; i < guess.guess.length; i++) {
                        if (guess.guess[i] === secretCode[i]) {
                            guessValue += `<span class="green">${guess.guess[i]}</span>`;
                        } else if (secretCode.includes(guess.guess[i])) {
                            guessValue += `<span class="orange">${guess.guess[i]}</span>`;
                        } else {
                            guessValue += guess.guess[i];
                        }
                    }
                } else {
                    guessValue = guess.guess;
                }

                return `
                    <div class="history-row">
                        <span class="guess-number">${index + 1}.</span>
                        <div class="guess-content">
                            <span class="guess-value">${guessValue}</span>
                            <div class="guess-result">
                                <span>Bulls: <span class="green">${guess.bulls}</span></span>
                                <span>Cows: <span class="orange">${guess.cows}</span></span>
                            </div>
                        </div>
                    </div>`;
            }).join('')}
        </div>
    `;

    // Scroll to the latest guess
    const historyContent = historyDiv.querySelector('.history-content');
    historyContent.scrollTop = historyContent.scrollHeight;
}

function appendNumber(num) {
    if (currentGuess.length < gameLength) {
        currentGuess += num;
        updateCurrentGuessDisplay();
        keepKeyboardVisible();
    }
}

function backspace() {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentGuessDisplay();
    keepKeyboardVisible();
}

function clearInput() {
    currentGuess = '';
    updateCurrentGuessDisplay();
    keepKeyboardVisible();
}

function updateCurrentGuessDisplay() {
    const remainingAttempts = maxAttempts - attempts;
    const attemptsText = remainingAttempts === 1 ? 'attempt' : 'attempts';
    
    if (currentGuess === '') {
        // Show only remaining attempts when no current guess
        document.getElementById('result').innerHTML = `
            <div class="attempts-info">
                ${remainingAttempts} ${attemptsText} remaining
            </div>
        `;
    } else {
        // Show both current guess and remaining attempts
        const resultHTML = `
            <div class="result-container">
                <div class="guess-content">
                    <span class="guess-number">${attempts + 1}</span>
                    <span class="guess-value">${currentGuess.padEnd(gameLength, '_')}</span>
                    <span>→</span>
                    <div class="guess-result">
                        <span>Bulls: <span class="green">?</span></span>
                        <span>Cows: <span class="orange">?</span></span>
                    </div>
                </div>
                <div class="attempts-info">
                    ${remainingAttempts} ${attemptsText} remaining
                </div>
            </div>
        `;
        document.getElementById('result').innerHTML = resultHTML;
    }
}

// Add keyboard support
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === 'Backspace') {
        backspace();
    } else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission if any
        checkGuess();
    } else if (event.key === 'Delete') {
        clearInput();
    }
});

// Update the keyboard event handling to prevent double inputs
document.getElementById('virtual-keyboard').addEventListener('click', (e) => {
    // Prevent click events on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
        return;
    }

    const button = e.target.closest('.key-btn');
    if (!button) return;

    handleKeyPress(button);
});

// Separate touch event handler
document.getElementById('virtual-keyboard').addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default to avoid any click events
    const button = e.target.closest('.key-btn');
    if (!button) return;

    handleKeyPress(button);
}, { passive: false });

// Common function to handle key presses
function handleKeyPress(button) {
    if (button.dataset.key) {
        appendNumber(button.dataset.key);
    } else if (button.dataset.action) {
        switch (button.dataset.action) {
            case 'backspace':
                backspace();
                break;
            case 'clear':
                clearInput();
                break;
            case 'enter':
                checkGuess();
                break;
        }
    }
}

// Update touch event handling for mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('key-btn')) {
        e.preventDefault();  // Prevent double-tap zoom
    }
}, { passive: false });

// Prevent zoom on double tap
document.addEventListener('dblclick', function(e) {
    e.preventDefault();
});

function generateDailyNumber(digits, repeatable) {
    // Get current UTC date as string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Create a seed from the date, digits, and mode
    let seed = 0;
    const seedString = today + digits + (repeatable ? 'R' : 'N');
    for (let i = 0; i < seedString.length; i++) {
        seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
        seed = seed & seed; // Convert to 32-bit integer
    }
    seed = Math.abs(seed);

    if (repeatable) {
        // Generate repeatable number
        let result = '';
        for (let i = 0; i < digits; i++) {
            // Use the seed to generate each digit
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            result += (seed % 10).toString();
        }
        return result;
    } else {
        // Generate non-repeatable number
        let numbers = Array.from({length: 10}, (_, i) => i);
        
        // Fisher-Yates shuffle with seeded random
        for (let i = numbers.length - 1; i > 0; i--) {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            const j = Math.floor((seed / 0x7fffffff) * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        return numbers.slice(0, digits).join('');
    }
}

function checkDayChange() {
    const currentDate = new Date().getUTCDate();
    if (lastCheckedDate !== currentDate && isNumberOfDay) {
        lastCheckedDate = currentDate;
        startNewGame();
    }
}

// Add this function to update UTC time
function updateUTCTime() {
    const now = new Date();
    
    // Format the date and time in 24-hour format
    const date = now.toUTCString().split(' ').slice(0, 4).join(' '); // Get date part
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    // Combine date and time
    const formattedTime = `${date} ${hours}:${minutes}:${seconds} UTC`;
    
    document.getElementById('utc-time').textContent = formattedTime;
}

// Update the window.onload function with a longer delay
window.onload = function () {
    // Initialize the game
    lastCheckedDate = new Date().getUTCDate();
    startNewGame();
    
    // Initial UTC time update
    updateUTCTime();
    
    // Update UTC time every second
    setInterval(updateUTCTime, 1000);
    
    // Check for day change every minute
    setInterval(checkDayChange, 60000);

    // Initial keyboard positioning
    keepKeyboardVisible();
};

function confirmNewGame() {
    // Skip confirmation if game is over (all attempts used or won)
    if (end) {
        startNewGame();
        return;
    }
    
    // Only ask for confirmation if game is in progress
    if (attempts > 0) {
        if (confirm('Are you sure you want to start a new game? Current progress will be lost.')) {
            startNewGame();
        }
    } else {
        startNewGame();
    }
}

function updateResult(guess, bulls, cows) {
    const resultHTML = `
        <div class="guess-content">
            <span class="guess-value">${guess}</span>
            <span>→</span>
            <div class="guess-result">
                <span>Bulls: <span class="green">${bulls}</span></span>
                <span>Cows: <span class="orange">${cows}</span></span>
            </div>
        </div>
    `;
    document.getElementById('result').innerHTML = resultHTML;
}

function toggleDailyNumber() {
    const dailyCheckbox = document.getElementById('number-of-day');
    isNumberOfDay = dailyCheckbox.checked;
    
    // Start a new game with current settings
    startNewGame();
}

// Add this function to handle scrolling to result
function scrollToResult() {
    // Only scroll on game over
    if (end) {
        const resultElement = document.getElementById('result');
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Add new function to keep keyboard in view
function keepKeyboardVisible() {
    const keyboardElement = document.getElementById('virtual-keyboard');
    keyboardElement.scrollIntoView({ behavior: 'instant', block: 'end' });
}