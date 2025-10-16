document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DOS ELEMENTOS ---
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const playBtn = document.getElementById('play-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const finalScoreEl = document.getElementById('final-score');
    const notaImagem = document.getElementById('nota-imagem');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    const questionCounter = document.getElementById('question-counter');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const streakCounterEl = document.getElementById('streak-counter');
    const endBackToMenuBtn = document.getElementById('end-back-to-menu-btn');

    // --- ÁUDIO ---
    const correctSound = new Howl({ src: ['audio/correct.mp3'] });
    const incorrectSound = new Howl({ src: ['audio/incorrect.mp3'] });
    const successSound = new Howl({ src: ['audio/fim-jogo-sucesso.mp3'], volume: 0.5 });

    // --- DADOS DAS NOTAS PARA A CLAVE DE FÁ ---
    const notas = [
        { nome: 'Fá 2',  imagem: 'imagens/f2-bass.png',  rotulo: 'Fá' },
        { nome: 'Sol 2', imagem: 'imagens/g2-bass.png',  rotulo: 'Sol' },
        { nome: 'Lá 2',  imagem: 'imagens/a2-bass.png',  rotulo: 'Lá' },
        { nome: 'Si 2',  imagem: 'imagens/b2-bass.png',  rotulo: 'Si' },
        { nome: 'Dó 3',  imagem: 'imagens/c3-bass.png',  rotulo: 'Dó' },
        { nome: 'Ré 3',  imagem: 'imagens/d3-bass.png',  rotulo: 'Ré' },
        { nome: 'Mi 3',  imagem: 'imagens/e3-bass.png',  rotulo: 'Mi' },
        { nome: 'Fá 3',  imagem: 'imagens/f3-bass.png',  rotulo: 'Fá' },
        { nome: 'Sol 3', imagem: 'imagens/g3-bass.png',  rotulo: 'Sol' },
        { nome: 'Lá 3',  imagem: 'imagens/a3-bass.png',  rotulo: 'Lá' },
        { nome: 'Si 3',  imagem: 'imagens/b3-bass.png',  rotulo: 'Si' },
        { nome: 'Dó 4',  imagem: 'imagens/c4-bass.png',  rotulo: 'Dó' }
    ];
    
    let score = 0;
    let currentQuestionIndex = 0;
    let shuffledNotas = [];
    let currentStreak = 0;

    function setActiveScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if(screenElement) screenElement.classList.add('active');
    }

    function startGame() {
        score = 0;
        currentQuestionIndex = 0;
        currentStreak = 0;
        updateStreakCounter();
        shuffledNotas = [...notas].sort(() => Math.random() - 0.5);
        setActiveScreen(gameScreen);
        showNextQuestion();
    }

    function showMenu() {
        successSound.stop();
        setActiveScreen(menuScreen);
    }
    
    function showNextQuestion() {
        if (currentQuestionIndex >= shuffledNotas.length) { endGame(); return; }
        const progressPercentage = ((currentQuestionIndex) / shuffledNotas.length) * 100;
        progressBarFill.style.width = `${progressPercentage}%`;
        questionCounter.textContent = `${currentQuestionIndex + 1} / ${shuffledNotas.length}`;
        const notaCorreta = shuffledNotas[currentQuestionIndex];
        notaImagem.src = notaCorreta.imagem;
        createAnswerOptions(notaCorreta);
    }
    
    function createAnswerOptions(notaCorreta) {
        answerButtonsContainer.innerHTML = '';
        let options = [notaCorreta], rotulosNaTela = new Set([notaCorreta.rotulo]);
        while (options.length < 4) {
            const randomNota = notas[Math.floor(Math.random() * notas.length)];
            // --- CORREÇÃO APLICADA AQUI ---
            if (!options.some(opt => opt.nome === randomNota.nome) && !rotulosNaTela.has(randomNota.rotulo)) {
                options.push(randomNota); rotulosNaTela.add(randomNota.rotulo);
            }
        }
        options.sort(() => Math.random() - 0.5);
        options.forEach(optionNota => {
            const button = document.createElement('button');
            button.textContent = optionNota.rotulo;
            button.classList.add('answer-btn');
            button.dataset.nome = optionNota.nome;
            button.addEventListener('click', (e) => checkAnswer(e.target, notaCorreta.nome));
            answerButtonsContainer.appendChild(button);
        });
    }

    function updateStreakCounter() {
        streakCounterEl.innerHTML = `🔥 ${currentStreak}`;
        if (currentStreak > 1) {
            streakCounterEl.classList.add('visible');
        } else {
            streakCounterEl.classList.remove('visible');
        }
    }

    function checkAnswer(clickedButton, correctAnswerName) {
        answerButtonsContainer.style.pointerEvents = 'none';
        const selectedAnswerName = clickedButton.dataset.nome;
        if (selectedAnswerName === correctAnswerName) {
            score++; currentStreak++;
            correctSound.play(); clickedButton.classList.add('correct');
        } else {
            currentStreak = 0;
            incorrectSound.play(); clickedButton.classList.add('incorrect');
            const correctButton = answerButtonsContainer.querySelector(`[data-nome="${correctAnswerName}"]`);
            if(correctButton) correctButton.classList.add('correct');
        }
        updateStreakCounter();
        currentQuestionIndex++;
        setTimeout(() => { showNextQuestion(); answerButtonsContainer.style.pointerEvents = 'auto'; }, 1500);
    }

    function endGame() {
        progressBarFill.style.width = `100%`;
        questionCounter.textContent = `${shuffledNotas.length} / ${shuffledNotas.length}`;
        setTimeout(() => {
            setActiveScreen(endScreen);
            finalScoreEl.textContent = `${score} de ${shuffledNotas.length}`;
            successSound.play();
        }, 500);
    }

    function openModal() { instructionsModal.classList.add('active'); }
    function closeModal() { instructionsModal.classList.remove('active'); }

    instructionsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalOkBtn.addEventListener('click', closeModal);

    playBtn.addEventListener('click', startGame);
    backToMenuBtn.addEventListener('click', showMenu);
    playAgainBtn.addEventListener('click', startGame);
    endBackToMenuBtn.addEventListener('click', showMenu);
});