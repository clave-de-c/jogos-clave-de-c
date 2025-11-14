document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos ---
    const screens = {
        splash: document.getElementById('splash-screen'),
        menu: document.getElementById('menu-screen'),
        instructions: document.getElementById('instructions-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen'),
    };
    
    const gameContainer = document.querySelector('.game-container');
    const startAudioBtn = document.getElementById('start-audio-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-select .btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const backToMenuBtns = [
        document.getElementById('back-to-menu-btn-instr'),
        document.getElementById('back-to-menu-btn-game'),
        document.getElementById('back-to-menu-btn-end'),
    ];
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    const finalScoreDisplay = document.getElementById('final-score');
    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const gameGrid = document.querySelector('.game-grid');
    
    const menuMusic = document.getElementById('menu-music');
    // MUDANÇA: Seleciona o som de sucesso
    const successSound = document.getElementById('success-sound');
    
    // --- Dados do Jogo (Notas Coloridas) ---
    const correctNotes = [
        { name: 'Dó', color: '#d41e1e', soundId: 'som-do' },
        { name: 'Ré', color: '#f18c4d', soundId: 'som-re' },
        { name: 'Mi', color: '#ffda43', soundId: 'som-mi' },
        { name: 'Fá', color: '#10ad54', soundId: 'som-fa' },
        { name: 'Sol', color: '#38b6ff', soundId: 'som-sol' },
        { name: 'Lá', color: '#004aad', soundId: 'som-la' },
        { name: 'Si', color: '#7c45e8', soundId: 'som-si' },
    ];
    const fakeNotes = [
        { name: 'Ti', color: '#aaaaaa' }, 
        { name: 'Pó', color: '#8B4513' }, 
        { name: 'Zá', color: '#008080' }, 
        { name: 'Bé', color: '#808000' }, 
        { name: 'Ru', color: '#8B008B' }, 
    ];

    // --- Variáveis de Estado do Jogo ---
    let score = 0;
    let timeLeft = 60;
    let gameTimerId = null; 
    let moleTimerId = null; 
    let currentMoleHole = null; 
    let molePopSpeed = 1200; 

    // --- Funções de Controle de Tela ---
    function showScreen(screenId) {
        for (let key in screens) {
            screens[key].style.display = 'none';
        }
        screens[screenId].style.display = 'flex';
    }

    // --- Funções de Navegação (Botões) ---
    
    startAudioBtn.addEventListener('click', () => {
        menuMusic.play().catch(e => console.error("Erro ao tocar música:", e));
        showScreen('menu');
    });
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            molePopSpeed = parseInt(btn.dataset.speed);
            startGame();
        });
    });
    
    instructionsBtn.addEventListener('click', () => showScreen('instructions'));
    restartBtn.addEventListener('click', startGame);

    backToMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stopGame(); 
            showScreen('menu');
            if (menuMusic.paused) menuMusic.play(); 
            
            // MUDANÇA: Para o som de sucesso se estiver tocando
            if (successSound) {
                successSound.pause();
                successSound.currentTime = 0;
            }
        });
    });

    // --- Lógica Principal do Jogo ---

    function startGame() {
        score = 0;
        timeLeft = 60;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        finalScoreDisplay.classList.remove('score-pop');

        menuMusic.pause();
        menuMusic.currentTime = 0;
        
        // MUDANÇA: Para o som de sucesso se estiver tocando (ao reiniciar)
        if (successSound) {
            successSound.pause();
            successSound.currentTime = 0;
        }

        showScreen('game');

        gameTimerId = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                stopGame();
                showEndScreen();
            }
        }, 1000);

        moleTimerId = setInterval(popMole, molePopSpeed); 
    }

    function stopGame() {
        clearInterval(gameTimerId);
        clearInterval(moleTimerId);
        gameTimerId = null;
        moleTimerId = null;
        hideMole(currentMoleHole);
    }

    function showEndScreen() {
        finalScoreDisplay.textContent = score;
        showScreen('end');
        finalScoreDisplay.classList.add('score-pop');
        
        // MUDANÇA: Toca o som de sucesso
        if (successSound) {
            successSound.play();
        }
    }

    function popMole() {
        hideMole(currentMoleHole);

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        const hole = holes[randomHoleIndex];
        const mole = hole.querySelector('.mole');

        const isCorrect = Math.random() < 0.7; 
        
        let note;
        if (isCorrect) {
            note = correctNotes[Math.floor(Math.random() * correctNotes.length)];
            mole.dataset.correct = "true"; 
            mole.dataset.sound = note.soundId;
        } else {
            note = fakeNotes[Math.floor(Math.random() * fakeNotes.length)];
            mole.dataset.correct = "false";
            mole.dataset.sound = ""; 
        }

        mole.textContent = note.name;
        mole.style.backgroundColor = note.color;

        mole.classList.add('active');
        currentMoleHole = hole; 
    }

    function hideMole(hole) {
        if (!hole) return;
        const mole = hole.querySelector('.mole');
        mole.classList.remove('active');
        mole.dataset.correct = ""; 
        currentMoleHole = null;
    }

    // --- Evento de Clique (Bater no Círculo) ---
    gameGrid.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('mole')) return;
        const mole = e.target;
        if (!mole.classList.contains('active')) return;

        const parentHole = mole.closest('.hole');

        if (mole.dataset.correct === "true") {
            // Acerto
            score++;
            const soundId = mole.dataset.sound;
            const noteSound = document.getElementById(soundId);
            if (noteSound) {
                noteSound.currentTime = 0; 
                noteSound.play();
            }
        } else {
            // Erro
            score--;
            gameContainer.classList.add('shake');
            setTimeout(() => {
                gameContainer.classList.remove('shake');
            }, 500);
        }

        scoreDisplay.textContent = score;
        hideMole(parentHole); 
    });
    
    // Mostra a tela inicial de splash assim que o DOM carregar
    showScreen('splash');

}); // Fim do DOMContentLoaded