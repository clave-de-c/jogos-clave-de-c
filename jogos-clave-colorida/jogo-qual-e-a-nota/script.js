const bgMusic = document.getElementById('musica-fundo');
const clickSound = document.getElementById('som-click');
const somSucesso = document.getElementById('som-sucesso');
const btnAudio = document.getElementById('audio-toggle');
const placar = document.getElementById('placar-container');
const btnVoltar = document.getElementById('btn-voltar');
const feedbackTxt = document.getElementById('feedback-txt');

// SUAS 5 NOTAS (Se adicionar mais, a lógica se adapta automaticamente)
const notas = [
    { id: 'do', som: 'do-sino.mp3', img: 'do-vermelho.png' },
    { id: 're', som: 're-sino.mp3', img: 're-laranja.png' },
    { id: 'mi', som: 'mi-sino.mp3', img: 'mi-amarelo.png' },
    { id: 'fa', som: 'fa-sino.mp3', img: 'fa-verde.png' },
    { id: 'sol', som: 'sol-sino.mp3', img: 'sol-azul.png' }
];

let notaAlvo;
let pontos = 0;
let somAtivado = true;
let bloqueioClique = false;
let playlistJogo = []; // Aqui ficará nossa sequência equilibrada

// --- ÁUDIO (Mantendo o que já funcionou) ---
window.onload = function() {
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Autoplay bloqueado. Aguardando clique."));
};

document.body.addEventListener('click', function() {
    if(somAtivado && bgMusic.paused) {
        bgMusic.play();
        btnAudio.innerText = "🔊";
    }
}, { once: true });

function toggleMusica() {
    clickSound.play();
    if (bgMusic.paused) {
        bgMusic.play();
        somAtivado = true;
        btnAudio.innerText = "🔊";
    } else {
        bgMusic.pause();
        somAtivado = false;
        btnAudio.innerText = "🔈";
    }
}

// --- TELAS ---
function mudarTela(id) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if(id === 'area-jogo') {
        placar.classList.remove('hidden');
        btnVoltar.classList.remove('hidden');
    } else {
        placar.classList.add('hidden');
        btnVoltar.classList.add('hidden');
    }
}

// --- NOVO SISTEMA DE SORTEIO EQUILIBRADO ---
function gerarSequenciaEquilibrada() {
    playlistJogo = [];
    
    // Cria cópias das notas para preencher as 10 rodadas
    // Com 5 notas, isso garante exatamente 2 aparições de cada uma
    let pool = [...notas, ...notas]; 
    
    // Embaralha o "baralho" (Algoritmo Fisher-Yates simplificado)
    playlistJogo = pool.sort(() => Math.random() - 0.5);
    
    console.log("Sequência gerada:", playlistJogo.map(n => n.id)); // Para você conferir no F12 se quiser
}

function iniciarJogo() {
    clickSound.play();
    if(somAtivado && bgMusic.paused) bgMusic.play();
    bgMusic.pause(); 
    
    pontos = 0;
    document.getElementById('pontos').innerText = 0;
    
    // GERA O BARALHO NOVO ANTES DE COMEÇAR
    gerarSequenciaEquilibrada();
    
    mudarTela('area-jogo');
    novaRodada();
}

function novaRodada() {
    bloqueioClique = false;
    
    // PEGA A PRÓXIMA CARTA DO BARALHO
    // Se por acaso o baralho acabar (erro de segurança), pega aleatório
    if (playlistJogo.length > 0) {
        notaAlvo = playlistJogo.pop();
    } else {
        notaAlvo = notas[Math.floor(Math.random() * notas.length)];
    }

    const grid = document.querySelector('.bell-grid');
    grid.innerHTML = '';
    
    feedbackTxt.innerText = "Qual é o som?";
    feedbackTxt.className = "msg-neutra";

    // Cria os botões (sempre na ordem original DO, RE, MI... visualmente fica organizado)
    notas.forEach(n => {
        grid.innerHTML += `<button class="sino-btn" onclick="validar('${n.id}', this)"><img src="${n.img}"></button>`;
    });
    
    setTimeout(() => new Audio(notaAlvo.som).play(), 500);
}

function repetirSom() { 
    new Audio(notaAlvo.som).play(); 
}

function validar(escolha, btnElemento) {
    if(bloqueioClique) return;

    if(escolha === notaAlvo.id) {
        // ACERTOU
        clickSound.play();
        bloqueioClique = true;
        
        btnElemento.classList.add('acerto-anim');
        feedbackTxt.innerText = "Muito bem! 🌟";
        feedbackTxt.className = "msg-sucesso";

        pontos++;
        document.getElementById('pontos').innerText = pontos;
        
        if(pontos >= 10) {
            setTimeout(() => {
                mudarTela('tela-vitoria');
                somSucesso.currentTime = 0;
                somSucesso.play();
            }, 1500); 
        } else { 
            setTimeout(novaRodada, 1500); 
        }

    } else {
        // ERROU
        clickSound.play();
        btnElemento.classList.add('erro-anim');
        feedbackTxt.innerText = "Ops! Tente outra cor.";
        feedbackTxt.className = "msg-erro";
        
        setTimeout(() => {
            btnElemento.classList.remove('erro-anim');
        }, 500);
    }
}

function abrirInstrucoes() { clickSound.play(); mudarTela('tela-instrucoes'); }
function voltarMenu() { 
    clickSound.play(); 
    if(somAtivado) bgMusic.play(); 
    mudarTela('menu-inicial'); 
}