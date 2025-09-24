document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS ---
    const screens = {
        map: document.getElementById('map-screen'),
        game: document.getElementById('game-screen'),
        certificate: document.getElementById('certificate-screen')
    };
    const modals = {
        tutorial: document.getElementById('tutorial-modal'),
        instructions: document.getElementById('instructions-modal'),
        name: document.getElementById('name-modal'),
        endLevel: document.getElementById('end-level-modal')
    };
    const levelNodes = document.querySelectorAll('.level-node');
    const gameTitle = document.getElementById('game-title');
    const challengeArea = document.getElementById('challenge-area');
    const interactionArea = document.getElementById('interaction-area');
    const roundsContainer = document.getElementById('rounds-container');
    const tutorialTitle = document.getElementById('tutorial-title');
    const tutorialInteractionArea = document.getElementById('tutorial-interaction-area');
    const sounds = {
        grave: document.getElementById('sound-grave'), agudo: document.getElementById('sound-agudo'),
        dinamica: document.getElementById('sound-dinamica'), duracao: document.getElementById('sound-duracao'),
        success: document.getElementById('sound-success'), error: document.getElementById('sound-error'),
        victory: document.getElementById('sound-victory'),
    };

    // --- ESTADO DO JOGO ---
    const PROGRESS_KEY = 'jornadaInicialDosSonsProgress';
    let playerProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { highestLevelUnlocked: 1 };
    let gameState = { currentLevel: 0, currentRound: 0, currentChallenge: null, roundsPerLevel: 7 };
    let isSoundPlaying = false;

    // --- CONFIGURAÇÕES DOS NÍVEIS ---
    const gameConfigs = {
        1: { title: "Estação 1: Altura", choices: { 'grave': 'Grave ⬇️', 'agudo': 'Agudo ⬆️' } },
        2: { title: "Estação 2: Intensidade", choices: { 'fraco': 'Fraco 🐭', 'forte': 'Forte 🐘' } },
        3: { title: "Estação 3: Duração", choices: { 'curto': 'Curto 🐰', 'longo': 'Longo 🐢' } },
        'final': { title: "Desafio Final 🏆" }
    };
    
    // --- FUNÇÕES ---
    function playSound(soundElement, options = {}) {
        soundElement.currentTime = 0;
        soundElement.play();
        if (options.isShort) {
            setTimeout(() => { soundElement.pause(); }, 80);
        }
    }

    function showScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        if(screens[screenId]) screens[screenId].classList.remove('hidden');
    }

    function showTutorial(level) {
        gameState.currentLevel = level;
        const config = gameConfigs[level];
        tutorialTitle.textContent = `Aquecimento: ${config.title}`;
        tutorialInteractionArea.innerHTML = '';
        for (const choice in config.choices) {
            const button = document.createElement('button');
            button.className = 'btn-choice';
            button.innerHTML = config.choices[choice];
            button.onclick = () => {
                if(isSoundPlaying) return;
                isSoundPlaying = true;
                switch(choice) {
                    case 'grave': playSound(sounds.grave); break;
                    case 'agudo': playSound(sounds.agudo); break;
                    case 'fraco': sounds.dinamica.volume = 0.15; playSound(sounds.dinamica); break;
                    case 'forte': sounds.dinamica.volume = 1.0; playSound(sounds.dinamica); break;
                    case 'curto': playSound(sounds.duracao, {isShort: true}); break;
                    case 'longo': playSound(sounds.duracao); break;
                }
                setTimeout(() => { isSoundPlaying = false; }, 300);
            };
            tutorialInteractionArea.appendChild(button);
        }
        modals.tutorial.classList.remove('hidden');
    }

    function startGame(level) {
        gameState.currentLevel = level;
        gameState.currentRound = 0;
        const config = gameConfigs[level];
        gameTitle.textContent = config.title;
        updateRoundIndicators(); // <-- ADICIONADO AQUI PARA MOSTRAR AS BOLINHAS
        showScreen('game');
        nextChallenge();
    }
    
    function nextChallenge() {
        challengeArea.style.backgroundColor = 'var(--color-neutral)';
        let levelToPlay = gameState.currentLevel;
        if (levelToPlay === 'final') {
            levelToPlay = Math.ceil(Math.random() * 3);
        }

        const config = gameConfigs[levelToPlay];
        gameState.currentChallenge = Object.keys(config.choices)[Math.floor(Math.random() * 2)];

        interactionArea.innerHTML = '';
        for (const choice in config.choices) {
            const button = document.createElement('button');
            button.className = 'btn-choice';
            button.innerHTML = config.choices[choice];
            button.onclick = () => handleChoice(choice);
            interactionArea.appendChild(button);
        }
        
        setTimeout(() => {
            switch(gameState.currentChallenge) {
                case 'grave': playSound(sounds.grave); break;
                case 'agudo': playSound(sounds.agudo); break;
                case 'fraco': sounds.dinamica.volume = 0.15; playSound(sounds.dinamica); break;
                case 'forte': sounds.dinamica.volume = 1.0; playSound(sounds.dinamica); break;
                case 'curto': playSound(sounds.duracao, {isShort: true}); break;
                case 'longo': playSound(sounds.duracao); break;
            }
        }, 800);
    }
    
    function handleChoice(choice) {
        interactionArea.style.pointerEvents = 'none';
        const isCorrect = choice === gameState.currentChallenge;
        playSound(isCorrect ? sounds.success : sounds.error);
        challengeArea.style.backgroundColor = isCorrect ? 'lightgreen' : 'lightcoral';

        if (isCorrect) {
            gameState.currentRound++;
            updateRoundIndicators(); // <-- ATUALIZA AS BOLINHAS A CADA ACERTO
        }

        setTimeout(() => {
            if (isCorrect && gameState.currentRound >= gameState.roundsPerLevel) {
                completeLevel();
            } else {
                nextChallenge();
            }
            interactionArea.style.pointerEvents = 'auto';
        }, 1200);
    }

    function completeLevel() {
        playSound(sounds.victory);
        let message = "Você completou a estação!";
        let buttonAction = () => { modals.endLevel.classList.add('hidden'); showScreen('map'); updateMap(); };
        let buttonText = "Continuar";

        if (gameState.currentLevel === 'final') {
            message = "Você concluiu a Jornada Inicial dos Sons!";
            buttonAction = showCertificate;
            buttonText = "Ver Certificado";
        } else if (gameState.currentLevel >= playerProgress.highestLevelUnlocked) {
            playerProgress.highestLevelUnlocked++;
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(playerProgress));
        }
        document.getElementById('end-level-message').textContent = message;
        const continueButton = document.getElementById('continue-button');
        continueButton.textContent = buttonText;
        continueButton.onclick = buttonAction;
        modals.endLevel.classList.remove('hidden');
    }

    function showCertificate() {
        const playerName = document.getElementById('player-name-input').value.trim() || "Músico(a) Genial";
        document.getElementById('cert-player-name').textContent = playerName;
        document.getElementById('cert-date').textContent = new Date().toLocaleDateString('pt-BR');
        modals.endLevel.classList.add('hidden');
        modals.name.classList.add('hidden');
        showScreen('certificate');
    }
    
    // FUNÇÕES QUE ESTAVAM FALTANDO
    function updateRoundIndicators() {
        roundsContainer.innerHTML = '';
        for (let i = 0; i < gameState.roundsPerLevel; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'round-indicator';
            if (i < gameState.currentRound) {
                indicator.classList.add('active');
            }
            roundsContainer.appendChild(indicator);
        }
    }

    function updateMap() {
        levelNodes.forEach(node => {
            const level = node.dataset.level;
            node.classList.remove('locked', 'completed');
            if (!isNaN(level)) {
                if (level > playerProgress.highestLevelUnlocked) {
                    node.classList.add('locked');
                } else if (level < playerProgress.highestLevelUnlocked) {
                    node.classList.add('completed');
                }
            } else if (level === 'final') {
                if (playerProgress.highestLevelUnlocked <= 3) {
                    node.classList.add('locked');
                }
            }
        });
    }

    // --- EVENT LISTENERS ---
    levelNodes.forEach(node => {
        node.addEventListener('click', () => {
            if (node.classList.contains('locked')) return;
            const level = node.dataset.level;
            if (level === 'final') {
                modals.name.classList.remove('hidden');
            } else {
                showTutorial(parseInt(level));
            }
        });
    });
    document.getElementById('start-challenge-button').addEventListener('click', () => { modals.tutorial.classList.add('hidden'); startGame(gameState.currentLevel); });
    document.getElementById('start-final-test-button').addEventListener('click', () => {modals.name.classList.add('hidden'); startGame('final');});
    document.getElementById('instructions-button').addEventListener('click', () => modals.instructions.classList.remove('hidden'));
    document.getElementById('close-instructions-button').addEventListener('click', () => modals.instructions.classList.add('hidden'));
    document.getElementById('exit-button').addEventListener('click', () => { showScreen('map'); updateMap(); });
    document.getElementById('reset-button').addEventListener('click', () => { if (confirm("Apagar todo o progresso?")) { localStorage.removeItem(PROGRESS_KEY); playerProgress = { highestLevelUnlocked: 1 }; updateMap(); }});
    document.getElementById('print-certificate-button').addEventListener('click', () => window.print());
    document.getElementById('back-to-map-button').addEventListener('click', () => { showScreen('map'); updateMap(); });
    
    // --- INICIALIZAÇÃO ---
    updateMap();
    showScreen('map');
});