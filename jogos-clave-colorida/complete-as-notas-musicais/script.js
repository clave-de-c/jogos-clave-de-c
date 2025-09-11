document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const allScreens = {
        menu: document.getElementById('menu-screen'),
        instructions: document.getElementById('instructions-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };
    const playBtn = document.getElementById('play-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const backToMenuBtns = document.querySelectorAll('.back-to-menu');
    const playAgainBtn = document.getElementById('play-again-btn');
    const levelTitle = document.getElementById('level-title');
    const scaleSequenceContainer = document.getElementById('scale-sequence');
    const draggableNotesContainer = document.getElementById('draggable-notes');
    const feedback = document.getElementById('feedback');
    const controlBtn = document.getElementById('control-btn');
    
    // Áudio do HTML
    const backgroundMusic = document.getElementById('audio-background');
    const dragSound = document.getElementById('audio-drag');
    const successSound = document.getElementById('audio-success'); // Novo som

    // ... (Conteúdo do jogo com os 25 desafios permanece o mesmo) ...
    const levels = [ { challenges: [ { sequence: ['DÓ', null, 'MI'], correctAnswers: ['RÉ'], options: ['LÁ','RÉ','SI'] }, { sequence: ['SOL',null,'SI'], correctAnswers: ['LÁ'], options: ['MI','LÁ','RÉ'] }, { sequence: [null,'RÉ','MI'], correctAnswers: ['DÓ'], options: ['DÓ','FÁ','SOL'] }, { sequence: ['MI',null,'SOL'], correctAnswers: ['FÁ'], options: ['LÁ','FÁ','DÓ'] }, { sequence: ['LÁ','SI',null], correctAnswers: ['DÓ'], options: ['SOL','DÓ','MI'] } ] }, { challenges: [ { sequence: [null,'RÉ',null,'FÁ'], correctAnswers: ['DÓ','MI'], options: ['LÁ','MI','DÓ','SI'] }, { sequence: ['MI',null,'SOL',null], correctAnswers: ['FÁ','LÁ'], options: ['RÉ','LÁ','FÁ','DÓ'] }, { sequence: [null,null,'MI','FÁ'], correctAnswers: ['DÓ','RÉ'], options: ['SI','DÓ','RÉ','LÁ'] }, { sequence: ['SOL','LÁ',null,null], correctAnswers: ['SI','DÓ'], options: ['FÁ','SI','MI','DÓ'] }, { sequence: ['RÉ',null,null,'SOL'], correctAnswers: ['MI','FÁ'], options: ['MI','SI','DÓ','FÁ'] } ] }, { challenges: [ { sequence: [null,null,null,'FÁ','SOL'], correctAnswers: ['DÓ','RÉ','MI'], options: ['RÉ','MI','LÁ','DÓ','FÁ'] }, { sequence: ['MI',null,null,null,'SI'], correctAnswers: ['FÁ','SOL','LÁ'], options: ['LÁ','DÓ','FÁ','SOL','RÉ'] }, { sequence: ['DÓ','RÉ',null,null,null], correctAnswers: ['MI','FÁ','SOL'], options: ['FÁ','LÁ','MI','SOL','SI'] }, { sequence: [null,'RÉ',null,'FÁ',null], correctAnswers: ['DÓ','MI','SOL'], options: ['MI','SI','DÓ','SOL','RÉ'] }, { sequence: ['FÁ',null,'LÁ',null,null], correctAnswers: ['SOL','SI','DÓ'], options: ['DÓ','LÁ','SOL','MI','SI'] } ] }, { challenges: [ { sequence: [null,null,null,null,'SOL'], correctAnswers: ['DÓ','RÉ','MI','FÁ'], options: ['FÁ','MI','RÉ','LÁ','DÓ'] }, { sequence: ['RÉ',null,null,null,null], correctAnswers: ['MI','FÁ','SOL','LÁ'], options: ['LÁ','MI','FÁ','SI','SOL'] }, { sequence: [null,'RÉ',null,'FÁ',null,null], correctAnswers: ['DÓ','MI','SOL','LÁ'], options: ['MI','LÁ','DÓ','SI','SOL'] }, { sequence: [null,null,'MI',null,null,'LÁ'], correctAnswers: ['DÓ','RÉ','FÁ','SOL'], options: ['RÉ','SOL','DÓ','FÁ','SI'] }, { sequence: ['DÓ',null,null,null,null,'LÁ'], correctAnswers: ['RÉ','MI','FÁ','SOL'], options: ['SOL','FÁ','MI','RÉ','SI'] } ] }, { challenges: [ { sequence: [null,null,null,null,null,'LÁ'], correctAnswers: ['DÓ','RÉ','MI','FÁ','SOL'], options: ['MI','DÓ','SOL','FÁ','RÉ','SI'] }, { sequence: ['RÉ',null,null,null,null,null], correctAnswers: ['MI','FÁ','SOL','LÁ','SI'], options: ['SI','LÁ','FÁ','MI','SOL','DÓ'] }, { sequence: [null,null,null,null,null,null,'SI'], correctAnswers: ['DÓ','RÉ','MI','FÁ','SOL','LÁ'], options: ['FÁ','LÁ','DÓ','MI','RÉ','SOL'] }, { sequence: ['DÓ',null,null,null,null,null,null], correctAnswers: ['RÉ','MI','FÁ','SOL','LÁ','SI'], options: ['SI','MI','RÉ','LÁ','SOL','FÁ'] }, { sequence: [null,'RÉ',null,'FÁ',null,'LÁ',null], correctAnswers: ['DÓ','MI','SOL','SI'], options: ['SI','DÓ','MI','LÁ','SOL'] } ] } ];
    const noteColors = { 'DÓ': '#FF0000', 'RÉ': '#FFA500', 'MI': '#FFFF00', 'FÁ': '#008000', 'SOL': '#00b6ff', 'LÁ': '#0016e0', 'SI': '#980aff' };
    
    let currentLevelIndex = 0, currentChallengeIndex = 0, correctSlotsFilled = 0;
    
    // --- NOVIDADE: Função para embaralhar as opções ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- NAVEGAÇÃO E CONTROLE DE ÁUDIO ---
    playBtn.addEventListener('click', () => { backgroundMusic.pause(); showScreen(allScreens.game); startGame(); });
    instructionsBtn.addEventListener('click', () => { backgroundMusic.play().catch(() => {}); showScreen(allScreens.instructions); });
    backToMenuBtns.forEach(btn => btn.addEventListener('click', () => { backgroundMusic.play().catch(() => {}); showScreen(allScreens.menu); }));
    playAgainBtn.addEventListener('click', () => { backgroundMusic.pause(); showScreen(allScreens.game); startGame(); });
    
    function showScreen(screenToShow) { Object.values(allScreens).forEach(s => s.classList.add('hidden')); screenToShow.classList.remove('hidden'); }
    function startGame() { currentLevelIndex = 0; currentChallengeIndex = 0; loadChallenge(); }

    function loadChallenge() {
        correctSlotsFilled = 0;
        const challenge = levels[currentLevelIndex].challenges[currentChallengeIndex];
        scaleSequenceContainer.innerHTML = ''; draggableNotesContainer.innerHTML = '';
        feedback.classList.add('hidden'); controlBtn.classList.add('hidden');
        levelTitle.textContent = `Nível ${currentLevelIndex + 1} - Desafio ${currentChallengeIndex + 1}`;
        
        // ... (criação da sequência igual a v5.0) ...
        let answerIndex = 0;
        challenge.sequence.forEach(note => {
            if (note) { scaleSequenceContainer.appendChild(document.createElement('span')).textContent = ` ${note} -`;
            } else {
                const dropZone = document.createElement('div');
                dropZone.className = 'drop-box';
                dropZone.dataset.answer = challenge.correctAnswers[answerIndex];
                scaleSequenceContainer.appendChild(dropZone);
                answerIndex++;
            }
        });
        
        // NOVIDADE: Embaralha as opções antes de exibi-las
        let optionsToDisplay = [...challenge.options];
        shuffleArray(optionsToDisplay);

        optionsToDisplay.forEach(noteName => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'draggable-note';
            noteDiv.textContent = noteName;
            noteDiv.style.backgroundColor = noteColors[noteName];
            noteDiv.draggable = true;
            draggableNotesContainer.appendChild(noteDiv);
        });
        setupDragAndDrop();
    }
    
    function setupDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable-note');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
                dragSound.currentTime = 0; dragSound.play();
            });
            draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
        });

        const dropZones = document.querySelectorAll('.drop-box');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('drop', e => {
                e.preventDefault();
                const draggingNote = document.querySelector('.dragging');
                if (draggingNote && !zone.classList.contains('filled')) {
                    if (draggingNote.textContent === zone.dataset.answer) {
                        // NOVIDADE: Adiciona a classe de animação
                        draggingNote.classList.add('note-pop');
                        
                        zone.innerHTML = ''; zone.appendChild(draggingNote);
                        zone.classList.add('filled');
                        draggingNote.draggable = false; draggingNote.classList.remove('dragging');
                        correctSlotsFilled++;

                        if (correctSlotsFilled === levels[currentLevelIndex].challenges[currentChallengeIndex].correctAnswers.length) {
                            successSound.currentTime = 0;
                            successSound.play(); // Toca som de sucesso
                            
                            feedback.textContent = 'Desafio completo! Excelente!';
                            feedback.className = 'feedback-correct';
                            feedback.classList.remove('hidden');
                            setupControlButton();
                        }
                    } else {
                        feedback.textContent = 'Ops, nota errada nesse lugar. Tente outra!';
                        feedback.className = 'feedback-incorrect';
                        feedback.classList.remove('hidden');
                    }
                }
            });
        });
    }

    // ... (funções setupControlButton e seu event listener permanecem iguais a v5.0) ...
    function setupControlButton() { controlBtn.classList.remove('hidden'); const isLastChallengeInLevel = currentChallengeIndex === levels[currentLevelIndex].challenges.length - 1; const isLastLevel = currentLevelIndex === levels.length - 1; if (isLastChallengeInLevel && isLastLevel) { controlBtn.textContent = 'Finalizar Jogo'; } else if (isLastChallengeInLevel) { controlBtn.textContent = 'Próximo Nível!'; } else { controlBtn.textContent = 'Próximo Desafio'; } }
    controlBtn.addEventListener('click', () => { const isLastChallengeInLevel = currentChallengeIndex === levels[currentLevelIndex].challenges.length - 1; const isLastLevel = currentLevelIndex === levels.length - 1; if (isLastChallengeInLevel && isLastLevel) { backgroundMusic.play().catch(()=>{}); showScreen(allScreens.end); } else if (isLastChallengeInLevel) { currentLevelIndex++; currentChallengeIndex = 0; loadChallenge(); } else { currentChallengeIndex++; loadChallenge(); } });
});