document.addEventListener('DOMContentLoaded', () => {
    const musicaFundo = document.getElementById('musica-fundo');
    const somClick = document.getElementById('som-click');
    const somSucesso = document.getElementById('som-sucesso');
    const midiStatus = document.getElementById('midi-status');
    
    musicaFundo.volume = 0.1;
    musicaFundo.play().catch(() => {});

    const menuInicial = document.getElementById('menu-inicial');
    const telaInstrucoes = document.getElementById('tela-instrucoes');
    const areaJogo = document.getElementById('area-jogo');
    const telaVitoria = document.getElementById('tela-vitoria');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    
    const btnModoPauta = document.getElementById('btn-modo-pauta');
    const btnModoAcordes = document.getElementById('btn-modo-acordes');
    const btnInstrucoes = document.getElementById('btn-instrucoes');
    const btnEntendido = document.getElementById('btn-entendido');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const quitButton = document.getElementById('quit-button');
    const audioToggle = document.getElementById('audio-toggle');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const closeLeaderboard = document.getElementById('close-leaderboard');
    const saveScoreButton = document.getElementById('save-score-button');
    const playerNameInput = document.getElementById('player-name');

    const noteTrack = document.getElementById('note-track');
    const pianoKeyboard = document.getElementById('piano-keyboard');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const livesDisplay = document.getElementById('lives');
    const specialBar = document.getElementById('special-bar');
    const levelUpAlert = document.getElementById('level-up-alert');
    
    const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const noteNames = { C: 'DÓ', D: 'RÉ', E: 'MI', F: 'FÁ', G: 'SOL', A: 'LÁ', B: 'SI' };
    const noteSoundFiles = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
    
    // PIXELS EXATOS DA PAUTA - INVIOLÁVEIS
    const alturasNaPauta = {
        'C': '176px', 'D': '161px', 'E': '146px', 'F': '131px', 
        'G': '116px', 'A': '101px', 'B': '86px'
    };

    const levelSpeeds = { 1: 5.5, 2: 4.8, 3: 4.0, 4: 3.3, 5: 2.5, 6: 2.0 };
    const hitsPerLevel = 10;
    
    let modoAtual = 'pauta'; 
    let level, score, lives, noteSpeed, gameIsOver = true;
    let correctHitsInRow = 0, specialMeter = 0, comboActive = false, comboTimeout;
    let audioMuted = false;
    let notaIdCounter = 0;
    let notasAtivasNaTela = []; 

    const mapaMIDI = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

    // --- MIDI ---
    function configurarMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, () => {});
        }
    }

    function onMIDISuccess(midiAccess) {
        function atualizarDispositivos() {
            const inputs = midiAccess.inputs.values();
            let conectado = false;
            for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
                conectado = true;
                input.value.onmidimessage = lerMensagemMIDI;
            }
            if (conectado) {
                midiStatus.textContent = '🎹 MIDI ON';
                midiStatus.className = 'midi-badge connected';
            }
        }
        atualizarDispositivos();
        midiAccess.onstatechange = atualizarDispositivos;
    }

    function lerMensagemMIDI(mensagem) {
        const comando = mensagem.data[0];
        const nota = mensagem.data[1];
        const velocidade = (mensagem.data.length > 2) ? mensagem.data[2] : 0;
        if (comando >= 144 && comando <= 159 && velocidade > 0) {
            processarToqueNota(mapaMIDI[nota % 12]);
        }
    }

    function tocarSom(som) {
        if (!audioMuted && som) { som.currentTime = 0; som.play().catch(() => {}); }
    }

    function abrirMenu() {
        gameIsOver = true;
        limparPauta();
        menuInicial.style.display = 'flex';
        telaInstrucoes.style.display = 'none';
        areaJogo.style.display = 'none';
        telaVitoria.style.display = 'none';
        document.getElementById('placar-container').classList.add('hidden');
        quitButton.classList.add('hidden');
        if (!audioMuted) musicaFundo.play().catch(() => {});
    }

    function iniciarJogo(modo) {
        tocarSom(somClick);
        musicaFundo.pause();
        musicaFundo.currentTime = 0;

        modoAtual = modo;
        score = 0; lives = 3; level = 1; correctHitsInRow = 0; specialMeter = 0; comboActive = false;
        noteSpeed = levelSpeeds[level];
        gameIsOver = false;
        limparPauta();
        atualizarHUD();
        
        menuInicial.style.display = 'none';
        telaInstrucoes.style.display = 'none';
        telaVitoria.style.display = 'none';
        areaJogo.style.display = 'flex';
        document.getElementById('placar-container').classList.remove('hidden');
        quitButton.classList.remove('hidden');

        setTimeout(spawnGrupo, 600);
    }

    function limparPauta() {
        document.querySelectorAll('.note-block').forEach(n => n.remove());
        notasAtivasNaTela = [];
    }

    // LÓGICA RÍGIDA DE 1 OU 2 NOTAS
    function spawnGrupo() {
        if (gameIsOver) return;
        
        let notasParaCriar = (modoAtual === 'acordes') ? 2 : 1;
        let notasSorteadas = [];
        
        while(notasSorteadas.length < notasParaCriar) {
            let n = naturalNotes[Math.floor(Math.random() * naturalNotes.length)];
            if (!notasSorteadas.includes(n)) notasSorteadas.push(n);
        }

        notasSorteadas.forEach(nota => {
            const id = `nota-${notaIdCounter++}`;
            const bloco = document.createElement('div');
            bloco.className = `note-block note-${nota.toLowerCase()}`;
            bloco.id = id;
            bloco.textContent = noteNames[nota];
            bloco.style.top = alturasNaPauta[nota];
            bloco.style.animationDuration = `${noteSpeed}s`;
            
            bloco.addEventListener('animationend', () => computarErro(id));
            noteTrack.appendChild(bloco);

            notasAtivasNaTela.push({ id: id, nota: nota, elemento: bloco });
        });
    }

    function processarToqueNota(notaTeclada) {
        if (gameIsOver) return;
        
        if (naturalNotes.includes(notaTeclada)) {
            if (!audioMuted) {
                new Audio(`${noteSoundFiles[notaTeclada]}.mp3`).play().catch(() => {});
            }
        }

        const indexAtiva = notasAtivasNaTela.findIndex(n => n.nota === notaTeclada);

        if (indexAtiva !== -1) {
            const notaAcertada = notasAtivasNaTela[indexAtiva];
            notaAcertada.elemento.remove();
            notasAtivasNaTela.splice(indexAtiva, 1);

            correctHitsInRow++;
            score += comboActive ? 20 : 10;
            if (!comboActive) {
                specialMeter += 10;
                if (specialMeter >= 100) ativarCombo();
            }

            piscarFeedbackTecla(notaTeclada, true);
            if (!audioMuted) new Audio('success.mp3').play().catch(() => {});

            if (correctHitsInRow % hitsPerLevel === 0) levelUp();

            if (notasAtivasNaTela.length === 0) {
                setTimeout(spawnGrupo, 300);
            }
        } else {
            lives--;
            resetarCombo();
            if (!audioMuted) new Audio('miss.mp3').play().catch(() => {});
            piscarFeedbackTecla(notaTeclada, false);
            verificarDerrota();
        }
        atualizarHUD();
    }

    function computarErro(idNota) {
        if (gameIsOver) return;
        
        const index = notasAtivasNaTela.findIndex(n => n.id === idNota);
        if (index !== -1) {
            notasAtivasNaTela[index].elemento.remove();
            notasAtivasNaTela.splice(index, 1);
            
            lives--;
            resetarCombo();
            if (!audioMuted) new Audio('miss.mp3').play().catch(() => {});
            
            verificarDerrota();
            
            if (!gameIsOver && notasAtivasNaTela.length === 0) {
                setTimeout(spawnGrupo, 400);
            }
            atualizarHUD();
        }
    }

    function verificarDerrota() {
        if (lives <= 0) {
            gameIsOver = true;
            tocarSom(somSucesso); 
            limparPauta();
            areaJogo.style.display = 'none';
            telaVitoria.style.display = 'flex';
            document.getElementById('modal-title').textContent = "Fim de Jogo! 🎹";
            document.getElementById('modal-text').textContent = "Você mandou bem. Pontuação final:";
            document.getElementById('final-score').textContent = score;
        }
    }

    function ativarCombo() {
        comboActive = true; specialMeter = 100; atualizarHUD();
        comboTimeout = setTimeout(resetarCombo, 6000);
    }
    
    function resetarCombo() {
        clearTimeout(comboTimeout); comboActive = false; specialMeter = 0; atualizarHUD();
    }
    
    function levelUp() {
        if (level < Object.keys(levelSpeeds).length) {
            level++; noteSpeed = levelSpeeds[level];
            levelUpAlert.style.display = 'block';
            setTimeout(() => { levelUpAlert.style.display = 'none'; }, 1200);
        }
    }

    function atualizarHUD() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        livesDisplay.textContent = '♥'.repeat(Math.max(0, lives));
        specialBar.style.width = `${specialMeter}%`;
        specialBar.style.backgroundColor = comboActive ? '#f1c40f' : '#f39c12';
    }

    function piscarFeedbackTecla(nota, correto) {
        const tecla = pianoKeyboard.querySelector(`[data-note="${nota}"]`);
        if (!tecla) return;
        const cls = correto ? 'correct-flash' : 'wrong-flash';
        tecla.classList.add(cls);
        setTimeout(() => tecla.classList.remove(cls), 250);
    }

    function criarTeclado() {
        pianoKeyboard.innerHTML = '';
        naturalNotes.forEach(note => {
            const t = document.createElement('div');
            t.className = 'key white'; t.dataset.note = note; t.textContent = noteNames[note];
            t.addEventListener('mousedown', (e) => { e.preventDefault(); processarToqueNota(note); });
            t.addEventListener('touchstart', (e) => { e.preventDefault(); processarToqueNota(note); }, {passive: false});
            pianoKeyboard.appendChild(t);
        });
    }

    // --- RANKING E SALVAMENTO ---
    function salvarPontuacao() {
        const nome = playerNameInput.value.trim() || 'Iniciante';
        const recordes = JSON.parse(localStorage.getItem('pianoRushScores')) || [];
        recordes.push({ name: nome, score: score });
        recordes.sort((a, b) => b.score - a.score);
        localStorage.setItem('pianoRushScores', JSON.stringify(recordes.slice(0, 5)));
        playerNameInput.value = '';
        exibirRanking();
    }

    function exibirRanking() {
        const lista = document.getElementById('leaderboard-list');
        const recordes = JSON.parse(localStorage.getItem('pianoRushScores')) || [];
        lista.innerHTML = '';
        
        if (recordes.length === 0) {
            lista.innerHTML = '<li>Nenhum recorde ainda!</li>';
        } else {
            recordes.forEach((item, index) => {
                lista.innerHTML += `<li><span>${index+1}º ${item.name}</span> <strong>${item.score} pts</strong></li>`;
            });
        }
        leaderboardModal.style.display = 'flex';
    }

    btnModoPauta.addEventListener('click', () => iniciarJogo('pauta'));
    btnModoAcordes.addEventListener('click', () => iniciarJogo('acordes'));
    btnInstrucoes.addEventListener('click', () => { tocarSom(somClick); menuInicial.style.display = 'none'; telaInstrucoes.style.display = 'flex'; });
    btnEntendido.addEventListener('click', abrirMenu);
    btnReiniciar.addEventListener('click', abrirMenu);
    quitButton.addEventListener('click', abrirMenu);
    
    saveScoreButton.addEventListener('click', salvarPontuacao);
    showLeaderboardBtn.addEventListener('click', exibirRanking);
    closeLeaderboard.addEventListener('click', () => { leaderboardModal.style.display = 'none'; });

    audioToggle.addEventListener('click', () => {
        audioMuted = !audioMuted;
        if (audioMuted) {
            musicaFundo.pause();
            audioToggle.textContent = '❌';
        } else {
            audioToggle.textContent = '🔊';
            if (gameIsOver) musicaFundo.play().catch(() => {});
        }
    });
    
    // Inicialização
    configurarMIDI();
    criarTeclado();
    abrirMenu();
});