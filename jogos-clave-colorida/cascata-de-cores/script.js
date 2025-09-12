document.addEventListener('DOMContentLoaded', () => {

    // --- MAPEAMENTO DOS ELEMENTOS ---
    const screens = {
        start: document.getElementById('start-screen'),
        instructions: document.getElementById('instructions-screen'),
        gameOver: document.getElementById('game-over-screen'),
        levelComplete: document.getElementById('level-complete-screen'),
        finalChallenge: document.getElementById('final-challenge-screen'),
        win: document.getElementById('win-screen'),
    };
    const muteButton = document.getElementById('mute-button');
    const audioBackground = document.getElementById('audio-background');
    const startButton = document.getElementById('start-button');
    const trainingButton = document.getElementById('training-button');
    const instructionsButton = document.getElementById('instructions-button');
    const restartButton = document.getElementById('restart-button');
    const backToMenuButtons = document.querySelectorAll('.back-to-menu');
    const gameBackButton = document.getElementById('back-button');
    const nextLevelButton = document.getElementById('next-level-button');
    const startFinalChallengeButton = document.getElementById('start-final-challenge-button');
    const playAgainButton = document.getElementById('play-again-button');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const winScoreDisplay = document.getElementById('win-score');
    const gameOverScoreDisplay = document.getElementById('game-over-score'); // Novo
    const noteFeedback = document.getElementById('note-feedback');
    const comboFeedback = document.getElementById('combo-feedback');
    const levelTitle = document.getElementById('level-title');
    const keys = document.querySelectorAll('.key');
    
    // --- DADOS E CONFIGURAÇÕES DO JOGO ---
    const NOTES_DATA = [
        { key: 'a', name: 'DÓ', color: 'color-0', audio: document.getElementById('audio-do') },
        { key: 's', name: 'RÉ', color: 'color-1', audio: document.getElementById('audio-re') },
        { key: 'd', name: 'MI', color: 'color-2', audio: document.getElementById('audio-mi') },
        { key: 'f', name: 'FÁ', color: 'color-3', audio: document.getElementById('audio-fa') },
    ];
    const errorAudio = document.getElementById('audio-erro');
    const LEVELS = [
        { name: "Nível 1: Iniciante", fallSpeed: 4500, melody: generateMelody(10, [0, 1]) },
        { name: "Nível 2: Aprendiz", fallSpeed: 4000, melody: generateMelody(15, [0, 1, 2]) },
        { name: "Nível 3: Intermediário", fallSpeed: 3500, melody: generateMelody(20, [0, 1, 2, 3]) },
        { name: "Nível 4: Desafio Final", fallSpeed: 2500, melody: generateMelody(30, [0, 1, 2, 3]) },
    ];
    const TRAINING_LEVEL_DATA = { 
        name: "Modo Treino", 
        fallSpeed: 3000, 
        melody: generateMelody(999, [0, 1, 2, 3]) 
    };

    // --- VARIÁVEIS DE ESTADO ---
    let totalScore, lives, songTimeout, currentNoteIndex, isGameActive, currentLevel, combo, isTrainingMode;
    let isMusicStarted = false;

    // --- FUNÇÕES DE CONTROLE DE TELA ---
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    }

    // --- FUNÇÕES DE MÚSICA E SOM ---
    function handleBackgroundMusic(action) {
        if (action === 'play' && isMusicStarted) {
            audioBackground.play().catch(e => console.error("Música de fundo:", e));
        } else if (action === 'stop') {
            audioBackground.pause();
        }
    }
    
    function toggleMute() {
        audioBackground.muted = !audioBackground.muted;
        muteButton.textContent = audioBackground.muted ? '🔇' : '🔊';
    }

    // --- FUNÇÕES PRINCIPAIS DO JOGO ---
    function startGame(levelIndex) {
        handleBackgroundMusic('stop');
        isTrainingMode = (levelIndex === -1);
        currentLevel = levelIndex;
        if (currentLevel === 0 || isTrainingMode) totalScore = 0;
        lives = 3;
        currentNoteIndex = 0;
        combo = 0;
        isGameActive = true;
        updateScoreDisplay();
        updateLives();
        updateComboDisplay();
        const levelData = isTrainingMode ? TRAINING_LEVEL_DATA : LEVELS[currentLevel];
        levelTitle.textContent = levelData.name;
        document.querySelectorAll('.note').forEach(note => note.remove());
        showScreen(null);
        playSong();
    }

    function endGame() {
        isGameActive = false;
        clearTimeout(songTimeout);
        gameOverScoreDisplay.textContent = totalScore; // Exibe a pontuação
        if (isTrainingMode) {
            restartButton.textContent = 'Tentar de Novo (Treino)';
        } else {
            restartButton.textContent = 'Tentar Nível de Novo';
        }
        showScreen('gameOver');
    }

    function backToMenu() {
        isGameActive = false;
        clearTimeout(songTimeout);
        showScreen('start');
        handleBackgroundMusic('play');
    }
    
    function completeLevel() {
        isGameActive = false;
        clearTimeout(songTimeout);
        if (isTrainingMode) return;
        if (currentLevel < LEVELS.length - 1) {
            if (currentLevel + 1 === LEVELS.length - 1) {
                showScreen('finalChallenge');
            } else {
                showScreen('levelComplete');
            }
        } else {
            winScoreDisplay.textContent = totalScore;
            triggerConfetti();
            showScreen('win');
        }
    }

    function playSong() {
        if (!isGameActive) return;
        const level = isTrainingMode ? TRAINING_LEVEL_DATA : LEVELS[currentLevel];
        if (currentNoteIndex >= level.melody.length) {
            setTimeout(() => { if (isGameActive) completeLevel(); }, level.fallSpeed);
            return;
        }
        const noteInfo = level.melody[currentNoteIndex];
        createNote(noteInfo.lane, level.fallSpeed);
        currentNoteIndex++;
        songTimeout = setTimeout(playSong, noteInfo.delay);
    }

    function createNote(laneIndex, fallSpeed) {
        const lane = document.getElementById(`lane-${laneIndex}`);
        const note = document.createElement('div');
        note.className = `note ${NOTES_DATA[laneIndex].color}`;
        note.style.animationDuration = `${fallSpeed}ms`;
        lane.appendChild(note);
        setTimeout(() => {
            if (document.body.contains(note)) {
                note.remove();
                if (isGameActive) handleMiss();
            }
        }, fallSpeed);
    }
    
    function handleInteraction(laneIndex) {
        if (!isGameActive || laneIndex === undefined) return;
        const keyElement = document.getElementById(`key-${laneIndex}`);
        const lane = document.getElementById(`lane-${laneIndex}`);
        const notesInLane = lane.querySelectorAll('.note');
        let hit = false;
        keyElement.classList.add('active');
        setTimeout(() => keyElement.classList.remove('active'), 100);
        notesInLane.forEach(note => {
            const notePosition = note.getBoundingClientRect().bottom;
            const keyPosition = keyElement.getBoundingClientRect().top;
            if (notePosition > keyPosition - 60 && notePosition < keyPosition + 60) {
                note.remove();
                combo++;
                const points = 10 + (Math.floor(combo / 5));
                totalScore += points;
                updateScoreDisplay();
                updateComboDisplay();
                playAudio(NOTES_DATA[laneIndex].audio);
                showNoteFeedback(laneIndex);
                showKeyFeedback(laneIndex);
                hit = true;
            }
        });
        if (!hit) handleMiss();
    }

    function handleMiss() {
        lives--;
        combo = 0;
        updateLives();
        updateComboDisplay();
        playAudio(errorAudio);
        if (lives <= 0) endGame();
    }

    function showNoteFeedback(laneIndex) {
        noteFeedback.textContent = NOTES_DATA[laneIndex].name + "!";
        noteFeedback.classList.add('show');
        setTimeout(() => noteFeedback.classList.remove('show'), 500);
    }

    function showKeyFeedback(laneIndex) {
        const keyElement = document.getElementById(`key-${laneIndex}`);
        keyElement.classList.add(`feedback-${NOTES_DATA[laneIndex].color}`);
        setTimeout(() => keyElement.classList.remove(`feedback-${NOTES_DATA[laneIndex].color}`), 200);
    }
    
    function updateScoreDisplay() { scoreDisplay.textContent = `Pontos: ${totalScore}`; }
    function updateLives() { livesDisplay.textContent = `Vidas: ${lives}`; }
    function updateComboDisplay() {
        if (combo > 1) {
            comboFeedback.textContent = `Combo x${combo}`;
            comboFeedback.classList.add('show');
        } else {
            comboFeedback.classList.remove('show');
        }
    }
    function playAudio(audioElement) {
        if(audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.error("Erro ao tocar áudio:", e));
        }
    }

    function generateMelody(noteCount, allowedLanes) {
        const melody = [];
        for (let i = 0; i < noteCount; i++) {
            const lane = allowedLanes[Math.floor(Math.random() * allowedLanes.length)];
            const delay = 500 + Math.random() * 300;
            melody.push({ lane, delay });
        }
        return melody;
    }

    function triggerConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        if (!confettiContainer) return;
        confettiContainer.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 5}s`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confettiContainer.appendChild(confetti);
        }
    }
    
    // --- EVENT LISTENERS ---
    function userFirstInteraction() {
        if (!isMusicStarted) {
            isMusicStarted = true;
            handleBackgroundMusic('play');
        }
    }
    
    startButton.addEventListener('click', () => {
        userFirstInteraction();
        startGame(0);
    });
    trainingButton.addEventListener('click', () => {
        userFirstInteraction();
        startGame(-1);
    });
    instructionsButton.addEventListener('click', () => {
        userFirstInteraction();
        showScreen('instructions');
    });
    restartButton.addEventListener('click', () => {
        const restartLevel = isTrainingMode ? -1 : currentLevel;
        startGame(restartLevel);
    });
    nextLevelButton.addEventListener('click', () => startGame(currentLevel + 1));
    startFinalChallengeButton.addEventListener('click', () => startGame(currentLevel + 1));
    playAgainButton.addEventListener('click', () => startGame(0));
    backToMenuButtons.forEach(btn => btn.addEventListener('click', backToMenu));
    gameBackButton.addEventListener('click', backToMenu);
    muteButton.addEventListener('click', toggleMute);
    
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const laneIndex = NOTES_DATA.findIndex(note => note.key === key);
        handleInteraction(laneIndex);
    });
    keys.forEach(key => {
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const laneIndex = parseInt(e.currentTarget.dataset.lane);
            handleInteraction(laneIndex);
        });
    });

    // --- ESTADO INICIAL ---
    showScreen('start');
});