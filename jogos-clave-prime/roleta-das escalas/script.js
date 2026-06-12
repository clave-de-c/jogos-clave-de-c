// --- CONFIGURAÇÃO DE ÁUDIO SINTETIZADO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playNotaSorteada(frequencia) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequencia;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
}

// --- BANCO DE DADOS MUSICAL: O CICLO COMPLETO (12 Tons, 8 Notas) ---
const notas = [
    { id: 'c', nome: 'DÓ', cor: 'var(--do)', freq: 261.63, 
      escala: [{n:'Dó', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó', c:'--do'}] },
    { id: 'g', nome: 'SOL', cor: 'var(--sol)', freq: 392.00,
      escala: [{n:'Sol', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá#', c:'--fa'}, {n:'Sol', c:'--sol'}] },
    { id: 'd', nome: 'RÉ', cor: 'var(--re)', freq: 293.66,
      escala: [{n:'Ré', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá#', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó#', c:'--do'}, {n:'Ré', c:'--re'}] },
    { id: 'a', nome: 'LÁ', cor: 'var(--la)', freq: 440.00,
      escala: [{n:'Lá', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó#', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá#', c:'--fa'}, {n:'Sol#', c:'--sol'}, {n:'Lá', c:'--la'}] },
    { id: 'e', nome: 'MI', cor: 'var(--mi)', freq: 329.63,
      escala: [{n:'Mi', c:'--mi'}, {n:'Fá#', c:'--fa'}, {n:'Sol#', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó#', c:'--do'}, {n:'Ré#', c:'--re'}, {n:'Mi', c:'--mi'}] },
    { id: 'b', nome: 'SI', cor: 'var(--si)', freq: 493.88,
      escala: [{n:'Si', c:'--si'}, {n:'Dó#', c:'--do'}, {n:'Ré#', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá#', c:'--fa'}, {n:'Sol#', c:'--sol'}, {n:'Lá#', c:'--la'}, {n:'Si', c:'--si'}] },
    { id: 'fs', nome: 'FÁ#', cor: 'var(--fa)', freq: 369.99,
      escala: [{n:'Fá#', c:'--fa'}, {n:'Sol#', c:'--sol'}, {n:'Lá#', c:'--la'}, {n:'Si', c:'--si'}, {n:'Dó#', c:'--do'}, {n:'Ré#', c:'--re'}, {n:'Mi#', c:'--mi'}, {n:'Fá#', c:'--fa'}] },
    { id: 'db', nome: 'RÉb', cor: 'var(--re)', freq: 277.18,
      escala: [{n:'Réb', c:'--re'}, {n:'Mib', c:'--mi'}, {n:'Fá', c:'--fa'}, {n:'Solb', c:'--sol'}, {n:'Láb', c:'--la'}, {n:'Sib', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Réb', c:'--re'}] },
    { id: 'ab', nome: 'LÁb', cor: 'var(--la)', freq: 415.30,
      escala: [{n:'Láb', c:'--la'}, {n:'Sib', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Réb', c:'--re'}, {n:'Mib', c:'--mi'}, {n:'Fá', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Láb', c:'--la'}] },
    { id: 'eb', nome: 'MIb', cor: 'var(--mi)', freq: 311.13,
      escala: [{n:'Mib', c:'--mi'}, {n:'Fá', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Láb', c:'--la'}, {n:'Sib', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mib', c:'--mi'}] },
    { id: 'bb', nome: 'SIb', cor: 'var(--si)', freq: 466.16,
      escala: [{n:'Sib', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mib', c:'--mi'}, {n:'Fá', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Sib', c:'--si'}] },
    { id: 'f', nome: 'FÁ', cor: 'var(--fa)', freq: 349.23,
      escala: [{n:'Fá', c:'--fa'}, {n:'Sol', c:'--sol'}, {n:'Lá', c:'--la'}, {n:'Sib', c:'--si'}, {n:'Dó', c:'--do'}, {n:'Ré', c:'--re'}, {n:'Mi', c:'--mi'}, {n:'Fá', c:'--fa'}] }
];

let notasDisponiveis = [...notas]; 
let anguloAtual = 0;
let rodadaAtual = 1;
let estadoBotao = 'GIRAR'; 

const canvas = document.getElementById('canvas-roleta');
const ctx = canvas.getContext('2d');

function desenharRoleta() {
    document.fonts.ready.then(() => {
        const fatias = notas.length;
        const anguloFatia = (2 * Math.PI) / fatias;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        notas.forEach((nota, i) => {
            const anguloInicio = i * anguloFatia;
            ctx.beginPath();
            
            const corFinal = getComputedStyle(document.documentElement).getPropertyValue(nota.cor.match(/--[a-z]+/)[0]);
            ctx.fillStyle = corFinal.trim();
            
            ctx.moveTo(200, 200); 
            ctx.arc(200, 200, 195, anguloInicio, anguloInicio + anguloFatia);
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.stroke();

            ctx.save();
            ctx.translate(200, 200);
            ctx.rotate(anguloInicio + anguloFatia / 2);
            ctx.fillStyle = "white";
            ctx.font = "800 18px 'Poppins'"; 
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(nota.nome, 160, 0); 
            ctx.restore();
        });
    });
}

// --- LÓGICA DO JOGO ---
function girarRoleta() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const btn = document.getElementById('btn-acao');
    const feedbackTxt = document.getElementById('feedback-txt');
    const roletaContainer = document.getElementById('container-roleta');
    const escalaDisplay = document.getElementById('escala-display');

    if (estadoBotao === 'TOQUEI') {
        rodadaAtual++;
        if(rodadaAtual > 12) {
            finalizarJogo();
            return;
        }
        document.getElementById('pontos').innerText = rodadaAtual;
        roletaContainer.classList.remove('hidden');
        escalaDisplay.classList.add('hidden');
        escalaDisplay.innerHTML = '';
        btn.innerHTML = "GIRAR ROLETA";
        btn.classList.remove('acao-concluida');
        feedbackTxt.innerText = "Prepare o seu instrumento...";
        estadoBotao = 'GIRAR';
        return;
    }

    // GIRANDO
    btn.disabled = true;
    feedbackTxt.innerText = "Sorteando a escala...";

    const indiceSorteado = Math.floor(Math.random() * notasDisponiveis.length);
    const notaVencedora = notasDisponiveis[indiceSorteado];
    notasDisponiveis.splice(indiceSorteado, 1);

    const indiceVisual = notas.findIndex(n => n.id === notaVencedora.id);
    const fatias = notas.length;
    const anguloFatia = 360 / fatias;
    const centroDeg = (indiceVisual * anguloFatia) + (anguloFatia / 2); 
    const giroNecessario = 270 - centroDeg; 

    let giroBase = giroNecessario - (anguloAtual % 360);
    if (giroBase < 0) giroBase += 360; 
    const offsetSorteio = (Math.random() * (anguloFatia * 0.6)) - (anguloFatia * 0.3);
    const voltasExtras = Math.floor(Math.random() * 3) + 5; 
    const totalGiro = giroBase + offsetSorteio + (360 * voltasExtras);
    
    anguloAtual += totalGiro;
    canvas.style.transform = `rotate(${anguloAtual}deg)`;

    let ticks = 0;
    const intervalTick = setInterval(() => {
        playTick();
        ticks++;
        if(ticks > 30) clearInterval(intervalTick); 
    }, 120);

    setTimeout(() => {
        playNotaSorteada(notaVencedora.freq);
        
        roletaContainer.classList.add('hidden');
        escalaDisplay.classList.remove('hidden');
        
        notaVencedora.escala.forEach((n, idx) => {
            setTimeout(() => {
                const bolinha = document.createElement('div');
                bolinha.className = 'nota-bolinha';
                bolinha.style.backgroundColor = `var(${n.c})`;
                bolinha.innerText = n.n;
                escalaDisplay.appendChild(bolinha);
            }, idx * 150);
        });

        feedbackTxt.innerHTML = `✨ Escala de <strong>${notaVencedora.nome}</strong>! Toque as notas:`;
        btn.innerHTML = "JÁ TOQUEI!";
        btn.classList.add('acao-concluida');
        btn.disabled = false;
        estadoBotao = 'TOQUEI';

    }, 4000);
}

// --- NAVEGAÇÃO DO APP E ÁUDIO ---
const musicaFundo = document.getElementById('musica-fundo');
musicaFundo.volume = 0.02; // Volume a 2%[cite: 8]
let usuarioMutou = false;

function toggleMusica() {
    if(musicaFundo.paused) { 
        musicaFundo.play(); 
        document.getElementById('audio-toggle').innerText = "🔊";
        usuarioMutou = false; 
    } else { 
        musicaFundo.pause(); 
        document.getElementById('audio-toggle').innerText = "🔇";
        usuarioMutou = true; 
    }
}

function iniciarJogo() {
    if(!usuarioMutou && musicaFundo.paused) {
        musicaFundo.play().catch(() => console.log("Áudio bloqueado pelo navegador"));
    }
    
    document.getElementById('menu-inicial').classList.remove('active');
    document.getElementById('area-jogo').classList.add('active');
    document.getElementById('btn-voltar').classList.remove('hidden');
    document.getElementById('placar-container').classList.remove('hidden');
    desenharRoleta();
}

function abrirInstrucoes() {
    document.getElementById('menu-inicial').classList.remove('active');
    document.getElementById('tela-instrucoes').classList.add('active');
}

function voltarMenu() {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('menu-inicial').classList.add('active');
    document.getElementById('btn-voltar').classList.add('hidden');
    document.getElementById('placar-container').classList.add('hidden');
}

function finalizarJogo() {
    const somSucesso = document.getElementById('som-sucesso');
    somSucesso.play().catch(e => console.log("Áudio bloqueado"));
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('tela-vitoria').classList.add('active');
    document.getElementById('btn-voltar').classList.add('hidden');
}

function reiniciarJogo() {
    notasDisponiveis = [...notas];
    rodadaAtual = 1;
    estadoBotao = 'GIRAR';
    document.getElementById('pontos').innerText = rodadaAtual;
    document.getElementById('container-roleta').classList.remove('hidden');
    document.getElementById('escala-display').innerHTML = '';
    document.getElementById('escala-display').classList.add('hidden');
    document.getElementById('btn-acao').innerHTML = "GIRAR ROLETA";
    document.getElementById('btn-acao').classList.remove('acao-concluida');
    document.getElementById('feedback-txt').innerText = "Prepare o seu instrumento...";
    
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('area-jogo').classList.add('active');
}

desenharRoleta();