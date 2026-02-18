const acordesMaiores = [
    { cifra: "C", notas: ["DÓ", "MI", "SOL"] },
    { cifra: "D", notas: ["RÉ", "FÁ#", "LÁ"] },
    { cifra: "E", notas: ["MI", "SOL#", "SI"] },
    { cifra: "F", notas: ["FÁ", "LÁ", "DÓ"] },
    { cifra: "G", notas: ["SOL", "SI", "RÉ"] },
    { cifra: "A", notas: ["LÁ", "C#", "MI"] },
    { cifra: "B", notas: ["SI", "RÉ#", "FÁ#"] }
];

const acordesMenores = [
    { cifra: "Cm", notas: ["DÓ", "MI♭", "SOL"] },
    { cifra: "Dm", notas: ["RÉ", "FÁ", "LÁ"] },
    { cifra: "Em", notas: ["MI", "SOL", "SI"] },
    { cifra: "Fm", notas: ["FÁ", "LÁ♭", "DÓ"] },
    { cifra: "Gm", notas: ["SOL", "SI♭", "RÉ"] },
    { cifra: "Am", notas: ["LÁ", "DÓ", "MI"] },
    { cifra: "Bm", notas: ["SI", "RÉ", "FÁ#"] }
];

let pontos = 0;
let perguntaAtual = {};
let bancoAtual = [];
let audioIniciado = false;
let tocandoMusica = true;

const somClick = document.getElementById('som-click');
const somSucesso = document.getElementById('som-sucesso');
const musicaFundo = document.getElementById('musica-fundo');

function iniciarAudioAutomatico() {
    if (!audioIniciado) {
        musicaFundo.volume = 0.12;
        musicaFundo.play();
        audioIniciado = true;
    }
}

function iniciarJogo(modo) {
    if (modo === 'maior') bancoAtual = acordesMaiores;
    else if (modo === 'menor') bancoAtual = acordesMenores;
    else bancoAtual = [...acordesMaiores, ...acordesMenores];

    pontos = 0;
    document.getElementById('pontos').innerText = pontos;
    musicaFundo.volume = 0.02; 
    alternarTela('area-jogo');
    document.getElementById('placar-container').classList.remove('hidden');
    document.getElementById('btn-voltar').classList.remove('hidden');
    proximaPergunta();
}

function proximaPergunta() {
    perguntaAtual = bancoAtual[Math.floor(Math.random() * bancoAtual.length)];
    const container = document.getElementById('container-notas');
    container.innerHTML = '';
    perguntaAtual.notas.forEach(n => {
        const box = document.createElement('div');
        box.className = 'nota-box';
        box.innerText = n;
        container.appendChild(box);
    });

    const opcoesContainer = document.getElementById('opcoes-cifras');
    opcoesContainer.innerHTML = '';
    let opcoes = [perguntaAtual.cifra];
    while(opcoes.length < 6) {
        let r = bancoAtual[Math.floor(Math.random() * bancoAtual.length)].cifra;
        if(!opcoes.includes(r)) opcoes.push(r);
    }
    opcoes.sort(() => Math.random() - 0.5);

    opcoes.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'btn-cifra';
        btn.innerText = c;
        btn.onclick = () => verificar(c);
        opcoesContainer.appendChild(btn);
    });
}

function verificar(escolha) {
    if(escolha === perguntaAtual.cifra) {
        pontos++;
        document.getElementById('pontos').innerText = pontos;
        somClick.currentTime = 0;
        somClick.play();
        if(pontos >= 10) {
            musicaFundo.pause(); 
            somSucesso.play();
            alternarTela('tela-vitoria');
        } else {
            proximaPergunta();
        }
    } else {
        document.getElementById('container-notas').classList.add('erro-anim');
        setTimeout(() => document.getElementById('container-notas').classList.remove('erro-anim'), 300);
    }
}

function alternarTela(id) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function voltarMenu() {
    alternarTela('menu-inicial');
    document.getElementById('placar-container').classList.add('hidden');
    document.getElementById('btn-voltar').classList.add('hidden');
    if(tocandoMusica) {
        musicaFundo.volume = 0.12;
        musicaFundo.play();
    }
}

function abrirInstrucoes() { alternarTela('tela-instrucoes'); }

function toggleMusica() {
    if (tocandoMusica) {
        musicaFundo.pause();
        document.getElementById('audio-toggle').innerText = "🔇";
    } else {
        musicaFundo.play();
        document.getElementById('audio-toggle').innerText = "🔊";
    }
    tocandoMusica = !tocandoMusica;
}