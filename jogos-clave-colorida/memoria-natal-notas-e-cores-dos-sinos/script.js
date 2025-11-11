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
    const exitGameBtn = document.getElementById('exit-game-btn');
    const backgroundMusic = document.getElementById('background-music');
    const startGameBtn = document.getElementById('start-game-btn');

    // ELEMENTOS DO BOTÃO DE MUDO
    const muteBtn = document.getElementById('mute-btn');
    const muteBtnIcon = muteBtn.querySelector('i');

    // --- DADOS DAS NOTAS (8 PARES) ---
    const allCardsData = {
        'C4': { name: 'DÓ', colorClass: 'color-C' },
        'D4': { name: 'RÉ', colorClass: 'color-D' },
        'E4': { name: 'MI', colorClass: 'color-E' },
        'F4': { name: 'FÁ', colorClass: 'color-F' },
        'G4': { name: 'SOL', colorClass: 'color-G' },
        'A4': { name: 'LÁ', colorClass: 'color-A' },
        'B4': { name: 'SI', colorClass: 'color-B' },
        'C5': { name: 'DÓ AGUDO', colorClass: 'color-C5' }
    };
    
    const cardKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    
    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let hasFlippedCard = false, lockBoard = false;
    let firstCard, secondCard;
    let moves = 0, totalPairs = 0, matchedPairs = 0;

    // --- SONS DO JOGO ---
    const flipSound = new Howl({ src: ['flip.mp3'] });
    const matchSound = new Howl({ src: ['match.mp3'] });
    const winSound = new Howl({ src: ['win.mp3'] });

    // --- FUNÇÕES DO JOGO ---

    // NOVA FUNÇÃO: TOGGLE MUTE
    function toggleMute() {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            muteBtnIcon.classList.remove('fa-volume-off');
            muteBtnIcon.classList.add('fa-volume-high');
            muteBtn.title = "Desligar Música";
        } else {
            backgroundMusic.muted = true;
            muteBtnIcon.classList.remove('fa-volume-high');
            muteBtnIcon.classList.add('fa-volume-off');
            muteBtn.title = "Ligar Música";
        }
    }

    function calculateStars(moves, pairCount) { const optimalMoves = pairCount; if (moves <= optimalMoves * 1.5) return 3; else if (moves <= optimalMoves * 2.5) return 2; else return 1; }
    
    function checkAndSaveBestScore() {
        const bestScoreKey = 'bestScore-natal'; 
        const currentBest = localStorage.getItem(bestScoreKey);
        
        if (!currentBest || moves < parseInt(currentBest)) {
            localStorage.setItem(bestScoreKey, moves);
            winMessageText.innerHTML = `Novo Recorde!<br>Você completou em ${moves} movimentos.`;
        } else {
            winMessageText.textContent = `Você completou em ${moves} movimentos! (Recorde: ${currentBest})`;
        }
    }

    function flipCard() { if (lockBoard || this === firstCard || this.classList.contains('matched')) return; this.classList.add('flip'); flipSound.play(); if (!hasFlippedCard) { hasFlippedCard = true; firstCard = this; return; } secondCard = this; incrementMoves(); checkForMatch(); }
    
    function checkForMatch() { let isMatch = firstCard.dataset.key === secondCard.dataset.key; isMatch ? disableCards() : unflipCards(); }
    
    function disableCards() { matchedPairs++; firstCard.classList.add('matched'); secondCard.classList.add('matched'); setTimeout(() => matchSound.play(), 400); if (matchedPairs === totalPairs) { setTimeout(showWinScreen, 1000); } resetBoard(); }
    
    function unflipCards() { lockBoard = true; setTimeout(() => { firstCard.classList.remove('flip'); secondCard.classList.remove('flip'); resetBoard(); }, 1200); }
    
    function startGame() {
        backgroundMusic.muted = false; 
        backgroundMusic.play().catch(e => console.log("A reprodução de áudio foi iniciada pela interação do usuário."));
        
        muteBtnIcon.classList.remove('fa-volume-off');
        muteBtnIcon.classList.add('fa-volume-high');
        muteBtn.title = "Desligar Música";

        startOverlay.classList.remove('show');
        gameContainer.classList.add('active');
        siteFooter.classList.add('active');
        resetGameStats();
        
        totalPairs = cardKeys.length; 
        let gameCards = [];
        cardKeys.forEach(noteKey => {
            gameCards.push({ key: noteKey, type: 'nome' }); 
            gameCards.push({ key: noteKey, type: 'cor' });  
        });
        
        memoryGame.className = 'memory-game';
        memoryGame.classList.add('level-medium'); 
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
            
            const backFace = document.createElement('div');
            backFace.classList.add('back-face');
            
            if (cardInfo.type === 'nome') {
                backFace.classList.add('note-name');
                backFace.textContent = allCardsData[cardInfo.key].name;
            } else { // type === 'cor'
                backFace.classList.add('note-color');
                backFace.classList.add(allCardsData[cardInfo.key].colorClass);
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
            try { 
                confetti({ 
                    particleCount: 150, 
                    spread: 90, 
                    origin: { y: 0.6 }, 
                    colors: ['#C82A2A', '#2A8C2A', '#FFFFFF']
                }); 
            } 
            catch (e) { console.error("Erro ao executar o efeito de confetes:", e); }
        }
    }
    
    function returnToMenu() {
        winOverlay.classList.remove('show');
        gameContainer.classList.remove('active');
        siteFooter.classList.remove('active');
        setTimeout(() => {
            startOverlay.classList.add('show');
            memoryGame.innerHTML = '';
            
            backgroundMusic.pause(); 
            backgroundMusic.currentTime = 0;
        }, 500);
    }
    
    // --- EVENT LISTENERS ---
    startGameBtn.addEventListener('click', startGame); 
    instructionsBtn.addEventListener('click', () => { instructionsOverlay.classList.add('show'); });
    closeInstructionsBtn.addEventListener('click', () => { instructionsOverlay.classList.remove('show'); });
    restartButton.addEventListener('click', returnToMenu);
    exitGameBtn.addEventListener('click', returnToMenu);
    muteBtn.addEventListener('click', toggleMute); 
});