document.addEventListener('DOMContentLoaded', () => {
    let audioCtx;
    function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    document.body.addEventListener('click', initAudio, { once: true });
    
    // --- ELEMENTOS DO DOM ---
    const allScreens = document.querySelectorAll('.screen');
    const menuScreen = document.getElementById('menu-screen');
    const levelSelectScreen = document.getElementById('level-select-screen');
    const instructionsScreen = document.getElementById('instructions-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const gameContent = document.querySelector('.game-content');
    const playBtn = document.getElementById('play-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const backToMenuFromLevelsBtn = document.getElementById('back-to-menu-from-levels-btn');
    const backToMenuFromInstructionsBtn = document.getElementById('back-to-menu-from-instructions-btn');
    const backToMenuFromGameBtn = document.getElementById('back-to-menu-from-game-btn');
    const backToMenuFromEndBtn = document.getElementById('back-to-menu-from-end-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const levelButtons = document.querySelectorAll('.level-btn');
    const chordNameEl = document.getElementById('chord-name');
    const staffEl = document.getElementById('staff');
    const notesPoolEl = document.getElementById('notes-pool');
    const feedbackMessageEl = document.getElementById('feedback-message');
    const backgroundMusic = document.getElementById('background-music');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const endTitle = document.getElementById('end-title');
    const endMessage = document.getElementById('end-message');
    const finalScoreValue = document.getElementById('final-score-value');

    // --- VARIÁVEIS DE JOGO ---
    let score = 0, timeLeft = 0, gameTimer, currentChords = [], currentChordIndex = 0, draggedNote = null;
    const TIME_PER_LEVEL = 90, POINTS_PER_CHORD = 10;
    
    // --- DADOS DE NOTAS E ACORDES ---
    const notesData = { 'C': { color: '#d41e1e', freq: 261.63 },'C#': { color: 'linear-gradient(to bottom right, #d41e1e 50%, #f18c4d 50%)', freq: 277.18 },'Db': { color: 'linear-gradient(to bottom right, #d41e1e 50%, #f18c4d 50%)', freq: 277.18 },'D': { color: '#f18c4d', freq: 293.66 },'D#': { color: 'linear-gradient(to bottom right, #f18c4d 50%, #ffda43 50%)', freq: 311.13 },'Eb': { color: 'linear-gradient(to bottom right, #f18c4d 50%, #ffda43 50%)', freq: 311.13 },'E': { color: '#ffda43', freq: 329.63 },'F': { color: '#10ad54', freq: 349.23 },'F#': { color: 'linear-gradient(to bottom right, #10ad54 50%, #38b6ff 50%)', freq: 369.99 },'Gb': { color: 'linear-gradient(to bottom right, #10ad54 50%, #38b6ff 50%)', freq: 369.99 },'G': { color: '#38b6ff', freq: 392.00 },'G#': { color: 'linear-gradient(to bottom right, #38b6ff 50%, #004aad 50%)', freq: 415.30 },'Ab': { color: 'linear-gradient(to bottom right, #38b6ff 50%, #004aad 50%)', freq: 415.30 },'A': { color: '#004aad', freq: 440.00 },'A#': { color: 'linear-gradient(to bottom right, #004aad 50%, #7c45e8 50%)', freq: 466.16 },'Bb': { color: 'linear-gradient(to bottom right, #004aad 50%, #7c45e8 50%)', freq: 466.16 },'B': { color: '#7c45e8', freq: 493.88 }};
    const chordsByLevel = { 1: [{ name: 'Dó Maior (C)', notes: ['C', 'E', 'G'] },{ name: 'Ré Maior (D)', notes: ['D', 'F#', 'A'] },{ name: 'Mi Maior (E)', notes: ['E', 'G#', 'B'] },{ name: 'Fá Maior (F)', notes: ['F', 'A', 'C'] },{ name: 'Sol Maior (G)', notes: ['G', 'B', 'D'] },{ name: 'Lá Maior (A)', notes: ['A', 'C#', 'E'] },{ name: 'Si Maior (B)', notes: ['B', 'D#', 'F#'] }], 2: [{ name: 'Dó# Maior (C#)', notes: ['C#', 'F', 'G#'] },{ name: 'Ré# Maior (D#)', notes: ['D#', 'G', 'A#'] },{ name: 'Fá# Maior (F#)', notes: ['F#', 'A#', 'C#'] },{ name: 'Sol# Maior (G#)', notes: ['G#', 'C', 'D#'] },{ name: 'Lá# Maior (A#)', notes: ['A#', 'D', 'F'] }], 3: [{ name: 'Réb Maior (Db)', notes: ['Db', 'F', 'Ab'] },{ name: 'Mib Maior (Eb)', notes: ['Eb', 'G', 'Bb'] },{ name: 'Solb Maior (Gb)', notes: ['Gb', 'Bb', 'Db'] },{ name: 'Láb Maior (Ab)', notes: ['Ab', 'C', 'Eb'] },{ name: 'Sib Maior (Bb)', notes: ['Bb', 'D', 'F'] }]};
    const cipherToSolfege = { 'C': 'DÓ', 'D': 'RÉ', 'E': 'MI', 'F': 'FÁ', 'G': 'SOL', 'A': 'LÁ', 'B': 'SI' };

    // --- FUNÇÕES DE SOM E EFEITOS ---
    function playTone(frequency, duration = 0.5) { if (!audioCtx) return; const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); o.type = 'sine'; o.frequency.setValueAtTime(frequency, audioCtx.currentTime); g.gain.setValueAtTime(0.5, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration); o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime + duration); }
    function playPickupSound() { if (!audioCtx) return; playTone(800, 0.05); }
    function showStarAnimation() { for (let i = 0; i < 15; i++) { const star = document.createElement('div'); star.classList.add('star'); star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 50 + 25}%`; star.style.animationDuration = `${Math.random() * 1 + 0.5}s`; star.style.animationDelay = `${Math.random() * 0.5}s`; gameContent.appendChild(star); setTimeout(() => star.remove(), 2000); } }
    
    // --- LÓGICA DE NAVEGAÇÃO E CONTROLE DE JOGO ---
    function showScreen(screenToShow) {
        allScreens.forEach(s => { s.style.display = 'none'; });
        screenToShow.style.display = 'flex';
        backToMenuFromGameBtn.style.display = (screenToShow === gameScreen) ? 'block' : 'none';
    }
    const goBackToMenu = () => { clearInterval(gameTimer); showScreen(menuScreen); if (backgroundMusic.paused) backgroundMusic.play().catch(e => {}); };
    
    playBtn.addEventListener('click', () => showScreen(levelSelectScreen));
    instructionsBtn.addEventListener('click', () => showScreen(instructionsScreen));
    backToMenuFromLevelsBtn.addEventListener('click', goBackToMenu);
    backToMenuFromInstructionsBtn.addEventListener('click', goBackToMenu);
    backToMenuFromGameBtn.addEventListener('click', goBackToMenu);
    backToMenuFromEndBtn.addEventListener('click', goBackToMenu);
    playAgainBtn.addEventListener('click', () => showScreen(levelSelectScreen));
    levelButtons.forEach(button => { button.addEventListener('click', () => { const level = button.dataset.level; startGame(level); }); });
    
    function updateHud() { scoreDisplay.textContent = `Pontuação: ${score}`; timerDisplay.textContent = `Tempo: ${timeLeft}`; }
    function gameTick() { timeLeft--; updateHud(); if (timeLeft <= 0) { endGame(false); } }
    function startGame(level) { backgroundMusic.pause(); backgroundMusic.currentTime = 0; score = 0; timeLeft = TIME_PER_LEVEL; updateHud(); clearInterval(gameTimer); gameTimer = setInterval(gameTick, 1000); currentChords = [...chordsByLevel[level]].sort(() => Math.random() - 0.5); currentChordIndex = 0; showScreen(gameScreen); loadChord(currentChordIndex); }
    
    function endGame(isWin) {
        clearInterval(gameTimer);
        if (isWin) {
            endTitle.textContent = "Parabéns!";
            endMessage.textContent = "Você completou o desafio!";
            new Audio('sucess.mp3').play(); // <<< ALTERAÇÃO APLICADA AQUI
            showStarAnimation();
        } else {
            endTitle.textContent = "Tempo Esgotado!";
            endMessage.textContent = "Não desista, tente novamente!";
        }
        finalScoreValue.textContent = score;
        showScreen(endScreen);
    }

    function loadChord(index) { const chord = currentChords[index]; chordNameEl.textContent = `${chord.name}`; feedbackMessageEl.textContent = ''; staffEl.innerHTML = ''; notesPoolEl.innerHTML = ''; for (let i = 0; i < chord.notes.length; i++) { const slot = document.createElement('div'); slot.classList.add('drop-slot'); staffEl.appendChild(slot); } const correctNotes = chord.notes; const allNoteNames = Object.keys(notesData); let distractors = []; while (distractors.length < 4) { const randomNote = allNoteNames[Math.floor(Math.random() * allNoteNames.length)]; if (!correctNotes.includes(randomNote) && !distractors.includes(randomNote)) { distractors.push(randomNote); } } const poolNotes = [...correctNotes, ...distractors].sort(() => Math.random() - 0.5); poolNotes.forEach(noteName => createNote(noteName, notesPoolEl)); addDragAndDropListeners(); }
    function createNote(noteName, parentElement) { const noteEl = document.createElement('div'); noteEl.classList.add('note'); const baseNote = noteName.charAt(0); const accidental = noteName.length > 1 ? noteName.charAt(1) : ''; const solfegeBase = cipherToSolfege[baseNote]; const accidentalSymbol = accidental === '#' ? '♯' : (accidental === 'b' ? '♭' : ''); noteEl.textContent = solfegeBase + accidentalSymbol; noteEl.dataset.noteName = noteName; noteEl.style.background = notesData[noteName].color; noteEl.draggable = true; parentElement.appendChild(noteEl); return noteEl; }
    function returnNoteToPool(event) { const noteEl = event.target; notesPoolEl.appendChild(noteEl); noteEl.classList.remove('in-slot'); noteEl.removeEventListener('click', returnNoteToPool); feedbackMessageEl.textContent = ''; }
    function addDragAndDropListeners() { const notes = notesPoolEl.querySelectorAll('.note'); const slots = staffEl.querySelectorAll('.drop-slot'); notes.forEach(note => { note.addEventListener('dragstart', (e) => { draggedNote = e.target; playPickupSound(); }); }); slots.forEach(slot => { slot.addEventListener('dragover', (e) => e.preventDefault()); slot.addEventListener('drop', (e) => { e.preventDefault(); if (e.target.classList.contains('drop-slot') && !e.target.firstChild) { e.target.appendChild(draggedNote); draggedNote.classList.add('in-slot'); playTone(notesData[draggedNote.dataset.noteName].freq); draggedNote.addEventListener('click', returnNoteToPool); checkAnswer(); } }); }); }
    function checkAnswer() { const slots = staffEl.querySelectorAll('.drop-slot'); const notesInSlots = Array.from(slots).map(slot => slot.firstChild?.dataset.noteName); if (notesInSlots.every(note => note)) { const correctNotes = currentChords[currentChordIndex].notes; const isCorrect = correctNotes.length === notesInSlots.length && correctNotes.every(note => notesInSlots.includes(note)); if (isCorrect) { score += POINTS_PER_CHORD; updateHud(); feedbackMessageEl.textContent = 'Correto!'; feedbackMessageEl.className = 'feedback-correct'; showStarAnimation(); setTimeout(() => { currentChordIndex++; if (currentChordIndex < currentChords.length) { loadChord(currentChordIndex); } else { endGame(true); } }, 2000); } else { feedbackMessageEl.textContent = 'Ops, acorde incorreto. Clique na nota para corrigir.'; feedbackMessageEl.className = 'feedback-wrong'; } } }
    
    showScreen(menuScreen);
});
