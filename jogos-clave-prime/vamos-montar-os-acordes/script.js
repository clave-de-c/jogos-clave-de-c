document.addEventListener('DOMContentLoaded', () => {
    // Telas (Adicionado tela de instruções)
    const screens = {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen'),
        instructions: document.getElementById('instructions-screen')
    };

    // Banco de Acordes
    const CHORDS = [
        { symbol: 'C',  notes: ['DÓ', 'MI', 'SOL'] },
        { symbol: 'Cm', notes: ['DÓ', 'MIb', 'SOL'] },
        { symbol: 'D',  notes: ['RÉ', 'FÁ#', 'LÁ'] },
        { symbol: 'Dm', notes: ['RÉ', 'FÁ', 'LÁ'] },
        { symbol: 'E',  notes: ['MI', 'SOL#', 'SI'] },
        { symbol: 'Em', notes: ['MI', 'SOL', 'SI'] },
        { symbol: 'F',  notes: ['FÁ', 'LÁ', 'DÓ'] },
        { symbol: 'Fm', notes: ['FÁ', 'LÁb', 'DÓ'] },
        { symbol: 'G',  notes: ['SOL', 'SI', 'RÉ'] },
        { symbol: 'Gm', notes: ['SOL', 'SIb', 'RÉ'] },
        { symbol: 'A',  notes: ['LÁ', 'DÓ#', 'MI'] },
        { symbol: 'Am', notes: ['LÁ', 'DÓ', 'MI'] },
        { symbol: 'B',  notes: ['SI', 'RÉ#', 'FÁ#'] },
        { symbol: 'Bm', notes: ['SI', 'RÉ', 'FÁ#'] }
    ];

    const ALL_NOTES = [
        'DÓ', 'DÓ#', 'RÉ', 'RÉ#', 'MIb', 'MI', 'FÁ', 
        'FÁ#', 'SOL', 'SOL#', 'LÁb', 'LÁ', 'SIb', 'SI'
    ];

    // Variáveis
    let currentChordPool = [];
    let currentChord = {};
    let score = 0;
    let timeLeft = 60;
    let timerInterval;

    // --- CONTROLE DE MÚSICA E AUTOPLAY ---
    const bgMusic = document.getElementById('bg-music');
    bgMusic.volume = 0.25;
    const btnMute = document.getElementById('btn-mute');
    let isMuted = false;

    // Tenta forçar o autoplay no primeiro clique do usuário em qualquer lugar
    let musicStarted = false;
    document.body.addEventListener('click', () => {
        if (!musicStarted && !isMuted) {
            bgMusic.play().catch(() => {});
            musicStarted = true;
        }
    }, { once: true });

    btnMute.onclick = () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        btnMute.textContent = isMuted ? '🔇' : '🔊';
    };

    // --- SINTETIZADOR DE ÁUDIO ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playTone(freq, type, duration, vol=0.1, startTime=0) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime);
        osc.stop(audioCtx.currentTime + startTime + duration);
    }

    function playClick() { playTone(600, 'sine', 0.1, 0.1); }
    function playError() { playTone(150, 'sawtooth', 0.3, 0.15); }
    function playSuccess() {
        playTone(523.25, 'sine', 0.3, 0.1, 0);      
        playTone(659.25, 'sine', 0.3, 0.1, 0.1);    
        playTone(783.99, 'sine', 0.4, 0.1, 0.2);    
    }
    function playGameOver() {
        playTone(440, 'triangle', 0.4, 0.1, 0);     
        playTone(392, 'triangle', 0.4, 0.1, 0.2);   
        playTone(349, 'triangle', 0.6, 0.1, 0.4);   
    }
    
    let isTick = true;
    function playTickTock() {
        const freq = isTick ? 1200 : 900; 
        playTone(freq, 'triangle', 0.05, 0.03);
        isTick = !isTick;
    }

    // Elementos DOM
    const currentChordDisplay = document.getElementById('current-chord');
    const slotsContainer = document.getElementById('slots-container');
    const tokensContainer = document.getElementById('tokens-container');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const finalScoreDisplay = document.getElementById('final-score');
    const selectMode = document.getElementById('game-mode');

    function switchScreen(screenName) {
        Object.values(screens).forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        screens[screenName].classList.remove('hidden');
        screens[screenName].classList.add('active');
    }

    // NAVEGAÇÃO
    document.getElementById('btn-instructions').onclick = () => switchScreen('instructions');
    document.getElementById('btn-close-instructions').onclick = () => switchScreen('start');

    // INICIAR JOGO
    function startGame() {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        
        // Garante que a música está tocando se não estiver mutada
        if (!isMuted) bgMusic.play().catch(() => {});

        // Filtrar Modo de Jogo
        const mode = selectMode.value;
        if (mode === 'maiores') {
            currentChordPool = CHORDS.filter(c => !c.symbol.includes('m'));
        } else if (mode === 'menores') {
            currentChordPool = CHORDS.filter(c => c.symbol.includes('m'));
        } else {
            currentChordPool = [...CHORDS]; // Misturado
        }

        score = 0;
        timeLeft = 60;
        updateStats();
        switchScreen('game');
        startTimer();
        nextChord();
    }

    function nextChord() {
        slotsContainer.innerHTML = `
            <div class="slot empty" data-index="0"></div>
            <div class="slot empty" data-index="1"></div>
            <div class="slot empty" data-index="2"></div>
        `;
        
        let newChord;
        do { 
            newChord = currentChordPool[Math.floor(Math.random() * currentChordPool.length)]; 
        } while (currentChord === newChord && currentChordPool.length > 1);
        
        currentChord = newChord;
        
        currentChordDisplay.textContent = currentChord.symbol;
        currentChordDisplay.parentElement.classList.remove('pop-anim');
        void currentChordDisplay.parentElement.offsetWidth;
        currentChordDisplay.parentElement.classList.add('pop-anim');

        generateTokens();
    }

    function generateTokens() {
        tokensContainer.innerHTML = '';
        let notesToSpawn = [...currentChord.notes];
        
        while(notesToSpawn.length < 8) {
            let randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
            if(!notesToSpawn.includes(randomNote)) notesToSpawn.push(randomNote);
        }

        notesToSpawn.sort(() => Math.random() - 0.5);

        notesToSpawn.forEach(note => {
            const token = document.createElement('div');
            token.className = 'note-token';
            token.dataset.note = note;
            token.textContent = note;
            token.onclick = () => handleTokenClick(token);
            tokensContainer.appendChild(token);
        });
    }

    function handleTokenClick(token) {
        playClick(); 
        if (token.parentElement.classList.contains('slot')) {
            tokensContainer.appendChild(token);
            checkEmptySlots();
            return;
        }

        const slots = document.querySelectorAll('.slot');
        for (let slot of slots) {
            if (slot.children.length === 0) {
                slot.appendChild(token);
                slot.classList.remove('empty');
                checkAnswer();
                break;
            }
        }
    }

    function checkEmptySlots() {
        document.querySelectorAll('.slot').forEach(slot => {
            if(slot.children.length === 0) slot.classList.add('empty');
        });
    }

    function checkAnswer() {
        const slots = document.querySelectorAll('.slot');
        let currentNotes = [];
        
        slots.forEach(slot => {
            if(slot.children.length > 0) currentNotes.push(slot.children[0].dataset.note);
        });

        if(currentNotes.length === 3) {
            // A ordem das notas não importa por causa desta verificação
            const isCorrect = currentNotes.every(val => currentChord.notes.includes(val));
            
            if (isCorrect) {
                playSuccess(); 
                score++;
                updateStats();
                slots.forEach(s => s.classList.add('slot-correct'));
                setTimeout(() => nextChord(), 600);
            } else {
                playError(); 
                slotsContainer.classList.remove('shake-anim');
                void slotsContainer.offsetWidth; 
                slotsContainer.classList.add('shake-anim');
            }
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) playTickTock(); 
            updateStats();
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function updateStats() {
        scoreDisplay.textContent = `Acertos: ${score}`;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `⏱️ ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if(timeLeft <= 10) timerDisplay.style.color = '#e74c3c';
        else timerDisplay.style.color = '#333';
    }

    function endGame() {
        clearInterval(timerInterval);
        // bgMusic.pause(); // Opcional: Pausar a música no fim do jogo
        playGameOver(); 
        finalScoreDisplay.textContent = score;
        switchScreen('result');
    }

    // Botões
    document.getElementById('btn-start').onclick = startGame;
    document.getElementById('btn-restart').onclick = startGame;
    
    document.getElementById('btn-menu').onclick = () => {
        clearInterval(timerInterval);
        switchScreen('start');
    };
    
    document.getElementById('btn-result-menu').onclick = () => {
        switchScreen('start');
    };
});