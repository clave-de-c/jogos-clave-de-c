// --- ÁUDIOS DO JOGO ---
const musicaFundo = document.getElementById('musica-fundo');
const somSucesso = document.getElementById('som-sucesso');
musicaFundo.volume = 0.05; 
let usuarioMutou = false;
let plataformaAtivada = false;

// Banco de Dados Musical: Mapeando os nomes dos arquivos reais da sua pasta
const notasData = [
    { nome: 'Dó', cor: 'var(--do)', arquivo: 'do.mp3' },
    { nome: 'Ré', cor: 'var(--re)', arquivo: 're.mp3' },
    { nome: 'Mi', cor: 'var(--mi)', arquivo: 'mi.mp3' },
    { nome: 'Fá', cor: 'var(--fa)', arquivo: 'fa.mp3' },
    { nome: 'Sol', cor: 'var(--sol)', arquivo: 'sol.mp3' },
    { nome: 'Lá', cor: 'var(--la)', arquivo: 'la.mp3' },
    { nome: 'Si', cor: 'var(--si)', arquivo: 'si.mp3' }
];

// Pré-carregamento de áudios (evita lag na hora que o aluno clica)
const audiosNotas = {};
notasData.forEach(nota => {
    audiosNotas[nota.nome] = new Audio(nota.arquivo);
});

// --- VARIÁVEIS DE CONTROLE DO JOGO ---
let pontuacao = 0;
let vidas = 3;
let notaAtual = null;
let animacaoFrame;
let posicionamentoNota = 0;
let velocidadeNota = 2;
let jogoRodando = false;

const notaElement = document.getElementById('nota-em-movimento');
const pista = document.getElementById('pista');
const containerBotoes = document.getElementById('container-botoes');

// Função para tocar o arquivo mp3 correspondente
function playNotaAudio(nomeNota) {
    const som = audiosNotas[nomeNota];
    if (som) {
        som.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
        som.play().catch(e => console.log("Erro ao tocar nota:", e));
    }
}

// Ativação obrigatória por interação do usuário (Resolve bloqueio de Autoplay)
function ativarPlataforma() {
    plataformaAtivada = true;
    mudarTela('menu-inicial');
    
    if (!usuarioMutou) {
        musicaFundo.play().catch(e => console.log("Áudio aguardando interação completa:", e));
    }
}

// Criação do teclado de botões sem cor de fundo
function criarBotoesNeutros() {
    containerBotoes.innerHTML = '';
    notasData.forEach(nota => {
        const btn = document.createElement('button');
        btn.className = 'btn-nota';
        btn.innerText = nota.nome;
        btn.onclick = () => checarEscolha(nota.nome);
        containerBotoes.appendChild(btn);
    });
}

// Lança a nota na pista
function spawnNovaNota() {
    if (!jogoRodando) return;
    
    const sorteio = Math.floor(Math.random() * notasData.length);
    notaAtual = notasData[sorteio];
    
    notaElement.style.backgroundColor = notaAtual.cor;
    notaElement.style.display = 'flex'; // Previne bug do display fantasma
    notaElement.classList.remove('hidden');
    
    posicionamentoNota = -60; 
    
    const selecaoVelocidade = document.getElementById('select-velocidade').value;
    let velocidadeBase = 2.5;
    let aceleracaoPorPonto = 0.25;
    
    if (selecaoVelocidade === 'lento') {
        velocidadeBase = 1.2;
        aceleracaoPorPonto = 0.12; 
    } else if (selecaoVelocidade === 'rapido') {
        velocidadeBase = 5.5;      
        aceleracaoPorPonto = 0.45; 
    }
    
    velocidadeNota = velocidadeBase + (pontuacao * aceleracaoPorPonto); 
    
    moverNotaNaPista();
}

// Motor de animação da pista
function moverNotaNaPista() {
    if (!jogoRodando) return;
    
    posicionamentoNota += velocidadeNota;
    notaElement.style.left = posicionamentoNota + 'px';
    
    if (posicionamentoNota > pista.offsetWidth) {
        perderVida();
        return;
    }
    
    animacaoFrame = requestAnimationFrame(moverNotaNaPista);
}

// Validação da resposta
function checarEscolha(nomeClicado) {
    if (!jogoRodando || !notaAtual) return;
    
    if (nomeClicado === notaAtual.nome) {
        cancelAnimationFrame(animacaoFrame);
        
        // Agora toca o MP3 exato da nota!
        playNotaAudio(notaAtual.nome); 
        
        pontuacao++;
        document.getElementById('pontos').innerText = pontuacao;
        
        notaElement.classList.add('hidden');
        notaElement.style.display = 'none';
        document.getElementById('feedback-txt').innerText = "Correto! ✨";
        
        // CONDIÇÃO DE VITÓRIA: 20 ACERTOS
        if (pontuacao >= 20) {
            vencerJogo();
        } else {
            setTimeout(spawnNovaNota, 500);
        }
    } else {
        perderVida(); 
    }
}

function perderVida() {
    cancelAnimationFrame(animacaoFrame);
    vidas--;
    notaElement.classList.add('hidden');
    notaElement.style.display = 'none';
    
    document.getElementById('vidas').innerText = "Vidas: " + "❤️".repeat(vidas);
    document.getElementById('feedback-txt').innerText = "Ops! ❌";
    
    if (vidas <= 0) {
        gameOver();
    } else {
        setTimeout(spawnNovaNota, 800);
    }
}

// --- CONTROLE DE TELAS E INTERFACE ---
function toggleMusica() {
    if (musicaFundo.paused) { 
        musicaFundo.play(); document.getElementById('audio-toggle').innerText = "🔊"; usuarioMutou = false; 
    } else { 
        musicaFundo.pause(); document.getElementById('audio-toggle').innerText = "🔇"; usuarioMutou = true; 
    }
}

function iniciarJogo() {
    musicaFundo.pause(); // Silencia música de fundo no gameplay ativo
    
    mudarTela('area-jogo');
    document.getElementById('btn-voltar').style.display = 'block';
    document.getElementById('btn-voltar').classList.remove('hidden');
    document.getElementById('placar-container').style.display = 'block';
    document.getElementById('placar-container').classList.remove('hidden');
    
    criarBotoesNeutros();
    pontuacao = 0;
    vidas = 3;
    jogoRodando = true;
    
    document.getElementById('pontos').innerText = pontuacao;
    document.getElementById('vidas').innerText = "Vidas: ❤️❤️❤️";
    document.getElementById('feedback-txt').innerText = "Prepare-se...";
    
    setTimeout(spawnNovaNota, 1000);
}

function abrirInstrucoes() {
    mudarTela('tela-instrucoes');
}

function voltarMenu() {
    jogoRodando = false;
    cancelAnimationFrame(animacaoFrame);
    notaElement.classList.add('hidden');
    notaElement.style.display = 'none';
    
    if (!usuarioMutou && plataformaAtivada) {
        musicaFundo.play().catch(() => console.log("Áudio aguardando interação completa."));
        document.getElementById('audio-toggle').innerText = "🔊";
    }
    
    mudarTela('menu-inicial');
    esconderControlesTopo();
}

function vencerJogo() {
    jogoRodando = false;
    
    // Toca o áudio de sucesso!
    somSucesso.currentTime = 0;
    somSucesso.play().catch(e => console.log("Erro ao tocar sucesso:", e));
    
    mudarTela('tela-vitoria');
    esconderControlesTopo();
}

function gameOver() {
    jogoRodando = false;
    mudarTela('tela-gameover');
    esconderControlesTopo();
}

function mudarTela(idTelaAlvo) {
    document.querySelectorAll('.game-screen').forEach(tela => {
        tela.classList.remove('active');
        tela.style.display = 'none';
    });
    const alvo = document.getElementById(idTelaAlvo);
    alvo.classList.add('active');
    alvo.style.display = 'flex';
}

function esconderControlesTopo() {
    document.getElementById('btn-voltar').classList.add('hidden');
    document.getElementById('btn-voltar').style.display = 'none';
    document.getElementById('placar-container').classList.add('hidden');
    document.getElementById('placar-container').style.display = 'none';
}