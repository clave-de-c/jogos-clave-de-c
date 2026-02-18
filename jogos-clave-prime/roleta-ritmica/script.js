const clickSound = document.getElementById('som-click');
const boomSound = document.getElementById('som-explosao');
const roletaSound = document.getElementById('som-roleta'); // Referência ao novo áudio

// CONFIGURAÇÃO DAS FIGURAS
const todasFiguras = [
    // NÍVEL 1 (Básico) - Aparecem no 1, 2, 3
    { nome: 'Bomba', valor: 0, img: 'bomba.png', nivel: 1, tipo: 'bomba', padrao: [] },
    { nome: 'Semibreve', valor: 4, img: 'semibreve.png', nivel: 1, padrao: [4] },
    { nome: 'Mínima', valor: 2, img: 'minima.png', nivel: 1, padrao: [2] },
    { nome: 'Semínima', valor: 1, img: 'seminima.png', nivel: 1, padrao: [1] },

    // NÍVEL 2 (Intermediário) - Aparecem no 2, 3
    { nome: 'Mínima Pontuada', valor: 3, img: 'minima pontuada.png', nivel: 2, padrao: [3] },
    { nome: 'Colcheias', valor: 1, img: 'colcheias.png', nivel: 2, padrao: [0.5, 0.5] },
    { nome: 'Semínima Pontuada + Colcheia', valor: 2, img: 'seminima-pontuada-colcheia.png', nivel: 2, padrao: [1.5, 0.5] },

    // NÍVEL 3 (Avançado) - Aparecem apenas no 3
    { nome: 'Semicolcheias', valor: 1, img: 'semicolcheias.png', nivel: 3, padrao: [0.25, 0.25, 0.25, 0.25] },
    { nome: 'Tercina', valor: 1, img: 'tercina.png', nivel: 3, padrao: [0.333, 0.333, 0.333] },
    { nome: 'Colcheia + 2 Semis', valor: 1, img: 'colcheia-semis.png', nivel: 3, padrao: [0.5, 0.25, 0.25] },
    { nome: '2 Semis + Colcheia', valor: 1, img: 'semis-colcheia.png', nivel: 3, padrao: [0.25, 0.25, 0.5] },
    { nome: 'Pontuada Inversa 1', valor: 1, img: 'colheia-pontuada-semi.png', nivel: 3, padrao: [0.75, 0.25] },
    { nome: 'Pontuada Inversa 2', valor: 1, img: 'semi-colcheia -pontuada.png', nivel: 3, padrao: [0.25, 0.75] }
];

let compassoMaximo = 4;
let preenchido = 0;
let roletaGirando = false;
let anguloAtual = 0;
let nivelSelecionado = 1;
let sequenciaAtual = [];
let audioCtx = null;

function iniciarJogo(tamanho) {
    clickSound.play();
    compassoMaximo = tamanho;
    preenchido = 0;
    sequenciaAtual = [];
    
    nivelSelecionado = parseInt(document.getElementById('select-nivel').value);
    document.getElementById('btn-voltar').classList.remove('hidden');
    
    const divFormula = document.getElementById('formula-na-pauta');
    divFormula.innerHTML = `<span>${tamanho}</span><span>4</span>`;

    document.getElementById('img-resultado').src = 'claveprime-logo.png';

    // RESETAR ROLETA SEM ANIMAÇÃO REVERSA
    const roleta = document.getElementById('roleta-css');
    roleta.style.transition = 'none';
    anguloAtual = 0;
    roleta.style.transform = 'rotate(0deg)';
    void roleta.offsetWidth; // Força reflow
    roleta.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)';

    document.getElementById('linha-ritmica').innerHTML = '';
    document.getElementById('acoes-finais').classList.add('hidden');
    document.getElementById('btn-girar').style.display = 'block';

    trocarTela('area-jogo');
}

function girarRoleta() {
    if (roletaGirando) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    let espacoLivre = compassoMaximo - preenchido;
    // Filtro Cumulativo (<= nivel)
    let figurasDoNivel = todasFiguras.filter(f => f.nivel <= nivelSelecionado && f.tipo !== 'bomba');
    let opcoesValidas = figurasDoNivel.filter(f => f.valor <= espacoLivre);

    if (opcoesValidas.length === 0) {
        alert("Reiniciando...");
        iniciarJogo(compassoMaximo);
        return;
    }

    let sorteada;
    let chanceBomba = Math.random();
    
    // Bomba rara (4%) e somente se já tiver algo preenchido
    if (preenchido > 0 && chanceBomba < 0.04) {
        sorteada = todasFiguras.find(f => f.tipo === 'bomba');
    } else {
        sorteada = opcoesValidas[Math.floor(Math.random() * opcoesValidas.length)];
    }

    roletaGirando = true;
    
    // TOCA O SOM DA ROLETA (Loop)
    roletaSound.currentTime = 0;
    roletaSound.loop = true; 
    roletaSound.play().catch(e => console.log("Erro som:", e));

    let voltasExtras = 1800 + Math.floor(Math.random() * 1000); 
    anguloAtual += voltasExtras;
    document.getElementById('roleta-css').style.transform = `rotate(${anguloAtual}deg)`;
    document.getElementById('img-resultado').src = 'claveprime-logo.png';

    setTimeout(() => {
        pararRoleta(sorteada);
    }, 3000);
}

function pararRoleta(figuraSorteada) {
    // PARA O SOM DA ROLETA
    roletaSound.pause();
    roletaSound.currentTime = 0;

    const imgCentro = document.getElementById('img-resultado');
    imgCentro.src = figuraSorteada.img;
    imgCentro.style.transform = "scale(1.2)";
    setTimeout(() => imgCentro.style.transform = "scale(1)", 200);

    setTimeout(() => {
        if (figuraSorteada.tipo === 'bomba') explodirTudo();
        else adicionarNaPauta(figuraSorteada);
        roletaGirando = false;
    }, 800);
}

function explodirTudo() {
    boomSound.play();
    const card = document.getElementById('game-card');
    card.classList.add('kaboom');
    document.getElementById('linha-ritmica').innerHTML = '';
    preenchido = 0;
    sequenciaAtual = [];
    setTimeout(() => card.classList.remove('kaboom'), 1000);
}

function adicionarNaPauta(figura) {
    tocarBipDigital(800, 0.1); 
    
    const linha = document.getElementById('linha-ritmica');
    const img = document.createElement('img');
    img.src = figura.img;
    img.className = 'nota-na-pauta';
    img.id = `nota-${sequenciaAtual.length}`; 
    
    let larguraPorcentagem = (figura.valor / compassoMaximo) * 100;
    if (larguraPorcentagem < 10) larguraPorcentagem = 10;
    img.style.width = `${larguraPorcentagem}%`;

    linha.appendChild(img);
    sequenciaAtual.push(figura);
    preenchido += figura.valor;
    preenchido = Math.round(preenchido * 100) / 100;

    if (preenchido >= compassoMaximo) {
        finalizarCompasso();
    }
}

function finalizarCompasso() {
    document.getElementById('btn-girar').style.display = 'none';
    document.getElementById('acoes-finais').classList.remove('hidden');
}

function tocarBipDigital(frequencia, duracaoReal) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = frequencia;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duracaoReal * 0.8));
    osc.stop(audioCtx.currentTime + duracaoReal);
}

async function tocarRitmoDigital() {
    const btnOuvir = document.querySelector('.btn-main.blue');
    btnOuvir.disabled = true;
    btnOuvir.innerText = "Tocando...";

    const BPM = 80;
    const MS_POR_TEMPO = 60000 / BPM;

    for (let i = 0; i < sequenciaAtual.length; i++) {
        let figura = sequenciaAtual[i];
        let elementoVisual = document.getElementById(`nota-${i}`);

        if(elementoVisual) elementoVisual.classList.add('nota-tocando');

        for (let duracaoRelativa of figura.padrao) {
            let duracaoEmMs = duracaoRelativa * MS_POR_TEMPO;
            tocarBipDigital(1000, 0.1); 
            await new Promise(r => setTimeout(r, duracaoEmMs));
        }

        if(elementoVisual) elementoVisual.classList.remove('nota-tocando');
    }

    btnOuvir.disabled = false;
    btnOuvir.innerText = "🔊 Ouvir Ritmo";
}

function resetarCompasso() {
    clickSound.play();
    iniciarJogo(compassoMaximo);
}

function trocarTela(id) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function abrirInstrucoes() {
    clickSound.play();
    trocarTela('tela-instrucoes');
}

function abrirTabelaNiveis() {
    clickSound.play();
    trocarTela('tela-niveis');
}

function voltarMenu() {
    clickSound.play();
    document.getElementById('btn-voltar').classList.add('hidden');
    trocarTela('menu-selecao');
}