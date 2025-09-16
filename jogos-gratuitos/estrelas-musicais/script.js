document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const menuInicial = document.getElementById('menu-inicial');
    const telaInstrucoes = document.getElementById('tela-instrucoes');
    const telaJogo = document.getElementById('tela-jogo');
    const telaFinal = document.getElementById('tela-final');

    const btnJogar = document.getElementById('btn-jogar');
    const btnInstrucoes = document.getElementById('btn-instrucoes');
    const btnsVoltar = document.querySelectorAll('.btn-voltar');
    const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
    const btnMute = document.getElementById('btn-mute');
    
    const btnModoLivre = document.getElementById('btn-modo-livre');
    const btnModoGuiado = document.getElementById('btn-modo-guiado');
    const mensagemGuia = document.getElementById('mensagem-guia');

    const pianoEstrelas = document.getElementById('piano-estrelas');
    const musicaFundo = document.getElementById('background-music');

    // --- Configurações do Jogo ---
    const notas = [
        { nome: 'do', cor: '#d41e1e', tecla: 'a' },
        { nome: 're', cor: '#f18c4d', tecla: 's' },
        { nome: 'mi', cor: '#ffda43', tecla: 'd' },
        { nome: 'fa', cor: '#10ad54', tecla: 'f' },
        { nome: 'sol', cor: '#38b6ff', tecla: 'g' },
        { nome: 'la', cor: '#004aad', tecla: 'h' },
        { nome: 'si', cor: '#7c45e8', tecla: 'j' }
    ];
    const keyMap = {};
    notas.forEach(nota => { keyMap[nota.tecla] = nota.nome; });

    const melodiaBrilhaEstrelinha = [
        'do', 'do', 'sol', 'sol', 'la', 'la', 'sol', 'fa', 'fa', 'mi', 'mi', 're', 're', 'do',
        'sol', 'sol', 'fa', 'fa', 'mi', 'mi', 're', 'sol', 'sol', 'fa', 'fa', 'mi', 'mi', 're',
        'do', 'do', 'sol', 'sol', 'la', 'la', 'sol', 'fa', 'fa', 'mi', 'mi', 're', 're', 'do'
    ];
    let passoAtualMelodia = 0;
    let modoDeJogo = 'livre';

    // --- Funções de Áudio ---
    const audios = {};
    notas.forEach(nota => { audios[nota.nome] = new Audio(`${nota.nome}.mp3`); });
    const audioErro = new Audio('erro.mp3');
    const audioSucesso = new Audio('sucesso.mp3');
    
    function tocarNota(nomeNota) {
        const audio = audios[nomeNota];
        if (audio) {
            audio.currentTime = 0;
            audio.play();
            
            const estrelaEl = document.querySelector(`.estrela[data-nota="${nomeNota}"]`);
            if (estrelaEl) {
                estrelaEl.classList.add('tocando');
                setTimeout(() => { estrelaEl.classList.remove('tocando'); }, 200);
            }
        }
    }
    
    // --- Funções de Navegação e Controles ---
    function mostrarTela(tela) {
        document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
        tela.style.display = 'flex';
    }

    btnJogar.addEventListener('click', () => {
        musicaFundo.pause();
        iniciarJogo();
    });

    btnInstrucoes.addEventListener('click', () => mostrarTela(telaInstrucoes));

    btnsVoltar.forEach(btn => btn.addEventListener('click', () => {
        mostrarTela(menuInicial);
        if (musicaFundo.paused && !musicaFundo.muted) {
            musicaFundo.play().catch(e => {});
        }
    }));

    btnJogarNovamente.addEventListener('click', iniciarJogo);
    
    btnMute.addEventListener('click', () => {
        musicaFundo.muted = !musicaFundo.muted;
        btnMute.textContent = musicaFundo.muted ? '🔇' : '🔊';
    });
    
    window.onload = () => {
        musicaFundo.volume = 0.3;
        musicaFundo.play().catch(e => console.log("A reprodução automática foi bloqueada."));
    };

    // --- Lógica do Jogo ---
    function criarEstrelas() {
        pianoEstrelas.innerHTML = '';
        notas.forEach(nota => {
            const estrelaEl = document.createElement('div');
            estrelaEl.classList.add('estrela');
            estrelaEl.dataset.nota = nota.nome;
            estrelaEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%; height:100%; fill:${nota.cor};"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" /></svg>`;
            estrelaEl.addEventListener('click', () => handleEstrelaClick(nota.nome));
            pianoEstrelas.appendChild(estrelaEl);
        });
    }

    function handleEstrelaClick(nomeNota) {
        if (!nomeNota) return;
        
        if (modoDeJogo === 'livre') {
            tocarNota(nomeNota);
            return;
        }

        if (modoDeJogo === 'guiado') {
            if (nomeNota === melodiaBrilhaEstrelinha[passoAtualMelodia]) {
                tocarNota(nomeNota);
                passoAtualMelodia++;
                if (passoAtualMelodia >= melodiaBrilhaEstrelinha.length) {
                    audioSucesso.currentTime = 0;
                    audioSucesso.play();
                    setTimeout(() => mostrarTela(telaFinal), 500);
                } else {
                    destacarProximaEstrela();
                }
            } else {
                audioErro.currentTime = 0;
                audioErro.play();
                pianoEstrelas.classList.add('shake');
                setTimeout(() => { pianoEstrelas.classList.remove('shake'); }, 500);
            }
        }
    }
    
    function resetarJogo() {
        passoAtualMelodia = 0;
        document.querySelectorAll('.estrela').forEach(e => e.classList.remove('piscando'));
        mensagemGuia.style.visibility = 'hidden';
    }

    function iniciarJogo() {
        mostrarTela(telaJogo);
        resetarJogo();
        mudarModo('livre'); 
    }
    
    function destacarProximaEstrela() {
        document.querySelectorAll('.estrela').forEach(e => e.classList.remove('piscando'));
        const proximaNota = melodiaBrilhaEstrelinha[passoAtualMelodia];
        const proximaEstrelaEl = document.querySelector(`.estrela[data-nota="${proximaNota}"]`);
        if (proximaEstrelaEl) {
            proximaEstrelaEl.classList.add('piscando');
        }
    }

    function mudarModo(novoModo) {
        modoDeJogo = novoModo;
        resetarJogo();
        
        if (novoModo === 'livre') {
            btnModoLivre.classList.add('modo-ativo');
            btnModoGuiado.classList.remove('modo-ativo');
            mensagemGuia.style.visibility = 'hidden';
        } else { // modo 'guiado'
            btnModoGuiado.classList.add('modo-ativo');
            btnModoLivre.classList.remove('modo-ativo');
            mensagemGuia.style.visibility = 'visible';
            destacarProximaEstrela();
        }
    }
    
    // CORREÇÃO: Garantindo que os listeners dos botões de modo estejam aqui
    btnModoLivre.addEventListener('click', () => mudarModo('livre'));
    btnModoGuiado.addEventListener('click', () => mudarModo('guiado'));

    document.addEventListener('keydown', (event) => {
        if (telaJogo.style.display !== 'flex') return;
        const notaTocada = keyMap[event.key.toLowerCase()];
        if (notaTocada) {
            handleEstrelaClick(notaTocada);
        }
    });
    
    // --- Inicialização do Jogo ---
    criarEstrelas();
    mostrarTela(menuInicial);

    // --- Seção MIDI ---
    function iniciarMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess()
                .then(onMIDISuccess, onMIDIFailure);
        } else {
            console.log('Seu navegador não suporta a Web MIDI API. Tente usar o Google Chrome ou Edge.');
        }
    }

    function onMIDISuccess(midiAccess) {
        console.log('Acesso MIDI permitido!');
        for (var input of midiAccess.inputs.values()) {
            input.onmidimessage = getMIDIMessage;
            console.log(`Dispositivo MIDI conectado: ${input.name}`);
        }
    }

    function onMIDIFailure() {
        console.log('Não foi possível acessar seus dispositivos MIDI.');
    }

    function getMIDIMessage(message) {
        if (telaJogo.style.display !== 'flex') return;
        const command = message.data[0];
        const noteNumber = message.data[1];
        const velocity = (message.data.length > 2) ? message.data[2] : 0;

        if (command === 144 && velocity > 0) {
            const nomeNota = midiNoteToName(noteNumber);
            handleEstrelaClick(nomeNota);
        }
    }

    function midiNoteToName(noteNumber) {
        const noteIndex = noteNumber % 12;
        const noteMap = {
            0: 'do', 2: 're', 4: 'mi', 5: 'fa', 7: 'sol', 9: 'la', 11: 'si'
        };
        return noteMap[noteIndex];
    }

    iniciarMIDI();
});