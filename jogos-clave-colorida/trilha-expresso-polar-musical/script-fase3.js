// --- CONFIGURAÇÃO ---
const notesData = [
    {id: 'Do', label: 'Dó'}, {id: 'Re', label: 'Ré'},
    {id: 'Mi', label: 'Mi'}, {id: 'Fa', label: 'Fá'},
    {id: 'Sol', label: 'Sol'}, {id: 'La', label: 'Lá'},
    {id: 'Si', label: 'Si'}
];

// Variáveis do Jogo
let currentScore = 0;
const targetScore = 100; // Meta de pontos
const pointsPerHit = 5;  // Pontos por acerto
let currentNote = null;
let timerInterval = null;
let timeLeft = 100; // Porcentagem da barra

// Elementos de Áudio
const bgMusic = document.getElementById('bg-music');
const sndClick = document.getElementById('snd-click');
const sndWin = document.getElementById('snd-win');
const sndErro = document.getElementById('snd-erro'); // Certifique-se de ter esse som ou remova a linha

// Elementos da Tela
const scoreEl = document.getElementById('score');
const targetEl = document.getElementById('target-note');
const timeBar = document.getElementById('time-fill');
const gameUi = document.getElementById('game-ui');
const controlsContainer = document.getElementById('controls');

// --- INICIALIZAÇÃO ---
window.onload = () => {
    createSnow();
};

function startGame() {
    // Esconder Overlay de Início
    document.getElementById('start-overlay').classList.add('hidden');
    
    // Iniciar Música
    if(bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.play().catch(e => console.log("Audio play blocked"));
    }

    // Resetar Variáveis
    currentScore = 0;
    scoreEl.innerText = "0";
    timeLeft = 100;
    
    // Começar o Jogo
    nextRound();
    startTimer();
}

// --- LÓGICA DO JOGO ---
function nextRound() {
    // 1. Escolhe uma nota aleatória
    const randomIndex = Math.floor(Math.random() * notesData.length);
    currentNote = notesData[randomIndex];
    
    // 2. Atualiza Texto na Tela (com efeito suave)
    targetEl.style.opacity = 0; 
    setTimeout(() => {
        targetEl.innerText = currentNote.label;
        targetEl.style.opacity = 1;
        targetEl.style.color = "#01579b"; // Reseta cor para azul
    }, 100);

    // 3. NOVO: Embaralha os botões para não viciar a posição
    shuffleButtons();
}

function shuffleButtons() {
    // Pega todos os botões atuais
    const buttons = Array.from(controlsContainer.children);
    
    // Mistura a array de botões
    buttons.sort(() => Math.random() - 0.5);
    
    // Coloca eles de volta no container na nova ordem
    buttons.forEach(btn => controlsContainer.appendChild(btn));
}

function checkAnswer(chosenId) {
    if (chosenId === currentNote.id) {
        // ACERTOU
        currentScore += pointsPerHit;
        scoreEl.innerText = currentScore;
        playSound(sndClick);
        
        // Feedback Visual (Texto fica verde)
        targetEl.style.color = "#00c853"; 
        
        // Verifica Vitória
        if (currentScore >= targetScore) {
            winGame();
        } else {
            // Próxima rodada
            nextRound();
            // Recupera um pouco de tempo (bônus por rapidez)
            timeLeft = Math.min(timeLeft + 5, 100); 
            updateTimeBar();
        }
    } else {
        // ERROU
        playSound(sndErro);
        // Efeito de tremer a tela
        gameUi.classList.add('shake');
        setTimeout(() => gameUi.classList.remove('shake'), 400);
        
        timeLeft -= 10; // Penalidade de tempo
        updateTimeBar();
    }
}

// Para funcionar o onclick no HTML que chama checkAnswer('Do'), etc.
// precisamos garantir que as strings batam com os IDs.
// Uma forma melhor é adicionar os eventos via JS para não depender do HTML inline,
// mas mantive sua estrutura atual. Apenas certifique-se que o HTML está assim:
// <button class="ticket-btn btn-do" onclick="checkAnswer('Do')"></button>

// --- TEMPORIZADOR ---
function startTimer() {
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft -= 0.5; // Velocidade da barra
        updateTimeBar();

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 100);
}

function updateTimeBar() {
    timeBar.style.width = timeLeft + '%';
    // Muda de cor se estiver acabando
    if(timeLeft < 30) timeBar.style.background = '#d41e1e'; // Vermelho alerta
    else timeBar.style.background = '#29b6f6'; // Azul normal
}

// --- FIM DE JOGO ---
function winGame() {
    clearInterval(timerInterval);
    if(bgMusic) bgMusic.pause();
    playSound(sndWin);
    
    // Salvar Progresso
    localStorage.setItem('fase3_concluida', 'true');
    
    setTimeout(() => {
        document.getElementById('win-screen').classList.remove('hidden');
        document.getElementById('win-screen').style.display = 'flex';
    }, 500);
}

function gameOver() {
    clearInterval(timerInterval);
    alert("O tempo acabou! A nevasca cobriu os bilhetes. Tente novamente!");
    startGame(); // Reinicia
}

// --- UTILITÁRIOS ---
function playSound(audio) {
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e=>{});
    }
}

function createSnow() {
    const container = document.getElementById('snow-container');
    if(!container) return;
    
    for(let i=0; i<50; i++) { 
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.width = flake.style.height = (Math.random() * 4 + 2) + 'px';
        flake.style.animationDuration = (Math.random() * 2 + 1) + 's';
        flake.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(flake);
    }
}