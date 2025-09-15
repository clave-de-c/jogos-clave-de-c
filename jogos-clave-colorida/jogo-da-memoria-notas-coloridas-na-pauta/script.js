document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DA INTERFACE ---
    const starRatingContainer = document.getElementById('star-rating');
    const winPerformanceText = document.getElementById('win-performance-text');
    const instructionsOverlay = document.getElementById('instructions-overlay');
    const closeInstructionsBtn = document.getElementById('close-instructions-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const gameContainer = document.querySelector('.game-container');
    const siteFooter = document.querySelector('.site-footer');
    const memoryGame = document.querySelector('.memory-game');
    const movesSpan = document.querySelector('.moves');
    const startOverlay = document.getElementById('start-overlay');
    const winOverlay = document.getElementById('win-overlay');
    const winMessageText = document.getElementById('win-message-text');
    const restartButton = document.getElementById('restart-button');
    const levelButtons = document.querySelectorAll('.level-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');
    const backgroundMusic = document.getElementById('background-music');

    // --- DADOS DAS NOTAS (COM NOMES DAS IMAGENS) ---
    const allCardsData = {
        'C': { name: 'DÓ', imageName: 'DO-pauta.png' },
        'D': { name: 'RÉ', imageName: 'RE-pauta.png' },
        'E': { name: 'MI', imageName: 'MI-pauta.png' },
        'F': { name: 'FÁ', imageName: 'FA-pauta.png' },
        'G': { name: 'SOL', imageName: 'SOL-pauta.png' },
        'A': { name: 'LÁ', imageName: 'LA-pauta.png' },
        'B': { name: 'SI', imageName: 'SI-pauta.png' }
    };
    const levels = {
        easy: ['C', 'D', 'E', 'F'],
        medium: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    };

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let hasFlippedCard = false, lockBoard = false;
    let firstCard, secondCard;
    let moves = 0, totalPairs = 0, matchedPairs = 0;
    let currentLevel = '';

    // --- SONS DO JOGO ---
    const flipSound = new Howl({ src: ['flip.mp3'] });
    const matchSound = new Howl({ src: ['match.mp3'] });
    const winSound = new Howl({ src: ['win.mp3'] });

    // --- FUNÇÕES DO JOGO ---

    function calculateStars(moves, pairCount) {
        const optimalMoves = pairCount;
        if (moves <= optimalMoves * 1.5) { return 3; } 
        else if (moves <= optimalMoves * 2.5) { return 2; } 
        else { return 1; }
    }

    function displayBestScores() {
        for (const level in levels) {
            const bestScore = localStorage.getItem(`bestScore-pauta-${level}`);
            const scoreSpan = document.getElementById(`best-score-${level}`);
            if (scoreSpan) {
                scoreSpan.textContent = bestScore ? `Recorde: ${bestScore} movimentos` : '';
            }
        }
    }

    function checkAndSaveBestScore() {
        const bestScoreKey = `bestScore-pauta-${currentLevel}`;
        const currentBest = localStorage.getItem(bestScoreKey);
        if (!currentBest || moves < parseInt(currentBest)) {
            localStorage.setItem(bestScoreKey, moves);
            winMessageText.innerHTML = `Novo Recorde!<br>Você completou em ${moves} movimentos.`;
        } else {
            winMessageText.textContent = `Você completou em ${moves} movimentos!`;
        }
    }

    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
        this.classList.add('flip');
        flipSound.play();
        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        secondCard = this;
        incrementMoves();
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.key === secondCard.dataset.key;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        matchedPairs++;
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        setTimeout(() => matchSound.play(), 400);
        if (matchedPairs === totalPairs) {
            setTimeout(showWinScreen, 1000);
        }
        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200);
    }

    function startGame(level) {
        currentLevel = level;
        backgroundMusic.pause();
        startOverlay.classList.remove('show');
        gameContainer.classList.add('active');
        siteFooter.classList.add('active');
        resetGameStats();
        const levelCards = levels[level];
        totalPairs = levelCards.length;
        let gameCards = [];
        levelCards.forEach(noteKey => {
            gameCards.push({ key: noteKey, type: 'pauta' });
            gameCards.push({ key: noteKey, type: 'cor' });
        });
        memoryGame.className = 'memory-game';
        if (totalPairs === 7) {
            memoryGame.classList.add('level-medium');
        } else {
            memoryGame.classList.add(`level-${level}`);
        }
        createBoard(gameCards);
    }

    function createBoard(cards) {
        memoryGame.innerHTML = '';
        cards.sort(() => 0.5 - Math.random());
        cards.forEach(cardInfo => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.key = cardInfo.key;
            const frontFace = document.createElement('div');
            frontFace.classList.add('front-face');
            frontFace.innerHTML = '&#9835;';
            const backFace = document.createElement('div');
            backFace.classList.add('back-face');
            if (cardInfo.type === 'pauta') {
                const cardImage = document.createElement('img');
                cardImage.src = allCardsData[cardInfo.key].imageName;
                cardImage.alt = `Nota ${allCardsData[cardInfo.key].name}`;
                backFace.appendChild(cardImage);
            } else {
                backFace.classList.add('note-color');
                backFace.classList.add(`color-${cardInfo.key}`);
            }
            card.appendChild(frontFace);
            card.appendChild(backFace);
            card.addEventListener('click', flipCard);
            memoryGame.appendChild(card);
        });
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function resetGameStats() {
        moves = 0;
        matchedPairs = 0;
        movesSpan.textContent = `Movimentos: 0`;
        resetBoard();
    }

    function incrementMoves() {
        moves++;
        movesSpan.textContent = `Movimentos: ${moves}`;
    }

    function showWinScreen() {
        checkAndSaveBestScore();
        const stars = calculateStars(moves, totalPairs);
        const starElements = starRatingContainer.querySelectorAll('i');
        const performanceMessages = {
            3: "Excelente!",
            2: "Muito Bom!",
            1: "Bom Trabalho!"
        };
        starElements.forEach(star => star.classList.remove('filled'));
        for (let i = 0; i < stars; i++) {
            starElements[i].classList.add('filled');
        }
        winPerformanceText.textContent = performanceMessages[stars];
        winOverlay.classList.add('show');
        winSound.play();
        if (stars >= 2) {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }
    }

    function returnToMenu() {
        winOverlay.classList.remove('show');
        gameContainer.classList.remove('active');
        siteFooter.classList.remove('active');
        setTimeout(() => {
            displayBestScores();
            startOverlay.classList.add('show');
            memoryGame.innerHTML = '';
            backgroundMusic.currentTime = 0;
            backgroundMusic.play();
        }, 500);
    }

    // --- EVENT LISTENERS (CONECTORES DOS BOTÕES) ---
    levelButtons.forEach(button => {
        button.addEventListener('click', () => startGame(button.dataset.level));
    });
    
    instructionsBtn.addEventListener('click', () => {
        instructionsOverlay.classList.add('show');
    });
    
    closeInstructionsBtn.addEventListener('click', () => {
        instructionsOverlay.classList.remove('show');
    });
    
    // --- BOTÕES CORRIGIDOS ---
    restartButton.addEventListener('click', returnToMenu);
    exitGameBtn.addEventListener('click', returnToMenu);
    
    document.body.addEventListener('click', () => {
        if (backgroundMusic.paused && startOverlay.classList.contains('show')) {
            backgroundMusic.play().catch(e => console.log("A reprodução automática foi bloqueada pelo navegador."));
        }
    }, { once: true });

    displayBestScores();
});