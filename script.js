// Game configuration
const config = {
    beginner: {
        rows: 9,
        cols: 9,
        mines: 10
    },
    intermediate: {
        rows: 16,
        cols: 16,
        mines: 40
    },
    expert: {
        rows: 16,
        cols: 30,
        mines: 99
    }
};

// Game state
let gameState = null;

// Sound state
let soundEnabled = true;

// DOM elements
const gameBoard = document.getElementById('game-board');
const minesCounter = document.getElementById('mines-count');
const timer = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const beginnerButton = document.getElementById('beginner');
const intermediateButton = document.getElementById('intermediate');
const expertButton = document.getElementById('expert');
const soundToggleButton = document.getElementById('sound-toggle');

// Custom function elements
const presetSelect = document.getElementById('preset-select');
const customFunctionInput = document.getElementById('custom-function');
const applyFunctionButton = document.getElementById('apply-function');
const testFunctionButton = document.getElementById('test-function');

// Modal elements
const gameOverModal = document.getElementById('game-over-modal');
const closeButton = document.querySelector('.close-button');
const gameResult = document.getElementById('game-result');
const finalTime = document.getElementById('final-time');
const finalDifficulty = document.getElementById('final-difficulty');
const finalRevealed = document.getElementById('final-revealed');
const finalFlagged = document.getElementById('final-flagged');
const playAgainButton = document.getElementById('play-again');
const changeDifficultyButton = document.getElementById('change-difficulty');

// Sound elements
const clickSound = document.getElementById('click-sound');
const flagSound = document.getElementById('flag-sound');
const explosionSound = document.getElementById('explosion-sound');
const winSound = document.getElementById('win-sound');

// Initialize the game
function initGame(difficulty = 'beginner') {
    // Stop any existing timer first
    if (gameState && gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Generate random colors for this game
    const cellColors = generateRandomColors(8);
    
    // Reset game state
    gameState = {
        board: [],
        mineLocations: [],
        revealed: 0,
        flagged: [],
        gameOver: false,
        difficulty: difficulty,
        startTime: null,
        timerInterval: null,
        minesCount: config[difficulty].mines,
        displayFunction: (gameState && gameState.displayFunction) || getDefaultDisplayFunction(),
        firstClick: true, // Track if this is the first click
        elapsedTime: 0, // Track elapsed time for statistics
        cellColors: cellColors // Store the random colors for this game
    };
    
    // Update mines counter
    updateMinesCounter();
    
    // Reset timer display
    document.getElementById('timer-value').textContent = '0';
    
    // Create the board
    createBoard();
    
    // Place mines (now done on first click)
    // placeMines() - removed from here
    
    // Calculate numbers (now done on first click)
    // calculateNumbers() - removed from here
    
    // Render the board
    renderBoard();
    
    // Hide the game over modal if it's open
    gameOverModal.style.display = 'none';
}

// Create the game board
function createBoard() {
    const { rows, cols } = config[gameState.difficulty];
    
    // Initialize the board with empty cells
    gameState.board = Array(rows).fill().map(() => Array(cols).fill(0));
}

// Place mines randomly on the board, avoiding the first clicked cell
function placeMines(firstRow, firstCol) {
    const { rows, cols, mines } = config[gameState.difficulty];
    const totalCells = rows * cols;
    
    // Reset mine locations
    gameState.mineLocations = [];
    
    // Create a safe zone around the first click
    const safeZone = [];
    for (let r = Math.max(0, firstRow - 1); r <= Math.min(rows - 1, firstRow + 1); r++) {
        for (let c = Math.max(0, firstCol - 1); c <= Math.min(cols - 1, firstCol + 1); c++) {
            safeZone.push(`${r},${c}`);
        }
    }
    
    // Place mines randomly, avoiding the safe zone
    while (gameState.mineLocations.length < mines) {
        const randomIndex = Math.floor(Math.random() * totalCells);
        const row = Math.floor(randomIndex / cols);
        const col = randomIndex % cols;
        
        const positionKey = `${row},${col}`;
        
        // Skip if this position is in the safe zone or already has a mine
        if (safeZone.includes(positionKey) || gameState.mineLocations.includes(positionKey)) {
            continue;
        }
        
        gameState.mineLocations.push(positionKey);
        // Mark the cell as a mine (-1)
        gameState.board[row][col] = -1;
    }
}

// Calculate numbers for each cell based on adjacent mines
function calculateNumbers() {
    const { rows, cols } = config[gameState.difficulty];
    
    // For each cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Skip if it's a mine
            if (gameState.board[row][col] === -1) continue;
            
            // Count adjacent mines
            let count = 0;
            
            // Check all 8 adjacent cells
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    // Skip the current cell
                    if (r === row && c === col) continue;
                    
                    // If adjacent cell is a mine, increment count
                    if (gameState.board[r][c] === -1) {
                        count++;
                    }
                }
            }
            
            // Set the cell value to the count of adjacent mines
            gameState.board[row][col] = count;
        }
    }
}

// Render the game board
function renderBoard() {
    const { rows, cols } = config[gameState.difficulty];
    
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Set the grid columns based on difficulty
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    
    // Create cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add event listeners
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Calculate board dimensions
    const cellSize = 30; // px
    const gapSize = 2; // px
    const boardWidth = cols * cellSize + (cols - 1) * gapSize;
    
    // Set the board width
    gameBoard.style.width = `${boardWidth}px`;
    
    // Adjust container width for proper framing
    // Add padding (20px on each side) to the calculation
    const containerWidth = boardWidth + 40;
    document.querySelector('.container').style.width = `${containerWidth}px`;
}

// Handle left click on a cell
function handleCellClick(event) {
    if (gameState.gameOver) return;
    
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Check if the cell is already revealed
    if (cell.classList.contains('revealed')) {
        // If it's a revealed number, try chord click
        handleChordClick(row, col);
        return;
    }
    
    // Check if the cell is flagged (can't reveal flagged cells)
    if (cell.classList.contains('flagged')) {
        return;
    }
    
    // First click protection
    if (gameState.firstClick) {
        gameState.firstClick = false;
        
        // Place mines (avoiding the first clicked cell)
        placeMines(row, col);
        
        // Calculate numbers
        calculateNumbers();
        
        // Start timer
        startTimer();
    }
    
    // Play click sound
    playSound(clickSound);
    
    // Reveal the cell
    revealCell(row, col);
}

// Handle right click (flag placement)
function handleRightClick(event) {
    event.preventDefault();
    
    if (gameState.gameOver) return;
    
    const cell = event.target;
    
    // Can't flag revealed cells
    if (cell.classList.contains('revealed')) {
        return;
    }
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const positionKey = `${row},${col}`;
    
    // Cycle through states: unflagged -> flagged -> question mark -> unflagged
    if (cell.classList.contains('flagged')) {
        // Change from flagged to question mark
        cell.classList.remove('flagged');
        cell.classList.add('question');
        gameState.flagged = gameState.flagged.filter(pos => pos !== positionKey);
        
        // Play flag sound
        playSound(flagSound);
    } else if (cell.classList.contains('question')) {
        // Change from question mark to unflagged
        cell.classList.remove('question');
        
        // Play flag sound
        playSound(flagSound);
    } else {
        // Change from unflagged to flagged
        cell.classList.add('flagged');
        gameState.flagged.push(positionKey);
        
        // Play flag sound
        playSound(flagSound);
    }
    
    // Update mines counter
    updateMinesCounter();
}

// Reveal a cell
function revealCell(row, col) {
    const { rows, cols } = config[gameState.difficulty];
    
    // Check if out of bounds
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return;
    }
    
    // Get the cell element
    const cellSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
    const cell = document.querySelector(cellSelector);
    
    // Check if already revealed or flagged
    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) {
        return;
    }
    
    // Mark as revealed
    cell.classList.add('revealed');
    gameState.revealed++;
    
    // Check if it's a mine
    if (gameState.board[row][col] === -1) {
        // Game over - player hit a mine
        cell.classList.add('mine');
        
        // Play explosion sound
        playSound(explosionSound);
        
        endGame(false);
        return;
    }
    
    // Display the number (if any)
    const count = gameState.board[row][col];
    if (count > 0) {
        // Use the custom display function
        const displayValue = gameState.displayFunction(count);
        cell.textContent = displayValue;
        
        // Set color based on the count value (1-8)
        // This ensures all cells with the same count have the same color
        if (count >= 1 && count <= 8) {
            cell.style.color = gameState.cellColors[count - 1];
        }
    }
    
    // If it's an empty cell, reveal adjacent cells
    if (count === 0) {
        // Reveal all 8 adjacent cells
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                // Skip the current cell
                if (r === row && c === col) continue;
                
                // Recursively reveal adjacent cells
                revealCell(r, c);
            }
        }
    }
    
    // Check if player has won
    checkWinCondition();
}

// Check if the player has won
function checkWinCondition() {
    const { rows, cols, mines } = config[gameState.difficulty];
    const totalCells = rows * cols;
    
    // Player wins if all non-mine cells are revealed
    if (gameState.revealed === totalCells - mines) {
        // Play win sound
        playSound(winSound);
        
        endGame(true);
    }
}

// End the game
function endGame(isWin) {
    gameState.gameOver = true;
    
    // Stop the timer and record final time
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    }
    
    if (isWin) {
        // Flag all mines
        gameState.mineLocations.forEach(pos => {
            const [row, col] = pos.split(',').map(Number);
            const cellSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
            const cell = document.querySelector(cellSelector);
            if (cell && !cell.classList.contains('flagged')) {
                cell.classList.add('flagged');
            }
        });
    } else {
        // Reveal all mines
        gameState.mineLocations.forEach(pos => {
            const [row, col] = pos.split(',').map(Number);
            const cellSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
            const cell = document.querySelector(cellSelector);
            if (cell && !cell.classList.contains('flagged')) {
                cell.classList.add('revealed');
                cell.classList.add('mine');
            }
        });
    }
    
    // Show game over modal with statistics
    showGameOverModal(isWin);
}

// Show the game over modal with statistics
function showGameOverModal(isWin) {
    // Set the game result text
    gameResult.textContent = isWin ? 'You Won!' : 'Game Over';
    gameResult.style.color = isWin ? '#4CAF50' : '#f44336';
    
    // Set the statistics
    finalTime.textContent = `${gameState.elapsedTime} seconds`;
    
    // Convert difficulty to title case
    const difficulty = gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
    finalDifficulty.textContent = difficulty;
    
    finalRevealed.textContent = gameState.revealed;
    finalFlagged.textContent = gameState.flagged.length;
    
    // Show the modal
    gameOverModal.style.display = 'block';
}

// Start the timer
function startTimer() {
    // Make sure we don't have an existing timer running
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Set the start time to now
    gameState.startTime = Date.now();
    
    // Start a new timer
    gameState.timerInterval = setInterval(() => {
        // Calculate elapsed time
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameState.startTime) / 1000);
        
        // Update the timer display
        document.getElementById('timer-value').textContent = elapsedSeconds;
    }, 1000);
}

// Update the mines counter
function updateMinesCounter() {
    const remainingMines = gameState.minesCount - gameState.flagged.length;
    document.getElementById('mines-value').textContent = remainingMines;
}

// Play a sound effect
function playSound(soundElement) {
    // Only play sound if enabled
    if (!soundEnabled) return;
    
    // Reset the sound to the beginning
    soundElement.currentTime = 0;
    
    // Play the sound
    soundElement.play().catch(error => {
        // Silently handle any autoplay restrictions
        console.log("Sound couldn't be played:", error);
    });
}

// ===== Custom Display Functions =====

// Get the default display function (just returns the number)
function getDefaultDisplayFunction() {
    return function(x) {
        return x;
    };
}

// Preset display functions
const presetFunctions = {
    default: function(x) {
        return x;
    },
    squared: function(x) {
        return x * x;
    },
    letters: function(x) {
        return String.fromCharCode(64 + x); // A=1, B=2, etc.
    },
    roman: function(x) {
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        return romanNumerals[x - 1];
    },
    emoji: function(x) {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
        return emojis[x - 1];
    }
};

// Apply the selected display function
function applyDisplayFunction() {
    // Check if there's content in the custom function input
    const customFunctionText = customFunctionInput.value.trim();
    
    // If Apply button was clicked and there's a custom function, use it
    if (customFunctionText) {
        try {
            // Check if the function body already contains a return statement
            const hasReturn = customFunctionText.includes('return ');
            
            // Create the function with proper return if needed
            const fullFunctionBody = hasReturn ? customFunctionText : `return ${customFunctionText}`;
            
            // Wrap the function to handle fraction display for non-integers
            const customFunction = function(x) {
                const result = new Function('x', fullFunctionBody)(x);
                
                // If the result is not an integer, display as a fraction
                if (typeof result === 'number' && !Number.isInteger(result)) {
                    return decimalToFraction(result);
                }
                
                return result;
            };
            
            // Test the function with a sample value
            const testValue = customFunction(1);
            
            // Set the custom function as the active display function
            gameState.displayFunction = customFunction;
            
            // Clear the preset selection to indicate we're using a custom function
            presetSelect.selectedIndex = -1;
        } catch (error) {
            alert('Error in custom function: ' + error.message);
            return;
        }
    } else {
        // Use the preset function selected in the dropdown
        const selectedFunction = presetSelect.value;
        gameState.displayFunction = presetFunctions[selectedFunction];
    }
    
    // If a game is in progress, update all revealed cells
    if (gameState.revealed > 0 && !gameState.gameOver) {
        updateRevealedCells();
    }
}

// Update all revealed cells with the new display function
function updateRevealedCells() {
    const { rows, cols } = config[gameState.difficulty];
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cellSelector = `.cell[data-row="${row}"][data-col="${col}"]`;
            const cell = document.querySelector(cellSelector);
            
            if (cell && cell.classList.contains('revealed') && !cell.classList.contains('mine')) {
                const count = gameState.board[row][col];
                if (count > 0) {
                    // Update the displayed value
                    cell.textContent = gameState.displayFunction(count);
                    
                    // Keep the same color based on count
                    if (count >= 1 && count <= 8) {
                        cell.style.color = gameState.cellColors[count - 1];
                    }
                }
            }
        }
    }
}

// Test the custom function
function testCustomFunction() {
    try {
        const functionBody = customFunctionInput.value.trim();
        
        // Check if the function body already contains a return statement
        const hasReturn = functionBody.includes('return ');
        
        // Create the function with proper return if needed
        const fullFunctionBody = hasReturn ? functionBody : `return ${functionBody}`;
        
        // Create a function that handles fraction display
        const testFunction = function(x) {
            const result = new Function('x', fullFunctionBody)(x);
            
            // If the result is not an integer, display as a fraction
            if (typeof result === 'number' && !Number.isInteger(result)) {
                return decimalToFraction(result);
            }
            
            return result;
        };
        
        // Test with values 1-8
        const results = [];
        for (let i = 1; i <= 8; i++) {
            results.push(`${i} → ${testFunction(i)}`);
        }
        
        alert('Function test results:\n' + results.join('\n'));
    } catch (error) {
        alert('Error in custom function: ' + error.message);
    }
}

// Convert decimal to fraction
function decimalToFraction(decimal) {
    if (decimal === 0) return "0";
    
    // Handle negative numbers
    const sign = decimal < 0 ? "-" : "";
    decimal = Math.abs(decimal);
    
    // For repeating decimals and very small numbers, limit precision
    const precision = 1e-6;
    
    // Find a rational approximation using continued fractions
    let n1 = 1, d1 = 0;
    let n2 = 0, d2 = 1;
    let b = decimal;
    
    do {
        let a = Math.floor(b);
        let aux = n1;
        n1 = a * n1 + n2;
        n2 = aux;
        aux = d1;
        d1 = a * d1 + d2;
        d2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - n1 / d1) > decimal * precision);
    
    // Format the result
    return sign + (d1 === 1 ? n1 : `${n1}/${d1}`);
}

// Handle preset selection change
presetSelect.addEventListener('change', function() {
    // Clear the custom function input to avoid confusion
    customFunctionInput.value = '';
    
    // Apply the selected preset
    applyDisplayFunction();
});

// Event listeners for custom function controls
applyFunctionButton.addEventListener('click', applyDisplayFunction);
testFunctionButton.addEventListener('click', testCustomFunction);

// Event listeners for difficulty buttons
beginnerButton.addEventListener('click', () => initGame('beginner'));
intermediateButton.addEventListener('click', () => initGame('intermediate'));
expertButton.addEventListener('click', () => initGame('expert'));
restartButton.addEventListener('click', () => initGame(gameState.difficulty));

// Event listeners for modal buttons
closeButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
});

playAgainButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    initGame(gameState.difficulty);
});

changeDifficultyButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    // Show difficulty selection UI or just default to beginner
    initGame('beginner');
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === gameOverModal) {
        gameOverModal.style.display = 'none';
    }
});

// Prevent context menu on right-click
gameBoard.addEventListener('contextmenu', (e) => e.preventDefault());

// Always show the custom function input
customFunctionInput.parentElement.style.display = 'flex';

// Initialize the game with beginner difficulty
initGame();
// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        soundToggleButton.textContent = '🔊';
        soundToggleButton.title = 'Mute Sound';
        soundToggleButton.classList.remove('muted');
    } else {
        soundToggleButton.textContent = '🔇';
        soundToggleButton.title = 'Enable Sound';
        soundToggleButton.classList.add('muted');
    }
    
    // Save preference to localStorage
    localStorage.setItem('minesweeperSoundEnabled', soundEnabled);
}

// Event listener for sound toggle button
soundToggleButton.addEventListener('click', toggleSound);

// Load sound preference from localStorage
if (localStorage.getItem('minesweeperSoundEnabled') === 'false') {
    toggleSound(); // This will set soundEnabled to false
}
// Handle chord click (clicking on a revealed number)
function handleChordClick(row, col) {
    const { rows, cols } = config[gameState.difficulty];
    
    // Get the cell value (number of adjacent mines)
    const cellValue = gameState.board[row][col];
    
    // If it's not a number (0 or mine), do nothing
    if (cellValue <= 0) return;
    
    // Count adjacent flags
    let flagCount = 0;
    const adjacentCells = [];
    
    // Check all 8 adjacent cells
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            // Skip the current cell
            if (r === row && c === col) continue;
            
            const cellSelector = `.cell[data-row="${r}"][data-col="${c}"]`;
            const adjacentCell = document.querySelector(cellSelector);
            
            if (adjacentCell) {
                // Add to adjacent cells list for potential revealing
                adjacentCells.push({ row: r, col: c, element: adjacentCell });
                
                // Count flags
                if (adjacentCell.classList.contains('flagged')) {
                    flagCount++;
                }
            }
        }
    }
    
    // If the number of adjacent flags matches the cell value, reveal all unflagged adjacent cells
    if (flagCount === cellValue) {
        let revealedSomething = false;
        
        // Reveal all unflagged adjacent cells
        for (const adjCell of adjacentCells) {
            if (!adjCell.element.classList.contains('flagged') && 
                !adjCell.element.classList.contains('revealed')) {
                
                revealedSomething = true;
                revealCell(adjCell.row, adjCell.col);
            }
        }
        
        // Play click sound if we revealed something
        if (revealedSomething) {
            playSound(clickSound);
        }
    }
}
// Generate random colors for the cells
function generateRandomColors(count) {
    const colors = [];
    const baseHues = [0, 30, 60, 120, 180, 210, 270, 300]; // Different hue values for variety
    
    // Shuffle the base hues to get a random order each game
    const shuffledHues = [...baseHues].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count; i++) {
        // Use HSL color model for better control
        const hue = shuffledHues[i];
        const saturation = 70 + Math.random() * 20; // 70-90%
        const lightness = 30 + Math.random() * 15;  // 30-45%
        
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
}
