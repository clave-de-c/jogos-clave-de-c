document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const mapScreen = document.getElementById('map-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreenModal = document.getElementById('end-screen');
    const instructionsModal = document.getElementById('instructions-modal');
    const grandFinaleModal = document.getElementById('grand-finale-modal');
    const nameModal = document.getElementById('name-modal');
    const certificateScreen = document.getElementById('certificate-screen');

    const instructionsButton = document.getElementById('instructions-button');
    const closeInstructionsButton = document.getElementById('close-instructions-button');
    const closeNameModalButton = document.getElementById('close-name-modal-button');
    const levelNodes = document.querySelectorAll('.level-node');
    const finalTestNode = document.getElementById('final-test-node');
    const exitButton = document.getElementById('exit-button');
    const continueButton = document.getElementById('continue-button');
    const restartButton = document.getElementById('restart-button');
    const resetButton = document.getElementById('reset-button');
    const startTestButton = document.getElementById('start-test-button');
    const playerNameInput = document.getElementById('player-name-input');
    const printCertificateButton = document.getElementById('print-certificate-button');
    const backToMapButton = document.getElementById('back-to-map-button');
    const muteButton = document.getElementById('mute-button');
    const backgroundMusic = document.getElementById('background-music');
    
    const challengeArea = document.getElementById('challenge-area');
    const interactionArea = document.getElementById('interaction-area');
    const roundsContainer = document.getElementById('rounds-container');
    const certPlayerName = document.getElementById('cert-svg-name');
    const certDate = document.getElementById('cert-svg-date');

    // --- ESTADO DO JOGO E CONSTANTES ---
    const PROGRESS_KEY = 'claveColoridaProgress';
    const ROUNDS_PER_LEVEL = 7;
    const TOTAL_LEVELS = 3;
    let playerProgress = { highestLevelUnlocked: 1 };
    let currentGameLevel = 1;
    let currentRound = 0;
    let currentChallengeType = 0;
    let targetNote, sequenceTarget = [], sequenceUser = [];
    let isMusicPlaying = false;
    
    // --- DEFINIÇÃO DE ÁUDIO ---
    const notes = [
        { name: 'Dó', color: 'var(--color-do)', sound: new Audio('audio/nota_do.mp3') },
        { name: 'Ré', color: 'var(--color-re)', sound: new Audio('audio/nota_re.mp3') },
        { name: 'Mi', color: 'var(--color-mi)', sound: new Audio('audio/nota_mi.mp3') },
        { name: 'Fá', color: 'var(--color-fa)', sound: new Audio('audio/nota_fa.mp3') },
        { name: 'Sol', color: 'var(--color-sol)', sound: new Audio('audio/nota_sol.mp3') },
        { name: 'Lá', color: 'var(--color-la)', sound: new Audio('audio/nota_la.mp3') },
        { name: 'Si', color: 'var(--color-si)', sound: new Audio('audio/nota_si.mp3') }
    ];
    const soundSuccess = new Audio('audio/som_acerto.mp3');
    const soundError = new Audio('audio/som_erro.mp3');
    const soundVictory = new Audio('audio/som_vitoria.mp3');

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error("Erro ao tocar áudio:", error));
    }

    // --- FUNÇÕES DE FLUXO E INICIALIZAÇÃO ---
    function init() {
        loadProgress();
        renderMap();
        showScreen('map');

        levelNodes.forEach(node => {
            node.addEventListener('click', () => {
                if (!isMusicPlaying && !backgroundMusic.muted) {
                    backgroundMusic.play().then(() => {
                        isMusicPlaying = true;
                    }).catch(e => console.log("Autoplay da música bloqueado."));
                }
                const level = node.dataset.level;
                if (!node.classList.contains('locked')) {
                    currentGameLevel = (level === 'final') ? 'final' : parseInt(level);
                    
                    if (currentGameLevel === 'final') {
                        nameModal.style.display = 'flex';
                    } else {
                        showScreen('game');
                        startGame();
                    }
                }
            });
        });
        
        exitButton.addEventListener('click', () => {
            showScreen('map');
        });
        instructionsButton.addEventListener('click', () => instructionsModal.style.display = 'flex');
        closeInstructionsButton.addEventListener('click', () => instructionsModal.style.display = 'none');
        closeNameModalButton.addEventListener('click', () => nameModal.style.display = 'none');
        continueButton.addEventListener('click', completeLevel);
        
        restartButton.addEventListener('click', () => {
            grandFinaleModal.style.display = 'none';
            renderMap();
            showScreen('map');
        });

        resetButton.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja resetar todo o seu progresso?')) {
                playerProgress.highestLevelUnlocked = 1;
                saveProgress();
                renderMap();
            }
        });

        startTestButton.addEventListener('click', () => {
            if (playerNameInput.value.trim() === '') {
                alert('Por favor, digite um nome!');
                return;
            }
            nameModal.style.display = 'none';
            showScreen('game');
            startGame();
        });

        printCertificateButton.addEventListener('click', () => {
            window.print();
        });

        backToMapButton.addEventListener('click', () => {
            showScreen('map');
        });

        muteButton.addEventListener('click', () => {
            backgroundMusic.muted = !backgroundMusic.muted;
            muteButton.textContent = backgroundMusic.muted ? '🔇' : '🔊';
        });
        
        createNoteButtons();
    }

    function showScreen(screenName) {
        mapScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        certificateScreen.style.display = 'none';
        
        if (screenName === 'map') {
            mapScreen.style.display = 'flex';
            if (isMusicPlaying && !backgroundMusic.muted) backgroundMusic.play();
        } else if (screenName === 'game') {
            gameScreen.style.display = 'flex';
            backgroundMusic.pause();
        } else if (screenName === 'certificate') {
            certificateScreen.style.display = 'flex';
            backgroundMusic.pause();
        }
    }

    function startGame() {
        currentRound = 0;
        renderRoundIndicators();
        setupChallenge();
    }

    function setupChallenge() {
        challengeArea.innerHTML = '';
        challengeArea.style.backgroundColor = '#f0f0f0';
        challengeArea.style.color = '#333';
        sequenceUser = [];
        targetNote = getRandomNote();
        
        currentChallengeType = (currentGameLevel === 'final') 
            ? Math.ceil(Math.random() * 3) 
            : currentGameLevel;

        switch(currentChallengeType) {
            case 1:
                challengeArea.style.backgroundColor = targetNote.color;
                playSound(targetNote.sound);
                break;
            case 2:
                challengeArea.textContent = targetNote.name;
                challengeArea.style.color = targetNote.color;
                break;
            case 3:
                challengeArea.textContent = '🎶';
                sequenceTarget = [getRandomNote(), getRandomNote()];
                setTimeout(() => playSequence(sequenceTarget), 1000);
                break;
        }
    }

    function handleNoteClick(clickedNote) {
        playSound(clickedNote.sound);
        if (currentChallengeType < 3) {
            if (clickedNote.name === targetNote.name) {
                handleCorrectAnswer();
            } else {
                handleWrongAnswer();
            }
        } else {
            sequenceUser.push(clickedNote);
            if (sequenceUser.length === sequenceTarget.length) {
                checkSequence();
            }
        }
    }

    function handleCorrectAnswer() {
        if (currentChallengeType !== 3) {
            playSound(soundSuccess);
        }
        currentRound++;
        renderRoundIndicators();

        if (currentRound >= ROUNDS_PER_LEVEL) {
            setTimeout(() => {
                playSound(soundVictory);
                endScreenModal.style.display = 'flex';
            }, 500);
        } else {
            setTimeout(setupChallenge, 1200);
        }
    }

    function handleWrongAnswer() {
        playSound(soundError);
        if (currentChallengeType === 3) {
            sequenceUser = [];
            setTimeout(() => playSequence(sequenceTarget), 1000);
        }
    }

    function completeLevel() {
        endScreenModal.style.display = 'none';

        if (currentGameLevel === 'final') {
            showCertificate();
            return;
        }

        const nextLevel = currentGameLevel + 1;
        if (nextLevel > playerProgress.highestLevelUnlocked) {
            playerProgress.highestLevelUnlocked = nextLevel;
            saveProgress();
        }
        
        if (currentGameLevel === TOTAL_LEVELS) {
            showGrandFinale();
        } else {
            renderMap();
            showScreen('map');
        }
    }

    function showGrandFinale() {
        grandFinaleModal.style.display = 'flex';
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }

    function showCertificate() {
        certPlayerName.textContent = playerNameInput.value.trim() || "Músico Incrível";
        certDate.textContent = new Date().toLocaleDateString('pt-BR');
        showScreen('certificate');
    }

    function renderRoundIndicators() {
        roundsContainer.innerHTML = '';
        for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'round-indicator';
            if (i < currentRound) indicator.classList.add('active');
            roundsContainer.appendChild(indicator);
        }
    }

    function renderMap() {
        levelNodes.forEach(node => {
            const level = node.dataset.level;
            if (level === 'final') return;
            const levelNum = parseInt(level);

            node.classList.remove('locked', 'completed');
            if (levelNum > playerProgress.highestLevelUnlocked) {
                node.classList.add('locked');
            } else if (levelNum < playerProgress.highestLevelUnlocked) {
                node.classList.add('completed');
            }
        });

        if (playerProgress.highestLevelUnlocked > TOTAL_LEVELS) {
            finalTestNode.classList.remove('locked');
        } else {
            finalTestNode.classList.add('locked');
        }
    }

    function saveProgress() {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(playerProgress));
    }

    function loadProgress() {
        const savedProgress = localStorage.getItem(PROGRESS_KEY);
        if (savedProgress) {
            playerProgress = JSON.parse(savedProgress);
        }
    }

    async function playSequence(sequence) {
        interactionArea.style.pointerEvents = 'none';
        for (const note of sequence) {
            challengeArea.style.backgroundColor = note.color;
            playSound(note.sound);
            await new Promise(r => setTimeout(r, 800));
            challengeArea.style.backgroundColor = '#f0f0f0';
            await new Promise(r => setTimeout(r, 200));
        }
        interactionArea.style.pointerEvents = 'auto';
    }

    function checkSequence() {
        const isCorrect = sequenceUser.every((note, index) => note.name === sequenceTarget[index].name);
        if (isCorrect) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
    }

    function createNoteButtons() {
        if (!interactionArea.firstChild) {
            notes.forEach(note => {
                const button = document.createElement('button');
                button.className = 'note-button';
                button.style.backgroundColor = note.color;
                button.addEventListener('click', () => handleNoteClick(note));
                interactionArea.appendChild(button);
            });
        }
    }
    
    function getRandomNote() {
        return notes[Math.floor(Math.random() * notes.length)];
    }

    init();
});