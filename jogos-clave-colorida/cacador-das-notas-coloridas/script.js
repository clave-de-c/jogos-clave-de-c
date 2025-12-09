document.addEventListener('DOMContentLoaded', () => {
    // Referências
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const buttonsContainer = document.getElementById('buttons-container');
    const levelUpOverlay = document.getElementById('level-up-overlay');
    
    const playBtn = document.getElementById('play-btn');
    const restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.getElementById('menu-btn');
    const muteBtn = document.getElementById('mute-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    const targetNoteEl = document.getElementById('target-note');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives-display');
    const finalScoreEl = document.getElementById('final-score');
    const gameOverTitle = document.querySelector('#game-over-screen h1'); 
    const gameOverMsg = document.querySelector('#game-over-screen p');
    const timeBar = document.getElementById('time-bar');

    // Áudio
    const sndClick = document.getElementById('snd-click'); 
    const sndWin = document.getElementById('snd-win');     
    const bgMusic = document.getElementById('bg-music');
    let isMuted = false;

    // Configurações
    const notes = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
    let currentNote = '';
    let score = 0;
    let lives = 3;
    let maxTime = 4000;
    let currentTime = maxTime;
    let timerInterval;
    let gameActive = false;
    
    // --- METAS ATUALIZADAS (Para compensar os 2 pontos por acerto) ---
    const LEVEL_2_SCORE = 50;  // Equivalente a 25 acertos
    const WINNING_SCORE = 100; // Equivalente a 50 acertos

    // MÚSICA
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => { console.log("Autoplay bloqueado."); });
    document.body.addEventListener('click', () => {
        if(bgMusic.paused && !isMuted) bgMusic.play();
    }, { once: true });

    // MUTE
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        sndClick.muted = isMuted;
        sndWin.muted = isMuted;
        muteBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    function playSound(sound) {
        if (!isMuted) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    // NAVEGAÇÃO
    playBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    menuBtn.addEventListener('click', () => {
        showScreen(menuScreen);
        backToMenuBtn.style.display = 'none';
        if(!isMuted) bgMusic.volume = 0.4; 
    });

    backToMenuBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        showScreen(menuScreen);
        backToMenuBtn.style.display = 'none';
        if(!isMuted) bgMusic.volume = 0.4;
    });

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function shuffleButtons() {
        const buttons = Array.from(buttonsContainer.children);
        for (let i = buttons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            buttonsContainer.appendChild(buttons[j]);
        }
    }

    // --- GAMEPLAY ---
    function startGame() {
        score = 0;
        lives = 3;
        maxTime = 4000;
        updateHUD();
        
        showScreen(gameScreen);
        backToMenuBtn.style.display = 'block';
        if(!isMuted) bgMusic.volume = 0.1; 
        
        gameActive = true;
        nextRound();
    }

    function triggerLevelUp() {
        clearInterval(timerInterval);
        levelUpOverlay.classList.remove('overlay-hidden');
        levelUpOverlay.classList.add('overlay-active');
        playSound(sndClick); 

        setTimeout(() => {
            levelUpOverlay.classList.remove('overlay-active');
            levelUpOverlay.classList.add('overlay-hidden');
            
            // Fica MUITO rápido
            maxTime = 2000; 
            nextRound();
        }, 2000);
    }

    function nextRound() {
        if (!gameActive) return;

        shuffleButtons();

        const randomIndex = Math.floor(Math.random() * notes.length);
        currentNote = notes[randomIndex];
        targetNoteEl.innerText = currentNote;

        clearInterval(timerInterval);
        currentTime = maxTime;
        updateTimeBar();

        timerInterval = setInterval(() => {
            currentTime -= 50;
            updateTimeBar();
            
            if (currentTime <= 0) {
                handleMistake("Tempo Esgotado!");
            }
        }, 50);
    }

    function updateTimeBar() {
        const percentage = (currentTime / maxTime) * 100;
        timeBar.style.width = percentage + '%';
        if(percentage < 30) timeBar.style.backgroundColor = '#d41e1e';
        else if(percentage < 60) timeBar.style.backgroundColor = '#ffda43';
        else timeBar.style.backgroundColor = '#10ad54';
    }

    function handleInput(clickedNote) {
        if (!gameActive) return;
        if(levelUpOverlay.classList.contains('overlay-active')) return;

        playSound(sndClick);

        if (clickedNote === currentNote) {
            // AQUI ESTÁ A MUDANÇA: +2 PONTOS
            score += 2;
            
            // Lógica de Velocidade (Ajustada para a nova escala de pontos)
            if (score < LEVEL_2_SCORE) {
                if(maxTime > 1000) maxTime -= 50; 
            } else {
                if(maxTime > 800) maxTime -= 30; 
            }

            updateHUD();

            if (score === LEVEL_2_SCORE) {
                triggerLevelUp();
            } else if (score >= WINNING_SCORE) {
                gameWin();
            } else {
                nextRound();
            }

        } else {
            handleMistake("Errou a nota!");
        }
    }

    function handleMistake(reason) {
        clearInterval(timerInterval);
        lives--;
        
        gameScreen.style.backgroundColor = 'rgba(212, 30, 30, 0.3)';
        setTimeout(() => gameScreen.style.backgroundColor = 'transparent', 200);

        updateHUD();

        if (lives <= 0) {
            gameOver(false);
        } else {
            targetNoteEl.innerText = "OPS!";
            setTimeout(nextRound, 1000);
        }
    }

    function updateHUD() {
        scoreEl.innerText = `${score} / ${WINNING_SCORE}`;
        livesEl.innerText = "❤️".repeat(lives);
    }

    function gameWin() {
        gameOver(true);
    }

    function gameOver(isVictory) {
        gameActive = false;
        clearInterval(timerInterval);
        finalScoreEl.innerText = score;
        
        if (isVictory) {
            playSound(sndWin);
            gameOverTitle.innerText = "Parabéns! 🎉";
            gameOverTitle.style.color = "#10ad54";
            gameOverMsg.innerText = "Você venceu o Nível Turbo!";
             if(!isMuted) bgMusic.volume = 0.05; 
        } else {
            gameOverTitle.innerText = "Fim de Jogo!";
            gameOverTitle.style.color = "#333";
            gameOverMsg.innerText = "Sua pontuação final:";
            if(!isMuted) bgMusic.volume = 0.4; 
        }
        
        showScreen(gameOverScreen);
        backToMenuBtn.style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    document.querySelectorAll('.note-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const note = this.getAttribute('data-note');
            handleInput(note);
        });
        
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const note = this.getAttribute('data-note');
            handleInput(note);
            this.style.transform = "scale(0.9)";
            setTimeout(() => this.style.transform = "scale(1)", 100);
        });
    });
});