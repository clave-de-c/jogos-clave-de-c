// --- SISTEMA DE ÁUDIO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const fundoMusica = document.getElementById('fundo-animado');
const finalAudio = document.getElementById('fim-jogo');
let fundoAtivo = false;
let audioInicializado = false;

fundoMusica.volume = 0.08; 

function iniciarAudioPrime() {
    if (!audioInicializado) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        fundoMusica.play().then(() => {
            fundoAtivo = true;
            document.getElementById('bg-toggle').innerText = "🔊";
            audioInicializado = true;
        }).catch(() => {});
    }
}

function toggleFundo() {
    const btn = document.getElementById('bg-toggle');
    if (!fundoAtivo) {
        fundoMusica.play();
        btn.innerText = "🔊";
        fundoAtivo = true;
    } else {
        fundoMusica.pause();
        btn.innerText = "🔇";
        fundoAtivo = false;
    }
}

function tocarClick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function tocarSucesso(turbo) {
    const freqBase = turbo ? 800 : 523.25;
    const notas = [freqBase, freqBase*1.25, freqBase*1.5];
    notas.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + i*0.08);
        g.gain.setValueAtTime(0.05, audioCtx.currentTime + i*0.08);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i*0.08 + 0.2);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i*0.08); osc.stop(audioCtx.currentTime + i*0.08 + 0.2);
    });
}

// --- CONFIGURAÇÕES DE NOTAS COLORIDAS ---
const cores = { "Dó": "#d41e1e", "Ré": "#f18c4d", "Mi": "#ffda43", "Fá": "#10ad54", "Sol": "#38b6ff", "Lá": "#004aad", "Si": "#7c45e8" };

const acordesMaiores = [
    { nome: "Dó Maior (C)", notas: ["Dó", "Mi", "Sol"] }, { nome: "Ré Maior (D)", notas: ["Ré", "Fá#", "Lá"] },
    { nome: "Mi Maior (E)", notas: ["Mi", "Sol#", "Si"] }, { nome: "Fá Maior (F)", notas: ["Fá", "Lá", "Dó"] },
    { nome: "Sol Maior (G)", notas: ["Sol", "Si", "Ré"] }, { nome: "Lá Maior (A)", notas: ["Lá", "Dó#", "Mi"] },
    { nome: "Si Maior (B)", notas: ["Si", "Ré#", "Fá#"] }
];

const acordesMenores = [
    { nome: "Dó Menor (Cm)", notas: ["Dó", "Mib", "Sol"] }, { nome: "Ré Menor (Dm)", notas: ["Ré", "Fá", "Lá"] },
    { nome: "Mi Menor (Em)", notas: ["Mi", "Sol", "Si"] }, { nome: "Fá Menor (Fm)", notas: ["Fá", "Láb", "Dó"] },
    { nome: "Sol Menor (Gm)", notas: ["Sol", "Sib", "Ré"] }, { nome: "Lá Menor (Am)", notas: ["Lá", "Dó", "Mi"] },
    { nome: "Si Menor (Bm)", notas: ["Si", "Ré", "Fá#"] }
];

// --- ESTADO ---
let modoAtual = 'misto';
let baralhoAtivo = [];
let pontos = 0;
let combo = 0;
let rodadaAtual = 0;
const totalRodadas = 20;
let turboAtivo = false;
let tempoRestante = 100;
let timerLoop;
let indiceInversaoAtual = 0;

function selecionarModo(modo, btn) {
    modoAtual = modo;
    document.querySelectorAll('.btn-modo').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tocarClick();
    iniciarAudioPrime();
}

function iniciarJogo() {
    iniciarAudioPrime();
    document.getElementById('menu-inicial').classList.remove('active');
    document.getElementById('area-jogo').classList.add('active');
    document.getElementById('combo-display').classList.remove('hidden');
    document.getElementById('rodada-display').classList.remove('hidden');
    pontos = 0; combo = 0; rodadaAtual = 0; turboAtivo = false;
    atualizarPlacar();
    sortearAcorde();
}

function sortearAcorde() {
    rodadaAtual++;
    if (rodadaAtual > totalRodadas) { finalizarJogo(); return; }
    document.getElementById('rodada').innerText = rodadaAtual;

    if (baralhoAtivo.length === 0) {
        if (modoAtual === 'maior') baralhoAtivo = [...acordesMaiores];
        else if (modoAtual === 'menor') baralhoAtivo = [...acordesMenores];
        else baralhoAtivo = [...acordesMaiores, ...acordesMenores];
        baralhoAtivo.sort(() => Math.random() - 0.5);
    }

    const acorde = baralhoAtivo.pop();
    indiceInversaoAtual = Math.floor(Math.random() * 3);
    let notasExibidas = [...acorde.notas];
    if (indiceInversaoAtual === 1) notasExibidas = [notasExibidas[1], notasExibidas[2], notasExibidas[0]];
    if (indiceInversaoAtual === 2) notasExibidas = [notasExibidas[2], notasExibidas[0], notasExibidas[1]];

    document.getElementById('pergunta-txt').innerHTML = `Acorde de <strong>${acorde.nome}</strong>`;
    const container = document.getElementById('display-notas');
    container.innerHTML = "";
    notasExibidas.forEach(n => {
        const b = document.createElement('div'); b.className = "nota-bloco";
        b.style.backgroundColor = cores[n.replace('#', '').replace('b', '')];
        b.innerText = n; container.appendChild(b);
    });
    resetTimer();
}

function resetTimer() {
    clearInterval(timerLoop);
    tempoRestante = 100;
    const bar = document.getElementById('timer-bar');
    timerLoop = setInterval(() => {
        tempoRestante -= turboAtivo ? 2.5 : 1.5;
        bar.style.width = tempoRestante + "%";
        if (tempoRestante <= 0) { finalizarCombo(); sortearAcorde(); }
    }, 100);
}

function verificarResposta(idx) {
    const feedback = document.getElementById('feedback-txt');
    if (idx === indiceInversaoAtual) {
        combo++;
        if (combo >= 5) { turboAtivo = true; document.getElementById('game-card').classList.add('turbo-ativo'); }
        let pontosGanhos = 30 + (combo * 5) + Math.floor(tempoRestante / 5) + (turboAtivo ? 50 : 0);
        pontos += pontosGanhos;
        feedback.innerText = turboAtivo ? `🚀 +${pontosGanhos}` : `✅ +${pontosGanhos}`;
        feedback.style.color = "var(--green)";
        tocarSucesso(turboAtivo);
    } else {
        finalizarCombo();
        feedback.innerText = "❌ ERROU!";
        feedback.style.color = "var(--red)";
    }
    atualizarPlacar();
    setTimeout(sortearAcorde, 800);
}

function finalizarCombo() {
    combo = 0; turboAtivo = false;
    document.getElementById('game-card').classList.remove('turbo-ativo');
    atualizarPlacar();
}

function atualizarPlacar() {
    document.getElementById('pontos').innerText = pontos;
    document.getElementById('combo').innerText = combo;
}

function finalizarJogo() {
    clearInterval(timerLoop);
    document.getElementById('area-jogo').classList.remove('active');
    document.getElementById('tela-vitoria').classList.add('active');
    finalAudio.play();

    let melhorMarca = parseInt(localStorage.getItem('recorde_inversoes')) || 0;
    let ultimaPontuacao = parseInt(localStorage.getItem('ultima_pontuacao')) || 0;

    document.getElementById('melhor-marca').innerText = melhorMarca;
    document.getElementById('ponto-anterior').innerText = ultimaPontuacao;
    document.getElementById('final-pontos').innerText = pontos;

    if (pontos > melhorMarca) {
        localStorage.setItem('recorde_inversoes', pontos);
        document.getElementById('recorde-msg').classList.remove('hidden');
        document.getElementById('melhor-marca').innerText = pontos;
    } else { document.getElementById('recorde-msg').classList.add('hidden'); }
    localStorage.setItem('ultima_pontuacao', pontos);
}

function abrirInstrucoes() { document.getElementById('menu-inicial').classList.remove('active'); document.getElementById('tela-instrucoes').classList.add('active'); }
function fecharInstrucoes() { document.getElementById('tela-instrucoes').classList.remove('active'); document.getElementById('menu-inicial').classList.add('active'); }
function voltarMenu() { window.location.reload(); }