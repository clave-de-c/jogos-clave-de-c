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

    // --- DADOS DAS NOTAS (8 PARES) ---
    // Ajuste os nomes dos arquivos (imageName) se os seus forem diferentes
    const allCardsData = {
        'C4': { name: 'DÓ', imageName: 'sino-DO.png' },
        'D4': { name: 'RÉ', imageName: 'sino-RE.png' },
        'E4': { name: 'MI', imageName: 'sino-MI.png' },
        'F4': { name: 'FÁ', imageName: 'sino-FA.png' },
        'G4': { name: 'SOL', imageName: 'sino-SOL.png' },
        'A4': { name: 'LÁ', imageName: 'sino-LA.png' },
        'B4': { name: 'SI', imageName: 'sino-SI.png' },
        'C5': { name: 'DÓ AGUDO', imageName: 'sino-DO-AGUDO.png' } // Oitava nota
    };
    
    // Níveis atualizados (médio com 8 pares)
    const levels = {
        easy: ['C4', 'D4', 'E4', 'F4'],
        medium: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
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

    function calculateStars(moves, pairCount) { const optimalMoves = pairCount; if (moves <= optimalMoves * 1.5) return 3; else if (moves <= optimalMoves * 2.5) return 2; else return 1; }
    
    // Chave de recorde atualizada para 'bestScore-sinos'
    function displayBestScores() { for (const level in levels) { const bestScore = localStorage.getItem(`bestScore-sinos-${level}`); const scoreSpan = document.getElementById(`best-score-${level}`); if (scoreSpan) { scoreSpan.textContent = bestScore ? `Recorde: ${bestScore} movimentos` : ''; } } }
    
    function checkAndSaveBestScore() {
        const bestScoreKey = `bestScore-sinos-${currentLevel}`;
        const currentBest = localStorage.getItem(bestScoreKey);
        if (!currentBest || moves < parseInt(currentBest)) {
            localStorage.setItem(bestScoreKey, moves);
            winMessageText.innerHTML = `Novo Recorde!<br>Você completou em ${moves} movimentos.`;
        } else {
            winMessageText.textContent = `Você completou em ${moves} movimentos!`;
        }
    }

    function flipCard() { if (lockBoard || this === firstCard || this.classList.contains('matched')) return; this.classList.add('flip'); flipSound.play(); if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; } secondCard = this; incrementMoves(); checkForMatch(); }
    
    function checkForMatch() { let isMatch = firstCard.dataset.key === secondCard.dataset.key; isMatch ? disableCards() : unflipCards(); }
    
    function disableCards() { matchedPairs++; firstCard.classList.add('matched'); secondCard.classList.add('matched'); setTimeout(() => matchSound.play(), 400); if (matchedPairs === totalPairs) { setTimeout(showWinScreen, 1000); } resetBoard(); }
    
    function unflipCards() { lockBoard = true; setTimeout(() => { firstCard.classList.remove('flip'); secondCard.classList.remove('flip'); resetBoard(); }, 1200); }
    
    // Lógica de 'startGame' atualizada para 'sino' e 'nome'
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
            gameCards.push({ key: noteKey, type: 'sino' }); // Carta de Imagem do Sino
            gameCards.push({ key: noteKey, type: 'nome' }); // Carta de Nome da Nota
        });
        memoryGame.className = 'memory-game';
        if (totalPairs === 8) { // Lógica para 8 pares
            memoryGame.classList.add('level-medium'); 
        } else { // Nível fácil
            memoryGame.classList.add(`level-${level}`);
        }
        createBoard(gameCards);
    }
    
    // Lógica de 'createBoard' atualizada para 'sino' e 'nome'
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
            
            if (cardInfo.type === 'sino') {
                const cardImage = document.createElement('img');
                cardImage.src = allCardsData[cardInfo.key].imageName;
                cardImage.alt = `Sino ${allCardsData[cardInfo.key].name}`;
                backFace.appendChild(cardImage);
            } else { // type === 'nome'
                backFace.classList.add('note-name');
                backFace.textContent = allCardsData[cardInfo.key].name;
            }
            
            card.appendChild(frontFace);
            card.appendChild(backFace);
            card.addEventListener('click', flipCard);
            memoryGame.appendChild(card);
        });
    }
    
    function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }
    
    function resetGameStats() { moves = 0; matchedPairs = 0; movesSpan.textContent = `Movimentos: 0`; resetBoard(); }
    
    function incrementMoves() { moves++; movesSpan.textContent = `Movimentos: ${moves}`; }
    
    function showWinScreen() {
        checkAndSaveBestScore();
        const stars = calculateStars(moves, totalPairs);
        const starElements = starRatingContainer.querySelectorAll('i');
        const performanceMessages = { 3: "Excelente!", 2: "Muito Bom!", 1: "Bom Trabalho!" };
        starElements.forEach(star => star.classList.remove('filled'));
        for (let i = 0; i < stars; i++) {
            starElements[i].classList.add('filled');
        }
        winPerformanceText.textContent = performanceMessages[stars];
        winSound.play();
        winOverlay.classList.add('show');
        if (stars >= 2) {
            try { confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); } 
            catch (e) { console.error("Erro ao executar o efeito de confetes:", e); }
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
    
    // --- EVENT LISTENERS ---
    levelButtons.forEach(button => { button.addEventListener('click', () => startGame(button.dataset.level)); });
    instructionsBtn.addEventListener('click', () => { instructionsOverlay.classList.add('show'); });
    closeInstructionsBtn.addEventListener('click', () => { instructionsOverlay.classList.remove('show'); });
    restartButton.addEventListener('click', returnToMenu);
    exitGameBtn.addEventListener('click', returnToMenu);
    document.body.addEventListener('click', () => { if (backgroundMusic.paused && startOverlay.classList.contains('show')) { backgroundMusic.play().catch(e => console.log("A reprodução automática foi bloqueada pelo navegador.")); } }, { once: true });
    
    displayBestScores();
});