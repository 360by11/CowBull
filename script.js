let secretCode = '';
let attempts = 0;
let maxAttempts = 12;
const maxAttemptsFour = 12;
const maxAttemptsFive = 18;
let guesses = [];
let repeatableSecret = false;
let gameLength = 4; // Default to 4 digits
let end = false;
let isNumberOfDay = false;
let lastCheckedDate;
let dailyMode = 'non-repeatable'; // Can be 'non-repeatable' or 'repeatable'
let currentGuess = '';
let lastGuessResult = ''; // Add this at the top with other variables

const placeholderHTML = `
    <h3>Guess History</h3>
    <div class="placeholder-text">
        Your guesses will appear here...
        <ul>
            <li>Each guess will show Bulls (correct position) in <span style="color: blue">blue</span></li>
            <li>And Cows (correct number, wrong position) in <span style="color: purple">purple</span></li>
            <li>The Color codes are disabled during the Game and only be revealed when the Game is over!!!</li>
        </ul>
    </div>
`;

function updateMaxAttempts() {
    maxAttempts = gameLength === 4 ? maxAttemptsFour : maxAttemptsFive;
    const attemptsText = maxAttempts === 1 ? 'attempt' : 'attempts';
    document.querySelector('.attempts-info').textContent = `${maxAttempts} ${attemptsText} remaining`;
}

function handleGameLengthChange(length) {
    // Skip confirmation if game is over or no attempts made
    if (attempts > 0 && !end) {
        if (!confirm('Changing game length will start a new game. Current progress will be lost. Continue?')) {
            // If user cancels, revert the select to current gameLength
            document.querySelector('select[onchange*="handleGameLengthChange"]').value = gameLength;
            return;
        }
    }
    gameLength = parseInt(length);
    updateMaxAttempts();
    startNewGame();
}

function startNewGame() {
    // Reset game state
    attempts = 0;
    guesses = [];
    end = false;
    currentGuess = '';
    lastGuessResult = '';

    // Enable keyboard
    enableKeyboard();

    // Update max attempts based on game length
    updateMaxAttempts();

    // Clear results and show initial state
    document.getElementById('keyboard-result').innerHTML = '';
    updateGuessHistory(); // This will now show the placeholder text

    // Generate new secret code based on current settings
    if (isNumberOfDay) {
        const modeText = repeatableSecret ? "Repeatable" : "Non-Repeatable";
        alert(`Loading ${modeText} Secret of The Day (${gameLength} digits)...`);
        secretCode = generateDailyNumber(gameLength, repeatableSecret);
    } else {
        const modeText = repeatableSecret ? "Repeatable" : "Non-Repeatable";
        alert(`Generating ${modeText} ${gameLength} digit secret...`);
        if (repeatableSecret) {
            secretCode = generateSecretCode(gameLength);
        } else {
            const numbers = Array.from({ length: 10 }, (v, k) => k);
            const shuffledNumbers = shuffleArray(numbers);
            secretCode = shuffledNumbers.slice(0, gameLength).join('');
        }
    }

    // Update the result display with empty state
    updateCurrentGuessDisplay();
    console.log('Secret Code:', secretCode);

    // Switch to history tab when starting new game
    switchTab('history');
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
    // Skip confirmation if game is over or no attempts made
    if (attempts > 0 && !end) {
        if (!confirm('Changing secret type will start a new game. Current progress will be lost. Continue?')) {
            // If user cancels, revert the checkbox to current repeatableSecret state
            document.getElementById('repeatable-secret').checked = repeatableSecret;
            return;
        }
    }
    const repeatable = document.getElementById('repeatable-secret');
    repeatableSecret = repeatable.checked;
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
    
    // Update attempts remaining display immediately
    const remainingAttempts = maxAttempts - attempts;
    const attemptsText = remainingAttempts === 1 ? 'attempt' : 'attempts';
    document.querySelector('.attempts-info').textContent = `${remainingAttempts} ${attemptsText} remaining`;

    guesses.push({ guess: guess, bulls: bulls, cows: cows });
    updateGuessHistory();

    // Clear currentGuess after successful guess
    currentGuess = '';

    // Game over conditions
    if (bulls === secretCode.length) {
        end = true;
        updateGuessHistory();
        document.getElementById('keyboard-result').innerHTML = '<span class="blink-green">Congratulations! You guessed the secret code!</span>';
        lastGuessResult = '';
        disableKeyboardAfterGameOver();
    } else if (attempts >= maxAttempts) {
        end = true;
        updateGuessHistory();
        const gameOverMessage = '<span class="blink-red">Game Over! </span><span class="blink-purple">You have used all attempts. The secret code was </span><span class="blink-blue">' + secretCode + '</span>';
        document.getElementById('keyboard-result').innerHTML = gameOverMessage;
        lastGuessResult = '';
        disableKeyboardAfterGameOver();
    } else {
        lastGuessResult = `
            <div class="history-row">
                <span class="guess-number">${attempts}</span>
                <div class="guess-content">
                    <span class="guess-value">${guess}</span>
                    <div class="guess-result">
                        <span>Bulls: <span class="green">${bulls}</span></span>
                        <span>Cows: <span class="orange">${cows}</span></span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('keyboard-result').innerHTML = lastGuessResult;
        keepKeyboardVisible();
    }

    // Always switch to history tab after a guess
    switchTab('history');
}

function isNonRepeating(number) {
    return new Set(number).size === number.length;
}

function updateGuessHistory() {
    const historyContent = document.querySelector('#history-tab .history-content');
    
    if (guesses.length === 0) {
        historyContent.innerHTML = `
            <div class="placeholder-text">
                Your guesses will appear here...
                <ul>
                    <li>Each guess will show Bulls (correct position) in <span style="color: blue">blue</span></li>
                    <li>And Cows (correct number, wrong position) in <span style="color: purple">purple</span></li>
                    <li>The Color codes are disabled during the Game and only be revealed when the Game is over!!!</li>
                </ul>
            </div>
        `;
        return;
    }

    // Build the guess history HTML
    const historyHTML = guesses.map((guess, index) => {
        let guessValue = '';
        
        if (end) {
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
                <span class="guess-number">${index + 1}</span>
                <div class="guess-content">
                    <span class="guess-value">${guessValue}</span>
                    <div class="guess-result">
                        <span>Bulls: <span class="green">${guess.bulls}</span></span>
                        <span>Cows: <span class="orange">${guess.cows}</span></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    historyContent.innerHTML = historyHTML;

    // Smooth scroll to bottom with mobile support
    setTimeout(() => {
        historyContent.scrollTo({
            top: historyContent.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
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
    
    // Update the attempts info in the keyboard
    document.querySelector('.attempts-info').textContent = `${remainingAttempts} ${attemptsText} remaining`;
    
    if (currentGuess === '') {
        if (lastGuessResult) {
            // Show last guess result if available
            document.getElementById('keyboard-result').innerHTML = lastGuessResult;
        } else {
            // Show initial prompt with correct number of underscores
            const underscores = Array(gameLength).fill('_').join(' ');
            const resultHTML = `
                <div class="history-row">
                    <span class="guess-number">1</span>
                    <div class="guess-content">
                        <span class="guess-value">Your Guess? ${underscores}</span>
                        <div class="guess-result">
                            <span>Bulls: <span class="green">?</span></span>
                            <span>Cows: <span class="orange">?</span></span>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('keyboard-result').innerHTML = resultHTML;
        }
    } else {
        // Show current guess input with proper spacing
        const paddedGuess = currentGuess.split('').join(' ').padEnd(gameLength * 2 - 1, ' _');
        const resultHTML = `
            <div class="history-row">
                <span class="guess-number">${attempts + 1}</span>
                <div class="guess-content">
                    <span class="guess-value">${paddedGuess}</span>
                    <div class="guess-result">
                        <span>Bulls: <span class="green">?</span></span>
                        <span>Cows: <span class="orange">?</span></span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('keyboard-result').innerHTML = resultHTML;
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

// Update the keyboard event handling
document.getElementById('virtual-keyboard').addEventListener('click', (e) => {
    const button = e.target.closest('.key-btn');
    if (!button || button.disabled) return;
    handleKeyPress(button);
});

// Separate touch event handler for mobile
document.getElementById('virtual-keyboard').addEventListener('touchend', (e) => {
    e.preventDefault();
    const button = e.target.closest('.key-btn');
    if (!button || button.disabled) return;
    
    // Add visual feedback for touch
    button.style.opacity = '0.7';
    setTimeout(() => {
        button.style.opacity = button.disabled ? '0.5' : '1';
    }, 100);

    handleKeyPress(button);
}, { passive: false });

// Update select handlers for mobile
const selectElements = document.querySelectorAll('select');
selectElements.forEach(select => {
    select.addEventListener('touchend', (e) => {
        e.preventDefault();
        select.focus();
    }, { passive: false });
});

// Common function to handle key presses with mobile support
function handleKeyPress(button) {
    if (end && !button.dataset.action?.includes('new-game')) {
        return; // Prevent all actions except new game when game is over
    }

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
            case 'new-game':
                confirmNewGame();
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

// Prevent pinch zoom
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

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

function toggleDailyNumber() {
    // Skip confirmation if game is over or no attempts made
    if (attempts > 0 && !end) {
        if (!confirm('Changing to daily number will start a new game. Current progress will be lost. Continue?')) {
            // If user cancels, revert the checkbox to current isNumberOfDay state
            document.getElementById('number-of-day').checked = isNumberOfDay;
            return;
        }
    }
    const dailyCheckbox = document.getElementById('number-of-day');
    isNumberOfDay = dailyCheckbox.checked;
    startNewGame();
}

// Add new function to keep keyboard in view
function keepKeyboardVisible() {
    // Do nothing - keyboard is now fixed
}

function disableKeyboardAfterGameOver() {
    // Disable all number keys
    const numberKeys = document.querySelectorAll('.key-btn[data-key]');
    numberKeys.forEach(key => {
        key.disabled = true;
        key.style.opacity = '0.5';
        key.style.cursor = 'not-allowed';
    });

    // Disable Backspace, Clear, and Guess buttons
    const actionButtons = document.querySelectorAll('.key-btn[data-action]:not([data-action="new-game"])');
    actionButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    });
}

function enableKeyboard() {
    // Re-enable all keys
    const allKeys = document.querySelectorAll('.key-btn');
    allKeys.forEach(key => {
        key.disabled = false;
        key.style.opacity = '1';
        key.style.cursor = 'pointer';
    });
}

function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName)) {
            button.classList.add('active');
        }
    });

    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}