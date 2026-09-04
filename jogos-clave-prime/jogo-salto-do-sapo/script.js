document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const btnPlay = document.getElementById('btn-play-big');
    const btnBack = document.getElementById('btn-back');
    const settingsDropdown = document.getElementById('settings-dropdown');
    
    let audioCtx; let bgmInterval; let isMusicMuted = false; let isSfxMuted = false;

    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playUIClick() {
        if (isSfxMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'triangle'; osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }

    function playPianoNote(freq, duration = 0.5) {
        if (isSfxMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = "triangle"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.03); 
        gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + duration * 0.8); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration); 
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + duration + 0.1);
    }

    function playSplashSound() {
        if (isSfxMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = "square"; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.3);
    }

    function startMusic() {
        if (isMusicMuted || !audioCtx || bgmInterval) return;
        const notes = [261.63, 329.63, 392.00, 523.25]; let step = 0;
        bgmInterval = setInterval(() => {
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'sine'; osc.frequency.value = notes[step % notes.length];
            gain.gain.setValueAtTime(0, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
            osc.start(); osc.stop(audioCtx.currentTime + 0.5); step++;
        }, 800); 
    }

    function stopMusic() { if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; } }

    document.querySelectorAll('.sound-click').forEach(btn => btn.addEventListener('click', () => { initAudio(); playUIClick(); }));

    const NOTE_NAMES = ["Dó","Dó♯","Ré","Ré♯","Mi","Fá","Fá♯","Sol","Sol♯","Lá","Lá♯","Si"];
    const LEVELS = [{name:"Semitons", q:3}, {name:"Tons", q:3}, {name:"Contagem", q:4}, {name:"Tom e Semitom", q:5}];
    
    let score = 0, streak = 0, bestStreak = 0, lives = 3, level = 1, questionInLevel = 0, currentQuestion = null, busy = false;
    let midiAccess = null;
    let currentFrogIndex = 0; // Armazena a posição atual do sapo

    const els = {
        level: document.getElementById("level"), score: document.getElementById("score"), streak: document.getElementById("streak"), lives: document.getElementById("lives"),
        question: document.getElementById("question"), hint: document.getElementById("hint"), questionTag: document.getElementById("questionTag"),
        startLily: document.getElementById("startLily"), targetLily: document.getElementById("targetLily"), 
        frog: document.getElementById("frog"), splash: document.getElementById("splash"),
        keyboard: document.getElementById("keyboard"), currentNote: document.getElementById("currentNote"),
        feedbackIcon: document.getElementById("feedbackIcon"), feedbackTitle: document.getElementById("feedbackTitle"), feedbackText: document.getElementById("feedbackText"),
        modal: document.getElementById("modal"), modalTitle: document.getElementById("modalTitle"), modalText: document.getElementById("modalText"),
        finalScore: document.getElementById("finalScore"), finalStreak: document.getElementById("finalStreak"),
        midiStatus: document.getElementById("midiStatus"), connectMidiBtn: document.getElementById("connectMidiBtn")
    };

    function noteLabel(i){ return NOTE_NAMES[(i % 12 + 12) % 12]; }
    function noteSteps(start, semitones, dir = 1){ return (start + dir * semitones + 120) % 12; }
    function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

    // CÁLCULO UNIFICADO DA POSIÇÃO NO LAGO (12% a 88% da tela)
    function calcXPosition(index) {
        return 12 + (index / 11) * 76;
    }

    function setupKeyboard(){
        els.keyboard.innerHTML = ""; const distanceMode = currentQuestion?.mode === "distance"; const totalKeys = distanceMode ? 8 : 12;
        for(let i = 0; i < totalKeys; i++){
            const btn = document.createElement("button"); btn.className = "key sound-click"; btn.dataset.index = i;
            if(distanceMode){ btn.innerHTML = `<span class="note-name">${i===0?"0 st":i+" st"}</span><span class="degree">${i===2?"1 tom":(i===1?"1 semitom":"")}</span>`; } 
            else { btn.innerHTML = `<span class="note-name">${NOTE_NAMES[i]}</span><span class="degree">${i===0?"Dó":i+" st"}</span>`; }
            btn.addEventListener("click", () => { initAudio(); handleAnswer(i, btn); });
            els.keyboard.appendChild(btn);
        }
    }

    function moveFrog(targetIndex){
        els.frog.classList.remove("jumping"); void els.frog.offsetWidth;
        const pos = calcXPosition(targetIndex);
        
        // Atualiza a posição do sapo
        els.frog.style.left = `${pos}%`; 
        els.frog.classList.add("jumping");
        
        // Efeito de água
        els.splash.style.left = `${pos}%`; 
        els.splash.style.top = "50%";
        els.splash.classList.remove("show"); void els.splash.offsetWidth; 
        els.splash.classList.add("show");
        
        // A vitória-régia de origem passa a ser a nova posição do sapo
        currentFrogIndex = targetIndex;
        
        setTimeout(playSplashSound, 400); 
    }

    function buildQuestion(){
        const mode = level <= 2 ? level : 3;
        if(mode === 1){
            const start = rand(0,11); const semitones = rand(0,1) ? 1 : rand(3,5); const dir = rand(0,1) ? 1 : -1; const ans = noteSteps(start, semitones, dir);
            return semitones === 1 
                ? { tag:"SEMITOM", text:`${dir===1?"Suba":"Desça"} 1 semitom de ${noteLabel(start)}.`, hint:`Tecla vizinha.`, answer:ans, exp:`1 st.`, start }
                : { tag:"INTERVALO", text:`De ${noteLabel(start)}, ${dir===1?"suba":"desça"} ${semitones} semitons.`, hint:`Conte as teclas.`, answer:ans, exp:`${semitones} st.`, start };
        } else if(mode === 2){
            const start = rand(0,11); const ans = noteSteps(start, 2, 1);
            return { tag:"TOM", text:`Avançe 1 tom de ${noteLabel(start)}.`, hint:"1 tom = 2 semitons.", answer:ans, exp:`2 semitons.`, start };
        } else {
            const dist = rand(1,7); const start = rand(0, 11 - dist); const ans = start + dist;
            return { tag:"CONTAGEM", text:`Quantos semitons entre ${noteLabel(start)} e ${noteLabel(ans)}?`, hint:"Conte os passos.", answer: dist, mode:"distance", start, exp: `${dist} st.` };
        }
    }

    function renderQuestion(){
        document.querySelectorAll(".key").forEach(k => k.classList.remove("correct","wrong"));
        currentQuestion = buildQuestion(); setupKeyboard();
        
        els.questionTag.textContent = currentQuestion.tag; els.question.textContent = currentQuestion.text;
        els.hint.textContent = currentQuestion.hint; els.currentNote.textContent = currentQuestion.start != null ? noteLabel(currentQuestion.start) : "—";
        
        // POSICIONA AS DUAS VITÓRIAS-RÉGIAS:
        // 1. Folha de Origem (Onde o sapo está no momento)
        const startPos = currentQuestion.start != null ? currentQuestion.start : currentFrogIndex;
        els.startLily.style.left = `${calcXPosition(startPos)}%`;
        els.frog.style.left = `${calcXPosition(startPos)}%`;

        // 2. Folha Alvo (Onde o sapo precisa pousar)
        const correctIndex = currentQuestion.mode === "distance" ? Math.min(11, currentQuestion.answer) : currentQuestion.answer;
        const targetPos = calcXPosition(correctIndex);
        els.targetLily.style.left = `${targetPos}%`;

        els.feedbackIcon.textContent="🎵"; els.feedbackTitle.textContent="Sua vez!"; els.feedbackText.textContent="Escolha a resposta no teclado.";
    }

    function animateTrail(startIndex, distance) {
        let step = 1;
        const interval = setInterval(() => {
            if (step > distance) { clearInterval(interval); return; }
            playPianoNote(440 * Math.pow(2,(((60 + (startIndex + step) % 12))-69)/12), 0.3); step++;
        }, 250);
    }

    function handleAnswer(index, btn, fromMidi=false){
        if(busy) return; busy = true;
        if(!fromMidi) playPianoNote(440 * Math.pow(2,(((60+index))-69)/12));

        if(index === currentQuestion.answer){
            if(btn) btn.classList.add("correct");
            score += 100 + Math.min(streak,10)*10; streak += 1; bestStreak = Math.max(bestStreak,streak); questionInLevel += 1;
            if(currentQuestion.mode === "distance"){ moveFrog(Math.min(11, index)); animateTrail(currentQuestion.start, index); } else { moveFrog(index); }
            els.feedbackIcon.textContent="🌟"; els.feedbackTitle.textContent="Correto!"; els.feedbackText.textContent=currentQuestion.exp;
            setTimeout(nextStep, currentQuestion.mode === "distance" ? 1200 : 850);
        }else{
            if(btn) btn.classList.add("wrong"); lives -= 1; streak = 0;
            els.feedbackIcon.textContent="💦"; els.feedbackTitle.textContent="Quase!"; els.feedbackText.textContent="Tente novamente.";
            if(lives <= 0) setTimeout(()=>endGame(false),650); else setTimeout(()=>{ if(btn) btn.classList.remove("wrong"); busy=false; },650);
        }
        els.level.textContent=level; els.score.textContent=score; els.streak.textContent=streak; els.lives.textContent="❤️".repeat(lives)+"🖤".repeat(Math.max(0,3-lives));
    }

    function nextStep(){
        busy = false;
        if(questionInLevel >= LEVELS[level-1].q){
            if(level < LEVELS.length){ level++; questionInLevel = 0; els.feedbackTitle.textContent="Nova fase!"; els.level.textContent=level; }
            else { endGame(true); return; }
        }
        renderQuestion();
    }

    function newGame(){
        score=0; streak=0; bestStreak=0; lives=3; level=1; questionInLevel=0; busy=false; currentFrogIndex = 0;
        els.modal.style.display = "none"; 
        
        els.level.textContent=level; els.score.textContent=score; els.streak.textContent=streak; els.lives.textContent="❤️❤️❤️";
        renderQuestion();
    }

    function endGame(won=false){
        els.modal.style.display = "flex"; els.modalTitle.textContent = won ? "🏆 Lago concluído!" : "🐸 Fim de jogo";
        els.modalText.textContent = won ? "Você completou todos os desafios!" : "O sapinho precisa recuperar o fôlego.";
        els.finalScore.textContent = score; els.finalStreak.textContent = bestStreak;
    }

    function toggleFullscreen(enter) {
        const elem = document.documentElement;
        if (enter) { if (elem.requestFullscreen) elem.requestFullscreen(); else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen(); } 
        else { if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); } }
    }

    btnPlay.addEventListener('click', () => {
        startScreen.style.opacity = '0'; initAudio();
        setTimeout(() => {
            startScreen.style.display = 'none'; gameArea.style.display = 'flex';
            void gameArea.offsetWidth; gameArea.style.opacity = '1'; toggleFullscreen(true); startMusic(); newGame();
        }, 500);
    });

    btnBack.addEventListener('click', () => {
        gameArea.style.opacity = '0'; stopMusic();
        setTimeout(() => {
            gameArea.style.display = 'none'; startScreen.style.display = 'flex';
            void startScreen.offsetWidth; startScreen.style.opacity = '1'; toggleFullscreen(false);
        }, 500);
    });

    document.getElementById('btn-settings').addEventListener('click', () => settingsDropdown.classList.toggle('hidden'));
    document.getElementById('toggle-sfx').addEventListener('click', (e) => { isSfxMuted = !isSfxMuted; e.currentTarget.classList.toggle('muted', isSfxMuted); });
    document.getElementById('toggle-music').addEventListener('click', (e) => { isMusicMuted = !isMusicMuted; e.currentTarget.classList.toggle('muted', isMusicMuted); if(isMusicMuted) stopMusic(); else startMusic(); });
    document.getElementById('restartBtn').addEventListener('click', newGame);

    async function connectMidi(){
        initAudio(); playUIClick();
        if(!navigator.requestMIDIAccess) { els.midiStatus.textContent = "MIDI Indisponível"; return; }
        try{
            midiAccess = await navigator.requestMIDIAccess();
            const inputs = [...midiAccess.inputs.values()];
            if(inputs.length > 0){
                inputs[0].onmidimessage = (e) => {
                    const [status, note, vel] = e.data;
                    if((status & 0xF0) === 0x90 && vel > 0 && !busy){
                        const pc = note % 12; const key = document.querySelector(`.key[data-index="${pc}"]`);
                        if(key) handleAnswer(pc, key, true);
                    }
                };
                els.midiStatus.textContent = `Piano Conectado: ${inputs[0].name}`;
                els.midiStatus.style.color = "#f1c40f";
            } else { els.midiStatus.textContent = "Nenhum teclado detectado."; }
        }catch(e){ els.midiStatus.textContent = "Permissão Negada."; }
    }
    els.connectMidiBtn.addEventListener("click", connectMidi);
});