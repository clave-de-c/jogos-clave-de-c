document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS ---
    const screens = { menu: document.getElementById('menu-screen'), instructions: document.getElementById('instructions-screen'), game: document.getElementById('game-screen'), end: document.getElementById('end-screen') };
    const levelUpOverlay = document.getElementById('level-up-overlay');
    const levelUpText = document.getElementById('level-up-text');
    const endTitleElement = document.getElementById('end-title');
    const newHighscoreMessage = document.getElementById('new-highscore-message');
    const highscoreMenuDisplay = document.getElementById('highscore-menu');
    const levelHudItem = document.getElementById('level-hud-item');
    
    const buttons = {
        levelsPlay: document.getElementById('levels-play-button'), infinitePlay: document.getElementById('infinite-play-button'),
        instructions: document.getElementById('instructions-button'), backFromInstructions: document.getElementById('back-to-menu-from-instructions'),
        backFromGame: document.getElementById('back-to-menu-from-game'), restart: document.getElementById('restart-button'),
        backFromEnd: document.getElementById('back-to-menu-from-end'),
    };

    const displays = {
        level: document.getElementById('level-display'), score: document.getElementById('score-display'),
        lives: document.getElementById('lives-display'), finalScore: document.getElementById('final-score'),
        prompt: document.getElementById('prompt'),
    };
    
    const playArea = document.getElementById('play-area');
    const sounds = { correct: document.getElementById('correct-sound'), wrong: document.getElementById('wrong-sound') };

    let score = 0, lives = 3, level = 1, highscore = 0;
    let currentPromptNote = '', gameInterval, isPaused = false, currentGameMode = 'levels';
    let infiniteModeSpeed, wrongNotesInARow = 0; // NOVA VARIÁVEL

    const noteFigures = { 'Semibreve': 'imagens/semibreve.png', 'Mínima': 'imagens/minima.png', 'Semínima': 'imagens/seminima.png', 'Colcheia': 'imagens/colcheia.png', 'Semicolcheia': 'imagens/semicolcheia.png', 'Fusa': 'imagens/fusa.png', 'Semifusa': 'imagens/semifusa.png' };
    const levelConfig = {
        1: { notes: ['Semibreve', 'Mínima'], interval: 1900 }, 2: { notes: ['Semibreve', 'Mínima', 'Semínima'], interval: 1700 }, 3: { notes: ['Mínima', 'Semínima', 'Colcheia'], interval: 1500 }, 4: { notes: ['Semínima', 'Colcheia', 'Semicolcheia'], interval: 1300 }, 5: { notes: ['Colcheia', 'Semicolcheia', 'Fusa'], interval: 1100 }, 6: { notes: ['Semicolcheia', 'Fusa', 'Semifusa'], interval: 1000 }, 7: { notes: ['Colcheia', 'Semicolcheia', 'Fusa', 'Semifusa'], interval: 900 }
    };
    const WIN_SCORE_LEVEL_7 = 350;

    function playSound(soundElement) {
        if (soundElement && soundElement.src) {
            soundElement.currentTime = 0;
            const playPromise = soundElement.play();
            if (playPromise !== undefined) { playPromise.catch(error => { console.error("Erro ao tocar áudio:", error); }); }
        }
    }

    function showScreen(screenName) {
        for (let key in screens) { screens[key].classList.add('hidden'); screens[key].classList.remove('active'); }
        screens[screenName].classList.remove('hidden'); screens[screenName].classList.add('active');
    }

    function startGame() {
        score = 0; lives = 3; isPaused = false; wrongNotesInARow = 0;
        if (currentGameMode === 'levels') {
            level = 1; levelHudItem.classList.remove('hidden'); startLevel();
        } else {
            levelHudItem.classList.add('hidden'); startInfiniteMode();
        }
        showScreen('game');
    }
    
    function startLevel() {
        isPaused = false; clearInterval(gameInterval); playArea.innerHTML = '';
        updateHUD();
        const availableNotes = levelConfig[level].notes;
        currentPromptNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        displays.prompt.textContent = `Pegue a ${currentPromptNote}`;
        gameInterval = setInterval(createNote, levelConfig[level].interval);
    }
    
    function startInfiniteMode() {
        isPaused = false; clearInterval(gameInterval); playArea.innerHTML = '';
        updateHUD();
        infiniteModeSpeed = 1500;
        const availableNotes = ['Semínima', 'Colcheia', 'Semicolcheia', 'Fusa', 'Semifusa'];
        currentPromptNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        displays.prompt.textContent = `Pegue a ${currentPromptNote}`;
        gameInterval = setInterval(createNote, infiniteModeSpeed);
    }

    function showLevelUpNotification() {
        isPaused = true; clearInterval(gameInterval);
        levelUpText.textContent = `Nível ${level}`;
        levelUpOverlay.classList.remove('hidden');
        setTimeout(() => { levelUpOverlay.classList.add('hidden'); startLevel(); }, 2000);
    }
    
    function createNote() {
        if (isPaused) return;
        const noteElement = document.createElement('img');
        noteElement.classList.add('note');
        const availableNotes = (currentGameMode === 'levels') ? levelConfig[level].notes : ['Semínima', 'Colcheia', 'Semicolcheia', 'Fusa', 'Semifusa'];
        
        // --- MUDANÇA: LÓGICA DE GARANTIA DA FIGURA CORRETA ---
        let noteType;
        if (wrongNotesInARow >= 3) { // Força a nota correta após 3 erradas
            noteType = currentPromptNote;
            wrongNotesInARow = 0;
        } else {
            noteType = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            if (noteType === currentPromptNote) {
                wrongNotesInARow = 0;
            } else {
                wrongNotesInARow++;
            }
        }

        noteElement.src = noteFigures[noteType]; noteElement.dataset.type = noteType;
        noteElement.style.left = `${Math.random() * (playArea.offsetWidth - 120)}px`;
        noteElement.style.top = `-120px`;
        playArea.appendChild(noteElement);
        animateNote(noteElement);
    }

    function animateNote(noteElement) {
        let topPosition = -120;
        const animationSpeed = 6;
        const animation = setInterval(() => {
            if (isPaused) { clearInterval(animation); return; }
            topPosition += animationSpeed; noteElement.style.top = `${topPosition}px`;
            if (topPosition > playArea.offsetHeight) {
                clearInterval(animation);
                if(noteElement.parentNode) { noteElement.remove(); }
            }
        }, 30);
    }

    function handleNoteClick(event) {
        if (!event.target.classList.contains('note') || isPaused) return;
        const clickedNoteType = event.target.dataset.type;
        
        if (clickedNoteType === currentPromptNote) {
            score += 10;
            playSound(sounds.correct);
            event.target.remove();
            
            wrongNotesInARow = 0; // Zera o contador ao acertar

            if (currentGameMode === 'levels') {
                if (level === 7 && score >= WIN_SCORE_LEVEL_7) { endGame(true); return; }
                if (score > 0 && score % 50 === 0 && levelConfig[level + 1]) { level++; showLevelUpNotification(); }
            } else {
                if (score > 0 && score % 30 === 0 && infiniteModeSpeed > 500) {
                    infiniteModeSpeed -= 50; clearInterval(gameInterval); gameInterval = setInterval(createNote, infiniteModeSpeed);
                }
            }
            updateHUD();
            const availableNotes = (currentGameMode === 'levels') ? levelConfig[level].notes : ['Semínima', 'Colcheia', 'Semicolcheia', 'Fusa', 'Semifusa'];
            currentPromptNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            displays.prompt.textContent = `Pegue a ${currentPromptNote}`;
        } else {
            lives--;
            updateHUD();
            playSound(sounds.wrong);
            event.target.remove();
            if (lives <= 0) { endGame(false); }
        }
    }
    
    function updateHUD() {
        displays.score.textContent = score;
        displays.lives.textContent = lives;
        if (currentGameMode === 'levels') {
            const maxLevel = Object.keys(levelConfig).length;
            displays.level.textContent = Math.min(level, maxLevel);
        }
    }
    
    function endGame(isWinner = false) {
        isPaused = true; clearInterval(gameInterval); playArea.innerHTML = '';
        if (isWinner) { endTitleElement.textContent = "Parabéns, Você Venceu!"; } 
        else { endTitleElement.textContent = "Suas vidas acabaram!"; }
        
        if (currentGameMode === 'infinite') {
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('figurasRitmicasHighscore_infinito', highscore);
                newHighscoreMessage.classList.remove('hidden');
            } else { newHighscoreMessage.classList.add('hidden'); }
            loadHighscore();
        } else { newHighscoreMessage.classList.add('hidden'); }
        displays.finalScore.textContent = score;
        showScreen('end');
    }
    
    function loadHighscore() {
        const savedScore = localStorage.getItem('figurasRitmicasHighscore_infinito');
        highscore = savedScore ? parseInt(savedScore, 10) : 0;
        highscoreMenuDisplay.textContent = highscore;
    }

    buttons.levelsPlay.addEventListener('click', () => { currentGameMode = 'levels'; startGame(); });
    buttons.infinitePlay.addEventListener('click', () => { currentGameMode = 'infinite'; startGame(); });
    buttons.restart.addEventListener('click', startGame);
    buttons.instructions.addEventListener('click', () => showScreen('instructions'));
    buttons.backFromInstructions.addEventListener('click', () => showScreen('menu'));
    buttons.backFromGame.addEventListener('click', () => { isPaused = true; clearInterval(gameInterval); showScreen('menu'); });
    buttons.backFromEnd.addEventListener('click', () => showScreen('menu'));
    playArea.addEventListener('click', handleNoteClick);
    
    showScreen('menu');
    loadHighscore();
});