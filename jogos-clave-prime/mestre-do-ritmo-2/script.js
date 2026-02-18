document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS ---
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const levelGrid = document.getElementById('level-grid');
    const btnReset = document.getElementById('btn-reset'); // Botão Reset
    
    const gameContainer = document.getElementById('game-container');
    const backToLevelsButton = document.getElementById('back-to-levels-button');
    const levelDisplay = document.getElementById('level-display');
    
    const clapButton = document.getElementById('clap-button');
    const statusDisplay = document.getElementById('status-display');
    const rhythmGuide = document.getElementById('rhythm-guide');
    const rhythmCursor = document.getElementById('rhythm-cursor');
    const accuracyFeedback = document.getElementById('accuracy-feedback');
    
    // Modal
    const modalScreen = document.getElementById('modal-screen');
    const modalTitle = document.getElementById('modal-title');
    const modalRhythmPreview = document.getElementById('modal-rhythm-preview');
    const modalText = document.getElementById('modal-text');
    const modalStarsContainer = document.getElementById('modal-stars-container');
    
    // Botões do Modal
    const btnStartLevel = document.getElementById('btn-start-level');
    const resultActions = document.getElementById('result-actions');
    const btnMenu = document.getElementById('btn-menu');
    const btnRepeat = document.getElementById('btn-repeat');
    const btnNext = document.getElementById('btn-next');

    // --- CONFIGURAÇÃO DOS 12 NÍVEIS ---
    // t: tempo de início, d: duração (1=semínima, 0.5=colcheia, 2=mínima)
    const RHYTHM_LEVELS = [
        // FASE 1: Introdução (Semínimas)
        { tempo: 60, pattern: [{t:0,d:1},{t:1,d:1},{t:2,d:1},{t:3,d:1}] }, 
        
        // FASE 2: Pausas Básicas
        { tempo: 60, pattern: [{t:0,d:1},{t:1,d:1, rest:true},{t:2,d:1},{t:3,d:1, rest:true}] }, 
        
        // FASE 3: Sons Longos (Mínimas)
        { tempo: 60, pattern: [{t:0,d:2},{t:2,d:1},{t:3,d:1}] }, 
        
        // FASE 4: Colcheias (Subdivisão)
        { tempo: 60, pattern: [{t:0,d:1},{t:1,d:0.5},{t:1.5,d:0.5},{t:2,d:1},{t:3,d:1}] }, 
        
        // FASE 5: Mistura Básica
        { tempo: 60, pattern: [{t:0,d:0.5},{t:0.5,d:0.5},{t:1,d:1},{t:2,d:2}] }, 
        
        // FASE 6: Acelerando (Tempo 70)
        { tempo: 70, pattern: [{t:0,d:0.5},{t:0.5,d:0.5},{t:1,d:0.5},{t:1.5,d:0.5},{t:2,d:1},{t:3,d:1}] },
        
        // FASE 7: Pausa no final (Cuidado!)
        { tempo: 70, pattern: [{t:0,d:1},{t:1,d:1},{t:2,d:0.5},{t:2.5,d:0.5},{t:3,d:1, rest:true}] },
        
        // FASE 8: Pausa no tempo forte
        { tempo: 70, pattern: [{t:0,d:1, rest:true},{t:1,d:1},{t:2,d:0.5},{t:2.5,d:0.5},{t:3,d:1}] },

        // FASE 9: Contratempo Simples
        { tempo: 75, pattern: [{t:0,d:0.5},{t:0.5,d:0.5},{t:1,d:1},{t:2,d:1, rest:true},{t:3,d:1}] },

        // FASE 10: Resistência (Muitas colcheias)
        { tempo: 75, pattern: [{t:0,d:0.5},{t:0.5,d:0.5},{t:1,d:0.5},{t:1.5,d:0.5},{t:2,d:0.5},{t:2.5,d:0.5},{t:3,d:1}] },

        // FASE 11: Mínima no meio (Atenção visual)
        { tempo: 75, pattern: [{t:0,d:0.5},{t:0.5,d:0.5},{t:1,d:2},{t:3,d:1}] },

        // FASE 12: Desafio Final (Rápido e misturado)
        { tempo: 85, pattern: [{t:0,d:1},{t:1,d:0.5},{t:1.5,d:0.5},{t:2,d:1, rest:true},{t:3,d:0.5},{t:3.5,d:0.5}] }
    ];

    // --- CARREGAMENTO DE ÁUDIOS ---
    const sounds = {};
    ['clap', 'count', 'level_success', 'level_fail', 'tick'].forEach(file => { 
        sounds[file] = new Audio(`${file}.mp3`);
        sounds[file].load();
    });
    
    // VARIÁVEIS DE ESTADO
    let currentLevel = 0;
    let gameState = 'IDLE'; 
    let beats = []; 
    let playerBeats = [];
    let activeTimeouts = [];
    let metronomeInterval;
    let progress;

    function playSound(name) {
        if (sounds[name]) {
            sounds[name].currentTime = 0;
            sounds[name].play().catch(() => {});
        }
    }

    function clearAll() {
        activeTimeouts.forEach(id => clearTimeout(id));
        activeTimeouts = [];
        clearInterval(metronomeInterval);
        rhythmCursor.style.transition = 'none';
        rhythmCursor.style.left = '0';
        rhythmCursor.style.display = 'none';
        clapButton.classList.remove('pulsing-demo');
    }

    // --- TELA DE SELEÇÃO ---
    function showLevelSelection() {
        gameContainer.classList.add('hidden');
        levelSelectionScreen.classList.remove('hidden');
        modalScreen.classList.add('hidden');
        
        try {
            const data = JSON.parse(localStorage.getItem('mestreRitmo2'));
            progress = data || { maxLevel: 1, stars: {} };
        } catch { progress = { maxLevel: 1, stars: {} }; }

        levelGrid.innerHTML = '';
        let completedCount = 0; // Contador para o botão de reset

        RHYTHM_LEVELS.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = 'level-button';
            
            const starsCount = progress.stars[i] || 0;
            if (starsCount > 0) completedCount++;

            if (i < progress.maxLevel) {
                btn.innerHTML = `<span>${i + 1}</span><div class="stars-container">${getStarsHTML(starsCount)}</div>`;
                btn.onclick = () => startLevel(i);
            } else {
                btn.classList.add('locked');
                btn.innerHTML = '🔒';
            }
            levelGrid.appendChild(btn);
        });

        // Lógica do Botão Reset
        if (completedCount === RHYTHM_LEVELS.length) {
            btnReset.classList.remove('hidden');
            btnReset.onclick = () => {
                if (confirm("Deseja realmente apagar seu progresso e começar do zero?")) {
                    localStorage.removeItem('mestreRitmo2');
                    showLevelSelection();
                }
            };
        } else {
            btnReset.classList.add('hidden');
        }
    }

    function getStarsHTML(count) {
        return Array(3).fill(0).map((_, i) => `<span class="star ${i < count ? 'filled' : ''}">⭐</span>`).join('');
    }

    // --- INÍCIO DO JOGO ---
    function startLevel(index) {
        currentLevel = index;
        levelSelectionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        clearAll();
        updateHUD();
        
        const level = RHYTHM_LEVELS[currentLevel];
        rhythmGuide.innerHTML = getRhythmVisual(level.pattern);
        rhythmGuide.classList.remove('hidden');
        
        showModalIntro();
    }

    function updateHUD() { levelDisplay.textContent = currentLevel + 1; }

    // RENDERIZADOR (Lida com pares de colcheias)
    function getRhythmVisual(pattern) {
        let html = '';
        let skipNext = false;

        pattern.forEach((beat, i) => {
            if (skipNext) { skipNext = false; return; }

            let imgSrc = '';
            if (beat.rest) imgSrc = 'pausa-seminima.png';
            else if (beat.d === 2) imgSrc = 'minima.png';
            else if (beat.d === 1) imgSrc = 'seminima.png';
            else if (beat.d === 0.5) {
                const nextBeat = pattern[i+1];
                if (nextBeat && nextBeat.d === 0.5 && !nextBeat.rest && nextBeat.t === beat.t + 0.5) {
                    imgSrc = 'colcheias.png'; // Par
                    skipNext = true;
                } else {
                    imgSrc = 'colcheias.png'; // Fallback
                }
            }

            if (imgSrc) {
                html += `<img src="${imgSrc}" class="rhythm-icon ${beat.rest ? 'pausa' : ''}">`;
            }
        });
        return html;
    }

    // --- MODAL ---
    function showModalIntro() {
        const level = RHYTHM_LEVELS[currentLevel];
        modalTitle.textContent = `Nível ${currentLevel + 1}`;
        modalText.innerHTML = "Siga a barra vermelha e toque as notas no tempo certo!";
        modalRhythmPreview.innerHTML = getRhythmVisual(level.pattern);
        modalRhythmPreview.querySelectorAll('img').forEach(img => img.classList.add('preview-icon'));
        modalStarsContainer.innerHTML = '';
        
        btnStartLevel.classList.remove('hidden');
        resultActions.classList.add('hidden');
        
        btnStartLevel.onclick = () => {
            modalScreen.classList.add('hidden');
            playDemonstration();
        };
        modalScreen.classList.remove('hidden');
    }

    function showResult() {
        gameState = 'RESULT';
        clapButton.disabled = true;
        rhythmCursor.style.display = 'none';

        // PONTUAÇÃO
        let hits = 0;
        let totalNotes = beats.filter(b => !b.rest).length;
        beats.forEach(target => {
            if (!target.rest) {
                const matched = playerBeats.some(pTime => Math.abs(pTime - target.time) < 0.35);
                if (matched) hits++;
            }
        });
        const extraClicks = Math.max(0, playerBeats.length - totalNotes);
        const finalScore = Math.max(0, hits - extraClicks);
        const accuracy = totalNotes > 0 ? finalScore / totalNotes : 0;
        const stars = calculateStars(accuracy);

        if (stars > 0) {
            playSound('level_success');
            if (currentLevel + 1 >= progress.maxLevel) progress.maxLevel = currentLevel + 2;
            if (stars > (progress.stars[currentLevel] || 0)) progress.stars[currentLevel] = stars;
            localStorage.setItem('mestreRitmo2', JSON.stringify(progress));
        } else {
            playSound('level_fail');
        }

        modalTitle.textContent = stars > 0 ? "Nível Concluído!" : "Tente Novamente";
        modalText.innerHTML = `Você acertou <strong>${finalScore}</strong> de <strong>${totalNotes}</strong> notas.`;
        modalStarsContainer.innerHTML = getStarsHTML(stars);

        btnStartLevel.classList.add('hidden');
        resultActions.classList.remove('hidden');

        btnMenu.onclick = () => { clearAll(); showLevelSelection(); };
        btnRepeat.onclick = () => { modalScreen.classList.add('hidden'); startLevel(currentLevel); };
        
        if (stars > 0 && currentLevel + 1 < RHYTHM_LEVELS.length) {
            btnNext.classList.remove('hidden');
            btnNext.onclick = () => { modalScreen.classList.add('hidden'); startLevel(currentLevel + 1); };
        } else {
            btnNext.classList.add('hidden');
        }
        modalScreen.classList.remove('hidden');
    }

    function calculateStars(acc) {
        if (acc >= 0.9) return 3;
        if (acc >= 0.7) return 2;
        if (acc >= 0.5) return 1;
        return 0;
    }

    // --- GAME LOOP ---
    function playDemonstration() {
        clearAll();
        gameState = 'DEMO';
        statusDisplay.textContent = "Escute o Ritmo...";
        clapButton.disabled = true;

        const level = RHYTHM_LEVELS[currentLevel];
        const secPerBeat = 60 / level.tempo;
        beats = level.pattern.map(b => ({ ...b, time: b.t * secPerBeat }));

        beats.forEach(b => {
            if (!b.rest) {
                activeTimeouts.push(setTimeout(() => {
                    playSound('clap');
                    clapButton.classList.add('pulsing-demo');
                    setTimeout(() => clapButton.classList.remove('pulsing-demo'), 100);
                }, b.time * 1000));
            }
        });

        const totalDuration = (4 * secPerBeat + 1) * 1000;
        activeTimeouts.push(setTimeout(runCountIn, totalDuration));
    }

    function runCountIn() {
        clearAll();
        gameState = 'COUNT_IN';
        statusDisplay.textContent = "Prepare-se...";
        
        const level = RHYTHM_LEVELS[currentLevel];
        const beatMs = (60 / level.tempo) * 1000;
        let count = 1;

        metronomeInterval = setInterval(() => {
            if (count <= 4) {
                statusDisplay.textContent = count;
                playSound('tick');
                count++;
            } else {
                clearInterval(metronomeInterval);
                startPlayerTurn();
            }
        }, beatMs);
    }

    function startPlayerTurn() {
        gameState = 'PLAY';
        statusDisplay.textContent = "SUA VEZ!";
        clapButton.disabled = false;
        playerBeats = [];
        
        const level = RHYTHM_LEVELS[currentLevel];
        const secPerBeat = 60 / level.tempo;
        const totalTime = 4 * secPerBeat;

        rhythmCursor.style.display = 'block';
        rhythmCursor.style.left = '0%';
        rhythmCursor.style.transition = 'none';
        void rhythmCursor.offsetWidth;
        rhythmCursor.style.transition = `left ${totalTime}s linear`;
        rhythmCursor.style.left = '90%';

        const startTime = performance.now();
        const handleInput = () => {
            if (gameState !== 'PLAY') return;
            const hitTime = (performance.now() - startTime) / 1000;
            playerBeats.push(hitTime);
            playSound('clap');
            checkInstantFeedback(hitTime, beats);
        };

        clapButton.onclick = handleInput;
        document.onkeydown = (e) => {
            if (e.code === 'Space' && gameState === 'PLAY' && !e.repeat) {
                e.preventDefault(); handleInput();
                clapButton.style.transform = "translateY(4px)";
                setTimeout(() => clapButton.style.transform = "none", 100);
            }
        };

        activeTimeouts.push(setTimeout(showResult, totalTime * 1000 + 500));
    }

    function checkInstantFeedback(hitTime, targetBeats) {
        let bestDiff = 999;
        targetBeats.forEach(target => {
            if (!target.rest) {
                const diff = Math.abs(hitTime - target.time);
                if (diff < bestDiff) bestDiff = diff;
            }
        });

        accuracyFeedback.classList.remove('feedback-pop');
        void accuracyFeedback.offsetWidth; 

        if (bestDiff < 0.15) {
            accuracyFeedback.textContent = "PERFEITO!";
            accuracyFeedback.style.color = "var(--perfect)";
        } else if (bestDiff < 0.35) {
            accuracyFeedback.textContent = "BOM";
            accuracyFeedback.style.color = "var(--good)";
        } else {
            accuracyFeedback.textContent = ""; 
        }
        
        if (bestDiff < 0.35) accuracyFeedback.classList.add('feedback-pop');
    }

    backToLevelsButton.onclick = () => { clearAll(); showLevelSelection(); };

    // INICIAR
    showLevelSelection();
});