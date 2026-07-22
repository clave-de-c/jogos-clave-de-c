// --- 1. SINTETIZADOR DE ÁUDIO ROBÓTICO (WEB AUDIO API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarNotaRobo(frequencia, duracao, tempoInicio) {
    const oscilador = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();
    
    // Forma de onda 'square' dá aquele tom característico de robô/video game antigo
    oscilador.type = 'square'; 
    oscilador.frequency.setValueAtTime(frequencia, tempoInicio);
    
    // Volume e Fade Out
    ganho.gain.setValueAtTime(0.02, tempoInicio); // Volume baixinho (0.05)
    ganho.gain.exponentialRampToValueAtTime(0.001, tempoInicio + duracao);

    oscilador.connect(ganho);
    ganho.connect(audioCtx.destination);
    
    oscilador.start(tempoInicio);
    oscilador.stop(tempoInicio + duracao);
}

function tocarSomAcertoRobo() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const agora = audioCtx.currentTime;
    // Bipes rápidos subindo (Alegria)
    tocarNotaRobo(440, 0.1, agora);
    tocarNotaRobo(660, 0.1, agora + 0.1);
    tocarNotaRobo(880, 0.2, agora + 0.2);
}

function tocarSomVitoriaRobo() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const agora = audioCtx.currentTime;
    // Arpejo de robô vitorioso
    const notas = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    notas.forEach((freq, i) => {
        tocarNotaRobo(freq, 0.15, agora + i * 0.15);
    });
}

// --- 2. CONFIGURAÇÕES DO JOGO DA MEMÓRIA ---
const paresFolclore = [
    { id: 'boto', arquivo: 'botocorderosa1.png' },
    { id: 'boto', arquivo: 'botocorderosa2.png' },
    { id: 'boi', arquivo: 'bumbameuboi1.png' },
    { id: 'boi', arquivo: 'bumbameuboi2.png' },
    { id: 'curupira', arquivo: 'curupira1.png' },
    { id: 'curupira', arquivo: 'curupira2.png' },
    { id: 'iara', arquivo: 'iara1.png' },
    { id: 'iara', arquivo: 'iara2.png' },
    { id: 'mula', arquivo: 'mulasemcabeca1.png' },
    { id: 'mula', arquivo: 'mulasemcabeca2.png' },
    { id: 'saci', arquivo: 'saciperere1.png' },
    { id: 'saci', arquivo: 'saciperere2.png' }
];

let cartasDoBaralho = [];
let primeiraCarta = null;
let segundaCarta = null;
let travarTabuleiro = false;
let paresEncontrados = 0;
const totalPares = paresFolclore.length / 2;

const menuInicial = document.getElementById('menu-inicial');
const areaJogo = document.getElementById('area-jogo');
const telaVitoria = document.getElementById('tela-vitoria');
const placarContainer = document.getElementById('placar-container');
const btnVoltar = document.getElementById('btn-voltar');
const musicaFundo = document.getElementById('musica-fundo');
const tabuleiro = document.getElementById('tabuleiro-memoria');
const feedbackTexto = document.getElementById('feedback-txt');

// Configura o volume inicial da música (bem baixinho em 20%)
document.addEventListener('DOMContentLoaded', () => {
    if (musicaFundo) {
        musicaFundo.volume = 0.2; 
    }
});

function ocultarTodasTelas() {
    menuInicial.style.display = 'none';
    areaJogo.style.display = 'none';
    telaVitoria.style.display = 'none';
    placarContainer.style.display = 'none';
    btnVoltar.style.display = 'none';
}

function voltarMenu() {
    tocarSomFisico('som-click');
    ocultarTodasTelas();
    menuInicial.style.display = 'flex';
}

function iniciarJogo() {
    tocarSomFisico('som-click');
    // A música de fundo continua tocando livremente!

    ocultarTodasTelas();
    areaJogo.style.display = 'flex';
    placarContainer.style.display = 'block';
    btnVoltar.style.display = 'block';

    reiniciarDadosDoJogo();
    gerarCartasNoTabuleiro();
}

function reiniciarDadosDoJogo() {
    primeiraCarta = null;
    segundaCarta = null;
    travarTabuleiro = false;
    paresEncontrados = 0;
    document.getElementById('pontos').textContent = paresEncontrados;
    feedbackTexto.textContent = "Encontre os Pares!";
    feedbackTexto.className = "msg-neutra";
    
    cartasDoBaralho = [...paresFolclore];
    cartasDoBaralho.sort(() => Math.random() - 0.5);
}

function gerarCartasNoTabuleiro() {
    tabuleiro.innerHTML = ''; 

    cartasDoBaralho.forEach((cartaObj, index) => {
        const cartaDiv = document.createElement('div');
        cartaDiv.classList.add('carta');
        cartaDiv.dataset.id = cartaObj.id; 

        cartaDiv.innerHTML = `
            <div class="verso">${index + 1}</div>
            <div class="face"><img src="${cartaObj.arquivo}" alt="Carta ${cartaObj.id}"></div>
        `;

        cartaDiv.addEventListener('click', virarCarta);
        tabuleiro.appendChild(cartaDiv);
    });
}

function virarCarta() {
    if (travarTabuleiro || this === primeiraCarta) return;

    tocarSomFisico('som-click');
    this.classList.add('flip'); 

    if (!primeiraCarta) {
        primeiraCarta = this;
        return;
    }

    segundaCarta = this;
    verificarPar();
}

function verificarPar() {
    let ehPar = primeiraCarta.dataset.id === segundaCarta.dataset.id;
    ehPar ? desabilitarCartas() : desvirarCartas();
}

function desabilitarCartas() {
    // Toca o nosso som de robô fabricado em JS
    tocarSomAcertoRobo(); 
    
    paresEncontrados++;
    document.getElementById('pontos').textContent = paresEncontrados;
    feedbackTexto.textContent = "Muito bem! Acertou um par.";
    feedbackTexto.className = "msg-sucesso";

    primeiraCarta.removeEventListener('click', virarCarta);
    segundaCarta.removeEventListener('click', virarCarta);

    resetarRodada();

    if (paresEncontrados === totalPares) {
        setTimeout(finalizarJogo, 1000);
    }
}

function desvirarCartas() {
    travarTabuleiro = true;
    feedbackTexto.textContent = "Ops! Tente novamente.";
    feedbackTexto.className = "msg-erro";

    setTimeout(() => {
        primeiraCarta.classList.remove('flip');
        segundaCarta.classList.remove('flip');
        feedbackTexto.textContent = "Encontre os Pares!";
        feedbackTexto.className = "msg-neutra";
        resetarRodada();
    }, 1500); 
}

function resetarRodada() {
    [primeiraCarta, segundaCarta] = [null, null];
    travarTabuleiro = false;
}

function finalizarJogo() {
    // Toca o som da vitória robótica final
    tocarSomVitoriaRobo();
    ocultarTodasTelas();
    telaVitoria.style.display = 'flex';
}

// --- 3. CONTROLE DOS ÁUDIOS FÍSICOS (Click e Fundo) ---
function tocarSomFisico(id) {
    const som = document.getElementById(id);
    if (som) {
        som.currentTime = 0; 
        som.play().catch(()=>{});
    }
}

function toggleMusica() {
    const btn = document.getElementById('audio-toggle');
    if (musicaFundo.paused) {
        musicaFundo.play();
        btn.textContent = '🔊';
    } else {
        musicaFundo.pause();
        btn.textContent = '🔇';
    }
}