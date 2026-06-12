// script.js
document.addEventListener('DOMContentLoaded', () => {
    const musicaFundo = document.getElementById('musica-fundo');
    const somClick = document.getElementById('som-click');
    const somSucesso = document.getElementById('som-sucesso');
    const midiStatus = document.getElementById('midi-status');
    
    musicaFundo.volume = 0.1;
    musicaFundo.play().catch(() => console.log("Aguardando interação do usuário."));

    const menuInicial = document.getElementById('menu-inicial');
    const telaInstrucoes = document.getElementById('tela-instrucoes');
    const areaJogo = document.getElementById('area-jogo');
    const telaVitoria = document.getElementById('tela-vitoria');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    
    const btnModoNormal = document.getElementById('btn-modo-normal');
    const btnModoDesafio = document.getElementById('btn-modo-desafio');
    const btnInstrucoes = document.getElementById('btn-instrucoes');
    const btnEntendido = document.getElementById('btn-entendido');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const quitButton = document.getElementById('quit-button');
    const audioToggle = document.getElementById('audio-toggle');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const closeLeaderboard = document.getElementById('close-leaderboard');
    const saveScoreButton = document.getElementById('save-score-button');

    const noteTrack = document.getElementById('note-track');
    const pianoKeyboard = document.getElementById('piano-keyboard');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const livesDisplay = document.getElementById('lives');
    const specialBar = document.getElementById('special-bar');
    const levelUpAlert = document.getElementById('level-up-alert');
    const placarContainer = document.getElementById('placar-container');
    
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const finalScoreDisplay = document.getElementById('final-score');
    const playerNameInput = document.getElementById('player-name');

    // --- VARIÁVEIS DE ESTADO ---
    const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const sharpNotes = ['Cs', 'Ds', 'Fs', 'Gs', 'As'];
    const noteNames = { C: 'DÓ', D: 'RÉ', E: 'MI', F: 'FÁ', G: 'SOL', A: 'LÁ', B: 'SI', Cs: 'DÓ♯', Ds: 'RÉ♯', Fs: 'FÁ♯', Gs: 'SOL♯', As: 'LÁ♯' };
    const noteSoundFiles = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si', Cs: 'dos', Ds: 'res', Fs: 'fas', Gs: 'sols', As: 'las' };
    const levelSpeeds = { 1: 4.5, 2: 3.8, 3: 3.2, 4: 2.6, 5: 2.0, 6: 1.6 };
    const hitsPerLevel = 10;
    
    let currentNoteSet = [];
    let level, score, lives, noteSpeed, currentNote, gameIsOver = true;
    let correctHitsInRow = 0, specialMeter = 0, comboActive = false, comboTimeout;
    let audioMuted = false;

    // --- WEBMIDI API (O Motor Mágico) ---
    // Mapeamento global de Modulo 12 para extrair a nota, ignorando a oitava.
    const mapaMIDI = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

    function configurarMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, () => console.log("Erro no MIDI"));
        } else {
            console.log("Web MIDI API não suportada.");
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
                midiStatus.textContent = '🎹 MIDI Conectado';
                midiStatus.className = 'midi-badge connected';
            } else {
                midiStatus.textContent = '🎹 MIDI Off';
                midiStatus.className = 'midi-badge disconnected';
            }
        }
        
        atualizarDispositivos();
        midiAccess.onstatechange = atualizarDispositivos;
    }

    function lerMensagemMIDI(mensagem) {
        const comando = mensagem.data[0];
        const nota = mensagem.data[1];
        const velocidade = (mensagem.data.length > 2) ? mensagem.data[2] : 0;

        // Verifica se é o comando "Note On" (Geralmente 144 a 159 dependendo do canal) e possui velocidade maior que 0.
        if (comando >= 144 && comando <= 159 && velocidade > 0) {
            const notaMapeada = mapaMIDI[nota % 12]; // O % 12 descobre qual é a nota independente da oitava
            processarToqueNota(notaMapeada);
        }
    }

    // --- FUNÇÕES DE NAVEGAÇÃO / MENUS ---
    function tocarSom(som) {
        if (!audioMuted && som) {
            som.currentTime = 0;
            som.play().catch(() => {});
        }
    }

    function abrirMenu() {
        gameIsOver = true;
        noteTrack.innerHTML = '';
        currentNote = null;
        
        menuInicial.style.display = 'flex';
        telaInstrucoes.style.display = 'none';
        areaJogo.style.display = 'none';
        telaVitoria.style.display = 'none';
        
        placarContainer.classList.add('hidden');
        quitButton.classList.add('hidden');
        
        if (!audioMuted) musicaFundo.play().catch(() => {});
    }

    function abrirInstrucoes() {
        tocarSom(somClick);
        menuInicial.style.display = 'none';
        telaInstrucoes.style.display = 'flex';
    }

    function iniciarJogo(modo) {
        tocarSom(somClick);
        musicaFundo.pause();
        musicaFundo.currentTime = 0;

        currentNoteSet = (modo === 'challenge') ? [...naturalNotes, ...sharpNotes] : [...naturalNotes];
        score = 0; lives = 3; level = 1; correctHitsInRow = 0; specialMeter = 0; comboActive = false;
        noteSpeed = levelSpeeds[level];
        gameIsOver = false;

        atualizarHUD();
        
        menuInicial.style.display = 'none';
        telaInstrucoes.style.display = 'none';
        telaVitoria.style.display = 'none';
        areaJogo.style.display = 'flex';
        
        placarContainer.classList.remove('hidden');
        quitButton.classList.remove('hidden');

        setTimeout(spawnNota, 600);
    }

    // --- MECÂNICA DO JOGO ---
    function spawnNota() {
        if (gameIsOver) return;
        noteTrack.innerHTML = '';
        
        currentNote = currentNoteSet[Math.floor(Math.random() * currentNoteSet.length)];
        
        const blocoNota = document.createElement('div');
        blocoNota.className = 'note-block';
        blocoNota.textContent = noteNames[currentNote];
        
        if (sharpNotes.includes(currentNote)) {
            blocoNota.classList.add('note-sharp');
        } else {
            blocoNota.classList.add(`note-${currentNote.toLowerCase()}`);
        }

        blocoNota.style.animationDuration = `${noteSpeed}s`;
        blocoNota.addEventListener('animationend', computarErro);
        noteTrack.appendChild(blocoNota);
    }

    function processarToqueNota(notaMapeada) {
        if (gameIsOver || !currentNote) return;

        // Busca o som na raiz
        const somNota = new Audio(`${noteSoundFiles[notaMapeada]}.mp3`);
        somNota.play().catch(() => {});

        if (notaMapeada === currentNote) {
            correctHitsInRow++;
            score += comboActive ? 20 : 10;
            
            if (!comboActive) {
                specialMeter += sharpNotes.includes(notaMapeada) ? 20 : 10;
                if (specialMeter >= 100) ativarCombo();
            }

            piscarFeedbackTecla(notaMapeada, true);
            const audioSuccess = new Audio('success.mp3');
            audioSuccess.play().catch(() => {});

            if (correctHitsInRow % hitsPerLevel === 0) levelUp();

            noteTrack.innerHTML = '';
            currentNote = null;
            setTimeout(spawnNota, 300);
        } else {
            computarErro();
            piscarFeedbackTecla(notaMapeada, false);
        }
        atualizarHUD();
    }

    function computarErro() {
        if (gameIsOver) return;
        lives--;
        resetarCombo();
        
        const audioMiss = new Audio('miss.mp3');
        audioMiss.play().catch(() => {});

        noteTrack.innerHTML = '';
        currentNote = null;

        if (lives <= 0) {
            finalizarJogo();
        } else {
            atualizarHUD();
            setTimeout(spawnNota, 500);
        }
    }

    function ativarCombo() {
        comboActive = true;
        specialMeter = 100;
        atualizarHUD();
        comboTimeout = setTimeout(resetarCombo, 6000);
    }

    function resetarCombo() {
        clearTimeout(comboTimeout);
        comboActive = false;
        specialMeter = 0;
        atualizarHUD();
    }

    function levelUp() {
        if (level < Object.keys(levelSpeeds).length) {
            level++;
            noteSpeed = levelSpeeds[level];
            levelUpAlert.style.display = 'block';
            setTimeout(() => { levelUpAlert.style.display = 'none'; }, 1200);
        }
    }

    function finalizarJogo() {
        gameIsOver = true;
        tocarSom(somSucesso);
        
        areaJogo.style.display = 'none';
        telaVitoria.style.display = 'flex';
        
        modalTitle.textContent = "Fim de Jogo! 🎹";
        modalText.textContent = "Sua pontuação final:";
        finalScoreDisplay.textContent = score;
    }

    // --- RANKING LOCALSTORAGE ---
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

    // --- INTERFACES VISUAIS ---
    function atualizarHUD() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        livesDisplay.textContent = '♥'.repeat(Math.max(0, lives));
        specialBar.style.width = `${specialMeter}%`;
        if (comboActive) {
            specialBar.style.backgroundColor = '#f1c40f';
        } else {
            specialBar.style.backgroundColor = '#f39c12';
        }
    }

    function piscarFeedbackTecla(nota, correto) {
        const tecla = pianoKeyboard.querySelector(`[data-note="${nota}"]`);
        if (!tecla) return;
        const classePiscada = correto ? 'correct-flash' : 'wrong-flash';
        tecla.classList.add(classePiscada);
        setTimeout(() => tecla.classList.remove(classePiscada), 250);
    }

    function criarTeclado() {
        pianoKeyboard.innerHTML = '';
        naturalNotes.forEach(note => {
            const tecla = document.createElement('div');
            tecla.className = 'key white';
            tecla.dataset.note = note;
            tecla.textContent = noteNames[note];
            vincularInteracaoTecla(tecla, note);
            pianoKeyboard.appendChild(tecla);
        });
        sharpNotes.forEach(note => {
            const tecla = document.createElement('div');
            tecla.className = 'key black';
            tecla.dataset.note = note;
            vincularInteracaoTecla(tecla, note);
            pianoKeyboard.appendChild(tecla);
        });
    }

    function vincularInteracaoTecla(elemento, nota) {
        const dispararAoTocar = (e) => {
            e.preventDefault();
            processarToqueNota(nota);
        };
        elemento.addEventListener('mousedown', dispararAoTocar);
        elemento.addEventListener('touchstart', dispararAoTocar, { passive: false });
    }

    // --- EVENTOS DOS BOTÕES ---
    btnModoNormal.addEventListener('click', () => iniciarJogo('normal'));
    btnModoDesafio.addEventListener('click', () => iniciarJogo('challenge'));
    btnInstrucoes.addEventListener('click', abrirInstrucoes);
    btnEntendido.addEventListener('click', abrirMenu);
    btnReiniciar.addEventListener('click', abrirMenu);
    quitButton.addEventListener('click', abrirMenu);
    saveScoreButton.addEventListener('click', salvarPontuacao);
    showLeaderboardBtn.addEventListener('click', exibirRanking);
    closeLeaderboard.addEventListener('click', () => leaderboardModal.style.display = 'none');

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
    configurarMIDI(); // Chama a função que gerencia as conexões de aparelhos musicais
    criarTeclado();
    abrirMenu();
});