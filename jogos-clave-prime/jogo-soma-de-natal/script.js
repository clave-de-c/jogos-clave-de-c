// --- BANCO DE DADOS DE FIGURAS (NOTAS E PAUSAS) ---
const notesData = [
    // NOTAS
    { type: 'nota', name: "Colcheia", value: 0.5, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150' fill='%23000'><path d='M60 115a15 12 0 1 1-30 0 15 12 0 0 1 30 0z'/><path d='M58 115V30h2v85z'/><path d='M60 30c0 0 20 5 20 25s-15 30-15 30'/></svg>` },
    { type: 'nota', name: "Semínima", value: 1, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150' fill='%23000'><path d='M60 120a15 12 0 1 1-30 0 15 12 0 0 1 30 0z'/><path d='M58 120V30h3v90z'/></svg>` },
    { type: 'nota', name: "Mínima", value: 2, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150' fill='none' stroke='%23000' stroke-width='4'><ellipse cx='45' cy='120' rx='15' ry='12' transform='rotate(-15 45 120)'/><line x1='58' y1='120' x2='58' y2='30' stroke-width='3'/></svg>` },
    { type: 'nota', name: "Semibreve", value: 4, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150' fill='none' stroke='%23000' stroke-width='5'><ellipse cx='50' cy='75' rx='20' ry='15' transform='rotate(-10 50 75)'/></svg>` },
    
    // PAUSAS
    {
        type: 'pausa', name: "Pausa de Colcheia", value: 0.5,
        // CORRIGIDO: Agora parece um "7" com a cabeça redonda
        svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'><circle cx='35' cy='50' r='8' fill='%23000'/><path d='M38 45 Q 65 35, 70 50 L 35 105' stroke='%23000' stroke-width='5' fill='none' stroke-linecap='round'/></svg>`
    },
    { type: 'pausa', name: "Pausa de Semínima", value: 1, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150' fill='none' stroke='%23000' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'><path d='M35 45 l25 20 l-25 15 l15 10 c0 0 12 8 2 18'/></svg>` },
    { type: 'pausa', name: "Pausa de Mínima", value: 2, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'><rect x='25' y='68' width='50' height='12' fill='%23000'/><line x1='15' y1='80' x2='85' y2='80' stroke='%23000' stroke-width='2'/></svg>` },
    { type: 'pausa', name: "Pausa de Semibreve", value: 4, svg: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 150'><rect x='25' y='80' width='50' height='12' fill='%23000'/><line x1='15' y1='80' x2='85' y2='80' stroke='%23000' stroke-width='2'/></svg>` }
];

// --- VARIÁVEIS ---
let score = 0;
let level = 1;
const maxScore = 30; 

// Referências de Áudio
const bgMusic = document.getElementById('bg-music');
const sfxCorrect = document.getElementById('sfx-correct');
const sfxWrong = document.getElementById('sfx-wrong');
const sfxWin = document.getElementById('sfx-win'); // Referência ao Ho Ho Ho
let isMuted = false;

// --- GERENCIAMENTO DE ÁUDIO ---
window.onload = function() {
    bgMusic.volume = 0.5;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay bloqueado. Aguardando interação...");
            document.body.addEventListener('click', startMusicOnFirstClick, { once: true });
        });
    }
};

function startMusicOnFirstClick() {
    if (!isMuted) {
        bgMusic.play();
        bgMusic.volume = 0.5;
    }
}

function setGameMusicVolume(low) {
    if (!isMuted) {
        bgMusic.volume = low ? 0.1 : 0.5;
    }
}

function toggleMusic() {
    const btn = document.getElementById('music-toggle');
    isMuted = !isMuted;
    if (isMuted) {
        bgMusic.pause();
        btn.innerText = "🔇";
    } else {
        bgMusic.play();
        btn.innerText = "🔊";
        const isGameRunning = !document.getElementById('game-screen').classList.contains('hidden');
        bgMusic.volume = isGameRunning ? 0.1 : 0.5;
    }
}

function playSFX(type) {
    if (type === 'correct') {
        sfxCorrect.currentTime = 0;
        sfxCorrect.play().catch(e => {}); 
    } else if (type === 'wrong') {
        sfxWrong.currentTime = 0;
        sfxWrong.play().catch(e => {});
    } else if (type === 'win') {
        sfxWin.currentTime = 0;
        sfxWin.play().catch(e => {});
    }
}

// --- EFEITOS VISUAIS (NEVE) ---
function createSnow() {
    const container = document.getElementById('snow-container');
    container.innerHTML = '';
    for(let i=0; i<30; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.width = flake.style.height = (Math.random() * 5 + 3) + 'px';
        flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        flake.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(flake);
    }
}
createSnow();

// --- TELAS ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).style.display = 'block';
    document.getElementById(screenId).classList.remove('hidden');
}

// --- LÓGICA DO JOGO ---

function startGame() {
    score = 0;
    level = 1;
    updateHUD();
    showScreen('game-screen');
    setGameMusicVolume(true);
    generateLevel();
}

function backToMenu() { 
    showScreen('menu-screen'); 
    setGameMusicVolume(false); 
}

function showInstructions() { 
    showScreen('instructions-screen'); 
    setGameMusicVolume(false); 
}

function updateHUD() {
    document.getElementById('score').innerText = score;
    const levelText = document.getElementById('level-indicator');
    
    if (score < 10) {
        level = 1;
        levelText.innerText = "Nível 1 (Figuras de Som)";
        levelText.style.color = "var(--natal-green)";
    } else if (score < 20) {
        level = 2;
        levelText.innerText = "Nível 2 (Figuras de Silêncio)";
        levelText.style.color = "var(--natal-gold)";
    } else {
        level = 3;
        levelText.innerText = "Nível 3 (Mestre)";
        levelText.style.color = "var(--natal-red)";
    }
}

function generateLevel() {
    document.getElementById('feedback-msg').innerText = "";
    updateHUD();

    let currentMode = 'nota';
    if (level === 2) {
        currentMode = 'pausa';
    } else if (level === 3) {
        currentMode = Math.random() > 0.5 ? 'nota' : 'pausa';
    }

    const availableIngredients = notesData.filter(n => n.type === currentMode);
    const possibleValues = [1, 2, 4];
    const targetValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
    const targetItem = availableIngredients.find(n => n.value === targetValue);

    let operands = findSumCombination(targetValue, availableIngredients);

    renderEquation(operands);
    renderOptions(targetItem, currentMode);
}

function findSumCombination(targetValue, ingredients) {
    let attempts = 0;
    let numItems = (level === 3 && Math.random() > 0.4) ? 3 : 2;

    while(attempts < 200) {
        let selection = [];
        let currentSum = 0;
        for(let i=0; i < numItems; i++) {
            let item = ingredients[Math.floor(Math.random() * ingredients.length)];
            selection.push(item);
            currentSum += item.value;
        }
        if(currentSum === targetValue) return selection;
        attempts++;
        if(attempts > 100) numItems = 2;
    }
    const half = ingredients.find(n => n.value === targetValue / 2);
    if(half) return [half, half];
    const colcheia = ingredients.find(n => n.value === 0.5);
    return [colcheia, colcheia]; 
}

function renderEquation(operands) {
    const container = document.getElementById('equation-container');
    container.innerHTML = ''; 
    operands.forEach((item, index) => {
        container.innerHTML += `<img src="${item.svg}" class="note-img" title="${item.name}">`;
        if (index < operands.length - 1) container.innerHTML += `<div class="math-symbol">+</div>`;
    });
    container.innerHTML += `<div class="math-symbol">=</div><div class="math-symbol">?</div>`;
}

function renderOptions(correctItem, mode) {
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    const sameTypeItems = notesData.filter(n => n.type === mode);
    let options = [correctItem];
    while(options.length < 3) {
        let randomOption = sameTypeItems[Math.floor(Math.random() * sameTypeItems.length)];
        if (!options.some(o => o.value === randomOption.value)) options.push(randomOption);
    }
    options.sort(() => Math.random() - 0.5);
    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'option-card';
        btn.innerHTML = `<img src="${opt.svg}" style="height:60px; display:block; margin:0 auto;">`;
        btn.onclick = () => checkAnswer(opt, correctItem, btn);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, correct, element) {
    const feedback = document.getElementById('feedback-msg');
    
    if (selected.value === correct.value) {
        playSFX('correct');
        score++;
        document.getElementById('score').innerText = score;
        element.classList.add('pulse');
        feedback.style.color = "var(--natal-green)";
        feedback.innerText = "Correto! " + correct.name;
        
        setTimeout(() => {
            if(score >= maxScore) {
                endGame();
            } else {
                generateLevel();
            }
        }, 1200);
    } else {
        playSFX('wrong');
        element.classList.add('shake');
        feedback.style.color = "var(--natal-red)";
        feedback.innerText = "Ops! A soma não dá essa duração.";
        setTimeout(() => element.classList.remove('shake'), 500);
    }
}

function endGame() {
    document.getElementById('final-score').innerText = score;
    showScreen('gameover-screen');
    
    // Pausa a música de fundo e toca a vitória
    bgMusic.pause(); 
    playSFX('win');
}

// Inicia
showScreen('menu-screen');