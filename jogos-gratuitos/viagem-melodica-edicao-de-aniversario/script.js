// BANCO DE DADOS: Troque os nomes pelos seus arquivos mp3 e imagens de partitura
const bancoDeMelodias = [
    { audio: 'audio-do-re-mi.mp3', imagem: 'pauta-do-re-mi.png' },
    { audio: 'audio-mi-fa-sol.mp3', imagem: 'pauta-mi-fa-sol.png' },
    { audio: 'audio-sol-fa-mi.mp3', imagem: 'pauta-sol-fa-mi.png' }
];

let pontos = 0;
let melodiaCertaAtual = null;
let audioAtual = null;

// Função para esconder todas as telas (evita o bug de telas sobrepostas)
function esconderTodasTelas() {
    document.querySelectorAll('.tela-jogo').forEach(tela => {
        tela.style.display = 'none';
    });
}

function iniciarJogo() {
    let musicaFundo = document.getElementById('musica-fundo');
    if(musicaFundo) musicaFundo.pause(); // Para a música do menu
    
    tocarClick();
    esconderTodasTelas();
    document.getElementById('area-jogo').style.display = 'flex';
    
    pontos = 0;
    document.getElementById('pontos').innerText = pontos;
    gerarRodada();
}

function gerarRodada() {
    const feedbackText = document.getElementById('feedback-txt');
    feedbackText.innerText = "Ouça a melodia e escolha o caminhão!";
    feedbackText.style.color = "var(--blue)";

    const container = document.getElementById('container-caminhoes');
    container.innerHTML = '';

    // Sorteia as melodias
    melodiaCertaAtual = bancoDeMelodias[Math.floor(Math.random() * bancoDeMelodias.length)];
    let melodiaErrada = bancoDeMelodias[Math.floor(Math.random() * bancoDeMelodias.length)];
    while(melodiaErrada === melodiaCertaAtual) {
        melodiaErrada = bancoDeMelodias[Math.floor(Math.random() * bancoDeMelodias.length)];
    }

    if (audioAtual) audioAtual.pause();
    audioAtual = new Audio(melodiaCertaAtual.audio);

    // Embaralha as opções
    let opcoes = [melodiaCertaAtual, melodiaErrada].sort(() => Math.random() - 0.5);

    // Cria os caminhões na tela
    opcoes.forEach(opcao => {
        let caminhao = document.createElement('div');
        caminhao.className = 'caminhao-container';
        caminhao.innerHTML = `
            <img src="caminhao-vazio.png" class="caminhao-img" alt="Caminhão">
            <div class="partitura-carga">
                <img src="${opcao.imagem}" alt="Partitura">
            </div>
        `;
        caminhao.onclick = () => verificarResposta(opcao === melodiaCertaAtual, caminhao);
        container.appendChild(caminhao);
    });
}

function tocarMelodiaAtual() {
    if (audioAtual) {
        audioAtual.currentTime = 0;
        audioAtual.play();
    }
}

function verificarResposta(acertou, elemento) {
    const feedbackText = document.getElementById('feedback-txt');
    if (acertou) {
        tocarSucesso();
        pontos++;
        document.getElementById('pontos').innerText = pontos;
        feedbackText.innerText = "Excelente! Entrega a caminho!";
        feedbackText.style.color = "var(--green)";
        elemento.classList.add('acerto-anim');
        
        // Espera a animação acabar para gerar nova rodada ou finalizar
        setTimeout(() => {
            if (pontos >= 10) {
                esconderTodasTelas();
                document.getElementById('tela-vitoria').style.display = 'flex';
            } else {
                gerarRodada();
            }
        }, 1200);
    } else {
        tocarClick();
        feedbackText.innerText = "Ops! Carga errada. Tente o outro.";
        feedbackText.style.color = "var(--red-error)";
        elemento.classList.add('erro-anim');
        setTimeout(() => elemento.classList.remove('erro-anim'), 400);
    }
}

// Funções de Navegação do Menu
function abrirInstrucoes() { 
    tocarClick(); 
    esconderTodasTelas(); 
    document.getElementById('tela-instrucoes').style.display = 'flex'; 
}

function abrirInfo() { 
    tocarClick(); 
    esconderTodasTelas(); 
    document.getElementById('tela-info').style.display = 'flex'; 
}

function voltarParaMenu() { 
    tocarClick(); 
    esconderTodasTelas(); 
    document.getElementById('menu-inicial').style.display = 'flex'; 
}

function voltarMenuTotal() { 
    location.reload(); // Atualiza a página inteira para zerar o jogo e voltar pro início
}

// Efeitos Sonoros
function tocarClick() { 
    let s = document.getElementById('som-click'); 
    if(s) { s.currentTime=0; s.play(); } 
}

function tocarSucesso() { 
    let s = document.getElementById('som-sucesso'); 
    if(s) { s.currentTime=0; s.play(); } 
}