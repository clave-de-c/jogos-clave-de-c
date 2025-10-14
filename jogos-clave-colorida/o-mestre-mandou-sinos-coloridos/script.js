document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção dos Elementos do DOM ---
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const playBtn = document.getElementById('play-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const bellOrchestra = document.getElementById('bell-orchestra');
    const scoreDisplay = document.getElementById('score-display');
    const messageDisplay = document.getElementById('message-display');
    const backgroundMusic = document.getElementById('background-music');

    // --- Novos Elementos ---
    const highScoreDisplay = document.getElementById('high-score-display');
    const difficultyButtons = document.querySelectorAll('.btn-difficulty');

    // --- Dados das Notas ---
    const notes = [
        { name: 'Dó', id: 'do-sino' }, { name: 'Ré', id: 're-sino' },
        { name: 'Mi', id: 'mi-sino' }, { name: 'Fá', id: 'fa-sino' },
        { name: 'Sol', id: 'sol-sino' }, { name: 'Lá', id: 'la-sino' },
        { name: 'Si', id: 'si-sino' }, { name: 'Dó Agudo', id: 'do-agudo-sino' }
    ];

    // --- Variáveis de Estado e Configurações ---
    let score = 0;
    let highScore = 0;
    let computerSequence = [];
    let playerSequence = [];
    let isPlayerTurn = false;
    
    // Configuração de velocidade por dificuldade
    const SPEEDS = { easy: 1000, medium: 700, hard: 400 };
    let currentDifficulty = 'easy';

    // --- Lógica de Música ---
    function playMenuMusic() {
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(() => {});
        }
    }

    function stopMenuMusic() {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    // --- Lógica de Recorde ---
    function loadHighScore() {
        highScore = localStorage.getItem('mestreMandouHighScore') || 0;
        highScoreDisplay.textContent = highScore;
    }

    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mestreMandouHighScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
    }

    // --- Lógica de Navegação e Telas ---
    playBtn.addEventListener('click', () => {
        stopMenuMusic();
        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.style.display = 'inline-block';
        startGame();
    });

    backToMenuBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        backToMenuBtn.style.display = 'none';
        playMenuMusic();
    });
    
    instructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.add('active');
        playMenuMusic(); // Garante que a música toque ao interagir com o menu
    });

    closeModalBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('active');
    });

    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDifficulty = button.dataset.difficulty;
        });
    });

    // --- Lógica Principal do Jogo ---
    function startGame() {
        score = 0;
        computerSequence = [];
        playerSequence = [];
        updateScore(0);
        computerTurn();
    }

    function computerTurn() {
        playerSequence = [];
        isPlayerTurn = false;
        messageDisplay.textContent = "Observe a sequência...";
        bellOrchestra.style.pointerEvents = 'none';

        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        computerSequence.push(randomNote);
        playSequence();
    }
    
    function playSequence() {
        let delay = 0;
        const speed = SPEEDS[currentDifficulty];
        computerSequence.forEach(note => {
            setTimeout(() => showNoteAnimation(note.id), delay);
            delay += speed;
        });

        setTimeout(() => {
            isPlayerTurn = true;
            messageDisplay.textContent = "Sua vez! Repita a sequência.";
            bellOrchestra.style.pointerEvents = 'auto';
        }, delay);
    }
    
    function handlePlayerClick(note) {
        if (!isPlayerTurn) return;

        showNoteAnimation(note.id);
        playerSequence.push(note);
        const currentStep = playerSequence.length - 1;

        if (playerSequence[currentStep].id !== computerSequence[currentStep].id) {
            gameOver();
            return;
        }

        if (playerSequence.length === computerSequence.length) {
            // AQUI A MUDANÇA: Agora soma 10 pontos em vez de 1
            updateScore(score + 10);
            setTimeout(computerTurn, 1000);
        }
    }

    function gameOver() {
        isPlayerTurn = false;
        saveHighScore();
        messageDisplay.textContent = `Você errou! Pontuação final: ${score}. Clique em 'Menu' para recomeçar.`;
        bellOrchestra.style.pointerEvents = 'none';
    }

    function updateScore(newScore) {
        score = newScore;
        scoreDisplay.textContent = score;
    }

    function showNoteAnimation(noteId) {
        const noteAudio = document.getElementById(`audio-${noteId}`);
        noteAudio.currentTime = 0;
        noteAudio.play();
        const bellElement = document.querySelector(`.bell-image[data-note='${noteId}']`);
        bellElement.classList.add('playing');
        setTimeout(() => bellElement.classList.remove('playing'), 300);
    }

    // --- Inicialização ---
    function createBells() {
        // Limpa a orquestra antes de criar os sinos
        bellOrchestra.innerHTML = ''; 
        
        notes.forEach(note => {
            const bellImage = document.createElement('img');
            
            // CORREÇÃO: A linha abaixo agora monta o nome do arquivo corretamente.
            // Ex: "sino-" + "do-sino".replace('-sino', '') se torna "sino-do.png"
            bellImage.src = `sino-${note.id.replace('-sino', '')}.png`; 
            
            bellImage.className = 'bell-image';
            bellImage.dataset.note = note.id;
            bellImage.alt = `Sino da nota ${note.name.replace(' Agudo', '')}`; // Deixa o alt text mais limpo
            bellImage.addEventListener('click', () => handlePlayerClick(note));
            bellOrchestra.appendChild(bellImage);
        });
    }

    // Código que roda quando a página carrega
    createBells();
    loadHighScore();
    playMenuMusic();
});