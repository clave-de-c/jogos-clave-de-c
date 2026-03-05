const notasConfig = [
    { nome: 'Dó', cor: '#d41e1e', audio: 'c3.mp3', tipo: 'nota' },
    { nome: 'Ré', cor: '#f18c4d', audio: 'd3.mp3', tipo: 'nota' },
    { nome: 'Mi', cor: '#ffda43', audio: 'e3.mp3', tipo: 'nota' },
    { nome: 'Fá', cor: '#10ad54', audio: 'f3.mp3', tipo: 'nota' },
    { nome: 'Sol', cor: '#38b6ff', audio: 'g3.mp3', tipo: 'nota' },
    { nome: 'Lá', cor: '#004aad', audio: 'a3.mp3', tipo: 'nota' },
    { nome: 'Si', cor: '#7c45e8', audio: 'b3.mp3', tipo: 'nota' }
];

const pegadinhas = [
    { tipo: 'pegadinha', img: 'flor.png', nome: 'Flor' },
    { tipo: 'pegadinha', img: 'formiga.png', nome: 'Formiga' },
    { tipo: 'pegadinha', img: 'minhoca.png', nome: 'Minhoca' }
];

const TOTAL_RODADAS = 10;
let notaAlvo = null;
let acertos = 0;
let bloqueioClique = false;
let musicaLigada = false;

// Configura o volume inicial da música (0.1 = 10% do volume original)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('musica-fundo').volume = 0.1; 
});

// Liga/Desliga a música de fundo
function toggleMusica() {
    const bgAudio = document.getElementById('musica-fundo');
    const btn = document.getElementById('btn-audio');
    
    if (musicaLigada) {
        bgAudio.pause();
        btn.innerText = '🔈'; // Ícone mudo
        musicaLigada = false;
    } else {
        bgAudio.play();
        btn.innerText = '🔊'; // Ícone som
        musicaLigada = true;
    }
}

function trocarTela(idAlvo) {
    const telas = ['menu-inicial', 'tela-instrucoes', 'area-jogo', 'tela-vitoria'];
    telas.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = (id === idAlvo) ? 'flex' : 'none';
        }
    });
}

function iniciarJogo() {
    acertos = 0;
    document.getElementById('pontos').innerText = acertos;
    document.getElementById('placar-container').style.display = 'block';
    document.getElementById('btn-voltar').style.display = 'block';
    
    // Inicia a música de fundo automaticamente se estiver desligada
    if(!musicaLigada) toggleMusica();
    
    trocarTela('area-jogo');
    novaRodada();
}

function abrirInstrucoes() { trocarTela('tela-instrucoes'); }

function voltarMenu() { 
    document.getElementById('placar-container').style.display = 'none';
    document.getElementById('btn-voltar').style.display = 'none';
    trocarTela('menu-inicial'); 
}

// Ouve a nota alvo novamente quando clica na palavra pulsante
function ouvirNotaAlvo() {
    if (notaAlvo) {
        new Audio(notaAlvo.audio).play();
    }
}

function novaRodada() {
    bloqueioClique = false;
    const container = document.getElementById('jardim-container');
    const feedback = document.getElementById('feedback-txt');

    if (!container || !feedback) return; 

    container.innerHTML = '';
    notaAlvo = notasConfig[Math.floor(Math.random() * notasConfig.length)];
    
    // Frase com a classe "pulsar" e onclick para tocar de novo
    feedback.className = "msg-neutra";
    feedback.innerHTML = `Onde está a nota <span id="nota-alvo-nome" class="pulsar" title="Clique para ouvir!" onclick="ouvirNotaAlvo()" style="color:${notaAlvo.cor}">${notaAlvo.nome}</span>?`;

    // Toca o som alvo no início da rodada (com pequeno delay para carregar a tela)
    setTimeout(() => { ouvirNotaAlvo(); }, 500);

    const itensMisturados = [...notasConfig, ...pegadinhas].sort(() => Math.random() - 0.5);

    itensMisturados.forEach(item => {
        const moita = document.createElement('div');
        moita.className = 'esconderijo';
        moita.innerHTML = '<img src="moita.png" class="img-moita">';
        moita.onclick = () => clicarMoita(item, moita);
        container.appendChild(moita);
    });
}

function clicarMoita(itemClicado, elemento) {
    if (bloqueioClique) return;

    if (itemClicado.tipo === 'pegadinha') {
        bloqueioClique = true;
        elemento.innerHTML = `<img src="${itemClicado.img}" class="img-decoy">`;
        elemento.classList.add('erro-anim');
        
        document.getElementById('feedback-txt').innerHTML = "Ops! Isso não é um ovo! 🐛";
        document.getElementById('feedback-txt').className = "msg-neutra";
        
        setTimeout(() => {
            elemento.classList.remove('erro-anim');
            elemento.innerHTML = '<img src="moita.png" class="img-moita">';
            document.getElementById('feedback-txt').innerHTML = `Onde está a nota <span id="nota-alvo-nome" class="pulsar" onclick="ouvirNotaAlvo()" style="color:${notaAlvo.cor}">${notaAlvo.nome}</span>?`;
            bloqueioClique = false;
        }, 1200);
        return; 
    }

    const som = new Audio(itemClicado.audio);
    som.play();
    
    elemento.innerHTML = `<div class="ovo" style="background:${itemClicado.cor}"></div>`;
    
    if (itemClicado.nome === notaAlvo.nome) {
        bloqueioClique = true; 
        acertos++;
        document.getElementById('pontos').innerText = acertos;
        document.getElementById('feedback-txt').innerHTML = "Achou! 🥚✨";
        document.getElementById('feedback-txt').className = "msg-sucesso";
        
        setTimeout(() => {
            if (acertos >= TOTAL_RODADAS) {
                document.getElementById('som-vitoria').play(); // Toca o parabens.mp3
                trocarTela('tela-vitoria');
            } else {
                novaRodada();
            }
        }, 1500);
        
    } else {
        bloqueioClique = true;
        elemento.classList.add('erro-anim');
        document.getElementById('feedback-txt').innerHTML = "Ops, essa é outra nota! 🎵";
        document.getElementById('feedback-txt').className = "msg-neutra";
        
        setTimeout(() => {
            elemento.classList.remove('erro-anim');
            elemento.innerHTML = '<img src="moita.png" class="img-moita">';
            document.getElementById('feedback-txt').innerHTML = `Onde está a nota <span id="nota-alvo-nome" class="pulsar" onclick="ouvirNotaAlvo()" style="color:${notaAlvo.cor}">${notaAlvo.nome}</span>?`;
            bloqueioClique = false;
        }, 1200);
    }
}