// Dicionário de Notas Oficiais[cite: 4]
const DB_NOTAS = {
    'Dó': { nome: 'Dó', cor: 'var(--nota-do)', freq: 261.63 },
    'Ré': { nome: 'Ré', cor: 'var(--nota-re)', freq: 293.66 },
    'Mi': { nome: 'Mi', cor: 'var(--nota-mi)', freq: 329.63 },
    'Fá': { nome: 'Fá', cor: 'var(--nota-fa)', freq: 349.23 },
    'Sol': { nome: 'Sol', cor: 'var(--nota-sol)', freq: 392.00 },
    'Lá': { nome: 'Lá', cor: 'var(--nota-la)', freq: 440.00 },
    'Si': { nome: 'Si', cor: 'var(--nota-si)', freq: 493.88 },
    'Dó↑':{ nome: 'Dó↑', cor: 'var(--nota-do)', freq: 523.25 } // Correção para Dó Agudo
};

// Sílabas falsas camufladas com as cores do método
const DB_FALSAS = [
    { nome: 'Bó', cor: 'var(--nota-do)' },
    { nome: 'Di', cor: 'var(--nota-re)' },
    { nome: 'Fé', cor: 'var(--nota-mi)' },
    { nome: 'Tá', cor: 'var(--nota-fa)' },
    { nome: 'Gol', cor: 'var(--nota-sol)' },
    { nome: 'Vi', cor: 'var(--nota-si)' }
];

// Sistema de Fases
const FASES = [
    { num: 1, desc: "Escala Subindo", sequencia: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'] },
    { num: 2, desc: "Escala Descendo", sequencia: ['Si', 'Lá', 'Sol', 'Fá', 'Mi', 'Ré', 'Dó'] },
    { num: 3, desc: "Arpejo Fujão", sequencia: ['Dó', 'Mi', 'Sol', 'Dó↑'], temLadrão: true }
];

let faseAtual = 0;
let indiceNotaEsperada = 0; 
let loopMovel = null; 

// Sistema de Tempo e Bateria
let tempoDecorrido = 0;
let cronometroInt = null;
let bateria = 100;
let luzRaio = 110; 
let bateriaInt = null;
let posX_luz = 50, posY_luz = 50; 

// --- NAVEGAÇÃO ---
function mostrarTela(idTela) {
    document.querySelectorAll('.game-screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function abrirInstrucoes() { mostrarTela('tela-instrucoes'); tocarSomFisico('som-click'); }
function voltarMenu() { 
    mostrarTela('menu-inicial'); 
    document.getElementById('placar-container').classList.add('hidden');
    document.getElementById('btn-voltar').classList.add('hidden');
    limparFase();
    tocarSomFisico('som-click');
}

// --- CORE DO JOGO ---
function iniciarJogo() {
    tocarSomFisico('som-click');
    faseAtual = 0;
    tempoDecorrido = 0;
    bateria = 100; // A bateria enche APENAS no início do jogo inteiro!
    
    document.getElementById('placar-container').classList.remove('hidden');
    document.getElementById('btn-voltar').classList.remove('hidden');
    
    iniciarCronometro();
    carregarFase();
    
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function carregarFase() {
    if (faseAtual >= FASES.length) {
        vencerJogo();
        return;
    }
    
    indiceNotaEsperada = 0;
    // A linha "bateria = 100;" foi removida daqui para manter o nível da fase anterior
    atualizarBarraBateria();
    iniciarDrenoBateria();
    
    document.getElementById('fase-txt').innerText = FASES[faseAtual].num;
    montarPainelEscala();
    gerarObstaculos();
    espalharPistas();
    atualizarFeedback();
    mostrarTela('area-jogo');
}

function limparFase() {
    clearInterval(cronometroInt);
    clearInterval(bateriaInt);
    clearInterval(loopMovel);
}

// --- CRONÔMETRO E BATERIA ---
function iniciarCronometro() {
    document.getElementById('cronometro-txt').innerText = "00:00";
    if(cronometroInt) clearInterval(cronometroInt);
    cronometroInt = setInterval(() => {
        tempoDecorrido++;
        let min = String(Math.floor(tempoDecorrido / 60)).padStart(2, '0');
        let seg = String(tempoDecorrido % 60).padStart(2, '0');
        document.getElementById('cronometro-txt').innerText = `${min}:${seg}`;
    }, 1000);
}

function iniciarDrenoBateria() {
    if(bateriaInt) clearInterval(bateriaInt);
    bateriaInt = setInterval(() => {
        // Tensão maior: bateria descarrega 3% a cada segundo!
        bateria -= 3; 
        if(bateria <= 0) {
            bateria = 0;
            gameOver();
        }
        atualizarBarraBateria();
    }, 1000);
}

function atualizarBarraBateria() {
    const barra = document.getElementById('bateria-nivel');
    barra.style.width = `${bateria}%`;
    
    if(bateria > 50) barra.style.backgroundColor = 'var(--green)';
    else if(bateria > 20) barra.style.backgroundColor = 'var(--gold)';
    else barra.style.backgroundColor = 'var(--red-error)';
    
    luzRaio = 30 + ((bateria / 100) * 90);
    renderizarLanterna();
}

function gameOver() {
    limparFase();
    tocarErroRobo(); 
    mostrarTela('tela-gameover');
}

function vencerJogo() {
    limparFase();
    let min = String(Math.floor(tempoDecorrido / 60)).padStart(2, '0');
    let seg = String(tempoDecorrido % 60).padStart(2, '0');
    document.getElementById('tempo-final').innerText = `${min}:${seg}`;
    tocarSomVitoria();
    mostrarTela('tela-vitoria');
}

// --- CENA DO CRIME E INTERAÇÕES ---
function montarPainelEscala() {
    const painel = document.getElementById('painel-escala');
    painel.innerHTML = '';
    const seq = FASES[faseAtual].sequencia;
    
    seq.forEach((nomeNota, index) => {
        const slot = document.createElement('div');
        slot.className = 'escala-slot';
        slot.id = `slot-${index}`;
        slot.innerText = '?';
        painel.appendChild(slot);
    });
}

function espalharPistas() {
    const container = document.getElementById('container-pistas');
    // Remove APENAS as notas antigas, mantém caixas
    document.querySelectorAll('.nota-pista, .pilha').forEach(e => e.remove());
    clearInterval(loopMovel);

    const seq = FASES[faseAtual].sequencia;
    
    // Sortear 3 notas falsas da nossa lista camuflada
    let sorteadasFalsas = [...DB_FALSAS].sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Une as notas verdadeiras com as falsas
    let arrayParaTela = [...seq, ...sorteadasFalsas];
    arrayParaTela.sort(() => Math.random() - 0.5);

    arrayParaTela.forEach(item => {
        const pista = document.createElement('div');
        pista.className = 'nota-pista';
        
        // Se for objeto, é falsa camuflada
        if(typeof item === 'object') {
            pista.style.backgroundColor = item.cor;
            pista.innerText = item.nome;
            pista.onclick = () => punicaoFalsa(pista);
        } else {
            // Nota verdadeira
            const nota = DB_NOTAS[item];
            pista.style.backgroundColor = nota.cor;
            pista.innerText = nota.nome;
            
            if (FASES[faseAtual].temLadrão && item === 'Dó↑') {
                pista.classList.add('fugitiva');
                pista.id = 'alvo-movel';
                animarFugitiva();
            }
            
            pista.onclick = function() { processarClique(this, nota); };
        }
        
        moverAleatorio(pista);
        container.appendChild(pista);
    });

    const pilha = document.createElement('div');
    pilha.className = 'pilha';
    pilha.innerText = '🔋';
    moverAleatorio(pilha);
    pilha.onclick = () => {
        tocarPowerUp();
        bateria = Math.min(100, bateria + 30); 
        atualizarBarraBateria();
        pilha.style.display = 'none';
        const fb = document.getElementById('feedback-txt');
        fb.innerText = "Lanterna Recarregada! ⚡"; fb.className = "msg-sucesso";
    };
    container.appendChild(pilha);
}

// CORREÇÃO: Mantém as notas longe das bordas (de 10% a 70%) para não serem cortadas
function moverAleatorio(elemento) {
    elemento.style.left = `${Math.floor(Math.random() * 60) + 10}%`;
    elemento.style.top = `${Math.floor(Math.random() * 60) + 10}%`;
}

function reembaralharNotas() {
    document.querySelectorAll('.nota-pista, .pilha').forEach(el => {
        if(el.id !== 'alvo-movel') moverAleatorio(el);
    });
}

function animarFugitiva() {
    loopMovel = setInterval(() => {
        const fujona = document.getElementById('alvo-movel');
        if(fujona) moverAleatorio(fujona);
    }, 1200); 
}

function gerarObstaculos() {
    const container = document.getElementById('container-pistas');
    document.querySelectorAll('.obstaculo').forEach(e => e.remove());
    
    for(let i = 0; i < 4; i++) {
        const obs = document.createElement('div');
        obs.className = 'obstaculo';
        obs.innerText = '📦';
        moverAleatorio(obs);
        
        obs.onclick = () => {
            tocarErroRobo();
            obs.classList.add('erro-anim');
            setTimeout(() => {
                obs.classList.remove('erro-anim');
                moverAleatorio(obs);
            }, 300);
        }
        container.appendChild(obs);
    }
}

// --- VALIDAÇÃO DE CLIQUES ---
function punicaoFalsa(elemento) {
    tocarErroRobo();
    elemento.classList.add('erro-anim');
    bateria -= 15; // Dano pesado na bateria!
    atualizarBarraBateria();
    const fb = document.getElementById('feedback-txt');
    fb.innerText = "Cuidado! Nota Falsa roubou bateria!"; fb.className = "msg-erro";
    setTimeout(() => elemento.classList.remove('erro-anim'), 300);
    moverAleatorio(elemento);
}

function processarClique(elementoPista, notaClicada) {
    const seq = FASES[faseAtual].sequencia;
    const nomeCorreto = seq[indiceNotaEsperada];

    if (notaClicada.nome === nomeCorreto) {
        tocarNota(notaClicada.freq);
        elementoPista.style.display = 'none'; 
        
        const slot = document.getElementById(`slot-${indiceNotaEsperada}`);
        slot.classList.add('preenchido');
        slot.style.backgroundColor = notaClicada.cor;
        slot.innerText = notaClicada.nome;

        indiceNotaEsperada++;
        
        if (indiceNotaEsperada >= seq.length) {
            clearInterval(bateriaInt);
            const fb = document.getElementById('feedback-txt');
            fb.innerText = "Missão Concluída! Avançando..."; fb.className = "msg-sucesso";
            tocarPowerUp();
            setTimeout(() => {
                faseAtual++;
                carregarFase();
            }, 2000);
        } else {
            const fb = document.getElementById('feedback-txt');
            fb.innerText = `Ótimo! Agora encontre o ${seq[indiceNotaEsperada]}.`; fb.className = "msg-sucesso";
            reembaralharNotas(); 
        }
    } else {
        tocarErroRobo();
        elementoPista.classList.add('erro-anim');
        const fb = document.getElementById('feedback-txt');
        fb.innerText = `Ops! Você precisa do ${nomeCorreto} agora.`; fb.className = "msg-erro";
        setTimeout(() => elementoPista.classList.remove('erro-anim'), 300);
    }
}

function atualizarFeedback() {
    const seq = FASES[faseAtual].sequencia;
    const fb = document.getElementById('feedback-txt');
    fb.innerText = `Desafio: Encontre a nota ${seq[indiceNotaEsperada]}!`;
    fb.className = "msg-neutra";
}

// --- LANTERNA E EVENTOS ---
const cenaCrime = document.getElementById('cena-crime');
const lanterna = document.getElementById('lanterna-overlay');

function renderizarLanterna() {
    lanterna.style.background = `radial-gradient(circle ${luzRaio}px at ${posX_luz}px ${posY_luz}px, transparent 0%, rgba(0, 0, 0, 0.98) 100%)`;
}

cenaCrime.addEventListener('mousemove', (e) => {
    const rect = cenaCrime.getBoundingClientRect();
    posX_luz = e.clientX - rect.left; posY_luz = e.clientY - rect.top;
    renderizarLanterna();
});
cenaCrime.addEventListener('touchmove', (e) => { 
    e.preventDefault(); 
    const rect = cenaCrime.getBoundingClientRect();
    posX_luz = e.touches[0].clientX - rect.left; posY_luz = e.touches[0].clientY - rect.top;
    renderizarLanterna();
}, {passive: false});

// --- ÁUDIO (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarNota(frequencia) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine'; 
    oscillator.frequency.value = frequencia;
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.start();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
    oscillator.stop(audioCtx.currentTime + 1.0);
}

function tocarErroRobo() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.stop(audioCtx.currentTime + 0.3);
}

function tocarPowerUp() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.stop(audioCtx.currentTime + 0.3);
}

function tocarSomVitoria() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { setTimeout(() => tocarNota(freq), i * 150); });
}

function tocarSomFisico(id) { const som = document.getElementById(id); if(som) { som.currentTime = 0; som.play().catch(()=>{}); } }
function toggleMusica() { const m = document.getElementById('musica-fundo'); if(m) m.paused ? m.play() : m.pause(); }
// --- CONTROLE DE ÁUDIO ---
// Define um volume mais suave para a música de fundo ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const musicaFundo = document.getElementById('musica-fundo');
    if (musicaFundo) {
        musicaFundo.volume = 0.3; // 30% do volume original
    }
});

// Função acionada pelo botão de Mutar/Desmutar
function toggleMusica() {
    const musica = document.getElementById('musica-fundo');
    const btnAudio = document.getElementById('audio-toggle');
    
    if (musica) {
        if (musica.paused) {
            musica.play();
            btnAudio.innerText = '🔊';
        } else {
            musica.pause();
            btnAudio.innerText = '🔇';
        }
    }
}