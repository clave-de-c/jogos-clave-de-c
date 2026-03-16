let pontos = 0;
let desafio = {};
let musicaIniciada = false;
const ctx = new (window.AudioContext || window.webkitAudioContext)();

const PARAMS = {
    altura: { labels: ["Grave", "Agudo"], vals: [220, 880], colors: ["#d41e1e", "#38b6ff"] },
    intensidade: { labels: ["Fraco", "Forte"], vals: [0.02, 1.80], colors: ["#f18c4d", "#10ad54"] },
    duracao: { labels: ["Curto", "Longo"], vals: [0.15, 1.8], colors: ["#ffda43", "#7c45e8"] },
    timbre: { labels: ["Suave", "Brilhante"], vals: ["sine", "square"], colors: ["#9b51e0", "#2d9cdb"] }
};

function ligarMusica() {
    if (!musicaIniciada) {
        document.getElementById('musica-fundo').volume = 0.1;
        document.getElementById('musica-fundo').play();
        musicaIniciada = true;
    }
}

function treinar(tipo, idx) {
    ligarMusica();
    if (ctx.state === 'suspended') ctx.resume();
    tocarSomPuro(tipo, PARAMS[tipo].vals[idx]);
}

function tocarSomPuro(tipo, val) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    let f = 440, v = 0.2, t = 0.6, o = "triangle";
    if (tipo === "altura") f = val;
    if (tipo === "intensidade") v = val;
    if (tipo === "duracao") t = val;
    if (tipo === "timbre") o = val;
    osc.type = o;
    osc.frequency.setValueAtTime(f, ctx.currentTime);
    gain.gain.setValueAtTime(v, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t);
    osc.stop(ctx.currentTime + t);
}

function iniciarJogo() {
    ligarMusica();
    pontos = 0;
    document.getElementById('pontos').innerText = pontos;
    document.getElementById('placar-container').classList.remove('hidden');
    document.getElementById('btn-voltar').classList.remove('hidden');
    trocarTela('area-jogo');
    proximaRodada();
}

function proximaRodada() {
    if (pontos >= 10) {
        document.getElementById('som-sucesso').play();
        trocarTela('tela-vitoria');
        document.getElementById('placar-container').classList.add('hidden');
        document.getElementById('btn-voltar').classList.add('hidden');
        return;
    }
    document.getElementById('opcoes-respostas').classList.add('hidden');
    document.getElementById('feedback-txt').innerText = "Prepare os ouvidos...";
    document.getElementById('feedback-txt').className = "msg-neutra";
    const chaves = Object.keys(PARAMS);
    const par = chaves[Math.floor(Math.random() * chaves.length)];
    const idx = Math.random() > 0.5 ? 1 : 0;
    desafio = { tipo: par, resp: PARAMS[par].labels[idx], val: PARAMS[par].vals[idx] };
    const container = document.getElementById('opcoes-respostas');
    container.innerHTML = "";
    PARAMS[par].labels.forEach((label, i) => {
        const btn = document.createElement('button');
        btn.className = "btn-main";
        btn.style.backgroundColor = PARAMS[par].colors[i];
        btn.style.color = "white";
        btn.innerText = label;
        btn.onclick = () => { document.getElementById('som-click').play(); validar(label); };
        container.appendChild(btn);
    });
}

function tocarDesafio() {
    if (ctx.state === 'suspended') ctx.resume();
    tocarSomPuro(desafio.tipo, desafio.val);
    document.getElementById('opcoes-respostas').classList.remove('hidden');
    document.getElementById('feedback-txt').innerText = "O que foi isso?";
}

function validar(escolha) {
    if (escolha === desafio.resp) {
        pontos++;
        document.getElementById('pontos').innerText = pontos;
        document.getElementById('feedback-txt').innerText = "Correto! 🎉";
        document.getElementById('feedback-txt').className = "msg-sucesso";
        setTimeout(proximaRodada, 1200);
    } else {
        document.getElementById('feedback-txt').innerText = "Tente de novo! ❌";
        document.getElementById('feedback-txt').className = "msg-erro";
    }
}

function trocarTela(id) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function abrirInstrucoes() { ligarMusica(); trocarTela('tela-instrucoes'); }
function voltarMenu() { 
    document.getElementById('placar-container').classList.add('hidden');
    document.getElementById('btn-voltar').classList.add('hidden');
    trocarTela('menu-inicial'); 
}