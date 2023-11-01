document.addEventListener('DOMContentLoaded', function () {
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;

    const currentScoreElement = document.getElementById('current-score');

    let highScore = localStorage.getItem('2048-highscore') || 0;
    const highScoreElement = document.getElementById('high-score');
    highScoreElement.textContent = highScore;

    const gameOverElement = document.getElementById('game-over');

    /**
     * Updates the current score and high score if necessary.
     * @param {number} value - The value to add to the current score.
     */
    function updateScore(value) {
        currentScore += value;
        currentScoreElement.textContent = currentScore;
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreElement.textContent = highScore;
            localStorage.setItem('2048-highscore', highScore);
        }
    }

    /**
     * Resets the game by setting the current score to 0, updating the current score element, hiding the game over element, and initializing the game.
     */
    function restartGame() {
        currentScore = 0;
        currentScoreElement.textContent = currentScore;
        gameOverElement.style.display = 'none';
        initializeGame();
    }


    /**
     * The function initializes a game by creating a board, placing two random numbers on the board,
     * and rendering the board.
     */
    function initializeGame() {
        board = [...Array(size)].map(() => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    /**
     * Renders the game board on the screen.
     */
    function renderBoard() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value
                const currentValue = board[i][j];
                if (currentValue !== 0) {
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;


                    if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')) {
                        cell.classList.add('merged-tile');
                    }

                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }

            }

        }

        setTimeout(() => {
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => cell.classList.remove('merged-tile', 'new-tile'));
        }, 300);
    }

    /**
     * Places a random tile on the board.
     */
    function placeRandom() {
        const available = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() > 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);

            cell.classList.add('new-tile');


        }
    }


    /**
     * Moves the tiles on the board in the specified direction.
     * @param {string} direction - The direction to move the tiles in. Can be 'ArrowUp', 'ArrowDown', 'ArrowLeft', or 'ArrowRight'.
     */
    function move(direction) {
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }

                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                for (let j = 0; j < size; j++) {
                    if (row.join(',') !== newRow.join(',')) {
                        hasChanged = true;
                        board[i] = newRow;
                    }
                }
            }

        }
        if (hasChanged) {
            placeRandom();
            renderBoard();
            checkGameOver();
        }

    }

    /**
     * Transforms a line by merging adjacent cells with the same value and moving all cells towards the start or end of the line.
     * @param {number[]} line - The line to transform.
     * @param {boolean} moveTowardsStart - Whether to move cells towards the start (true) or end (false) of the line.
     * @returns {number[]} The transformed line.
     */
    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0);

        if (!moveTowardsStart) {
            newLine.reverse();
        }
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                updateScore(newLine[i]);
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < size) {
            newLine.push(0);
        }
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        return newLine;
    }

    
    /**
     * Checks if the game is over by iterating through the board and checking for empty cells or adjacent cells with the same value.
     * If the game is over, displays the game over element.
     */
    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    return;
                }
                if (j < size - 1 && board[i][j] === board[i][j + 1]) {
                    return;
                }
                if (i < size - 1 && board[i][j] === board[i + 1][j]) {
                    return;
                }
            }
        }

        gameOverElement.style.display = 'flex';

    }


    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            move(event.key);
        }
    });

    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();
});