
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const celebration = document.getElementById('celebration');
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvc'; // 'pvc' or 'pvp'
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Sound effects
    const sounds = {
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        draw: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3')
    };
    
    // Initialize the game
    function initGame() {
        createBoard();
        updateStatus();
    }
    
    function createBoard() {
        board.innerHTML = '';
        gameState.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.setAttribute('data-index', index);
            cellElement.addEventListener('click', handleCellClick);
            board.appendChild(cellElement);
        });
    }
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;
        
        playSound('click');
        updateCell(clickedCell, clickedCellIndex);
        checkResult();
        
        // If in PVC mode and it's computer's turn
        if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 800);
        }
    }
    
    function updateCell(cell, index) {
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
    }
    
    function checkResult() {
        let roundWon = false;
        let winningCombo = [];
        
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningCombo = condition;
                break;
            }
        }
        
        if (roundWon) {
            highlightWinningCells(winningCombo);
            announceWinner(currentPlayer);
            gameActive = false;
            return;
        }
        
        if (!gameState.includes('')) {
            announceDraw();
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
    
    function highlightWinningCells(combo) {
        combo.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning-cell');
        });
    }
    
    function announceWinner(winner) {
        playSound('win');
        
        const message = document.createElement('div');
        message.className = `winner-message ${winner.toLowerCase()}-win`;
        message.innerHTML = `
            <div>Player ${winner} Wins!</div>
            <div style="font-size: 1.5rem; margin-top: 1rem;">🎉 Congratulations! 🎊</div>
        `;
        document.body.appendChild(message);
        
        // Confetti celebration
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: winner === 'X' ? ['#FF2E63'] : ['#08D9D6']
        });
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    function announceDraw() {
        playSound('draw');
        
        const message = document.createElement('div');
        message.className = 'winner-message draw';
        message.innerHTML = `
            <div>It's a Draw!</div>
            <div style="font-size: 1.5rem; margin-top: 1rem;">😄 Try Again! 😊</div>
        `;
        document.body.appendChild(message);
        
        confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FFD700']
        });
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    function makeComputerMove() {
        if (!gameActive) return;
        
        // Simple AI with some intelligence
        let bestSpot;
        
        // 1. First check if computer can win
        bestSpot = findWinningMove('O');
        
        // 2. If not, block player's winning move
        if (!bestSpot && bestSpot !== 0) {
            bestSpot = findWinningMove('X');
        }
        
        // 3. If neither, take center if available
        if (!bestSpot && bestSpot !== 0 && gameState[4] === '') {
            bestSpot = 4;
        }
        
        // 4. If not, take a random corner
        if (!bestSpot && bestSpot !== 0) {
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(index => gameState[index] === '');
            if (availableCorners.length > 0) {
                bestSpot = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }
        
        // 5. If all else fails, random move
        if (!bestSpot && bestSpot !== 0) {
            const emptySpots = gameState
                .map((spot, index) => spot === '' ? index : null)
                .filter(index => index !== null);
            if (emptySpots.length > 0) {
                bestSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            }
        }
        
        if (bestSpot || bestSpot === 0) {
            const cell = document.querySelector(`[data-index="${bestSpot}"]`);
            playSound('click');
            updateCell(cell, bestSpot);
            checkResult();
        }
    }
    
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const spots = [gameState[a], gameState[b], gameState[c]];
            
            if (spots.filter(s => s === player).length === 2 && spots.includes('')) {
                const emptyIndex = condition[spots.indexOf('')];
                return emptyIndex;
            }
        }
        return null;
    }
    
    function playSound(type) {
        if (sounds[type]) {
            sounds[type].currentTime = 0;
            sounds[type].play();
        }
    }
    
    function updateStatus() {
        if (gameMode === 'pvp') {
            status.textContent = `Player ${currentPlayer}'s turn`;
        } else {
            status.textContent = currentPlayer === 'X' ? 'Your turn (X)' : 'Computer thinking...';
        }
    }
    
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        updateStatus();
        createBoard();
        
        const existingMessage = document.querySelector('.winner-message');
        if (existingMessage) existingMessage.remove();
    }
    
    // Event listeners
    resetButton.addEventListener('click', resetGame);
    
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            gameMode = button.dataset.mode;
            resetGame();
        });
    });
    
    // Initialize the game
    initGame();
});