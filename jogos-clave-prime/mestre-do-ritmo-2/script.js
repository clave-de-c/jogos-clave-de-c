document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const levelGrid = document.getElementById('level-grid');
    const gameContainer = document.getElementById('game-container');
    const backToLevelsButton = document.getElementById('back-to-levels-button');
    const levelDisplay = document.getElementById('level-display');
    const clapButton = document.getElementById('clap-button');
    const statusDisplay = document.getElementById('status-display');
    const rhythmGuide = document.getElementById('rhythm-guide');
    const modalScreen = document.getElementById('modal-screen');
    const modalTitle = document.getElementById('modal-title');
    const modalRhythmPreview = document.getElementById('modal-rhythm-preview');
    const modalText = document.getElementById('modal-text');
    const modalButton = document.getElementById('modal-button');
    const modalStarsContainer = document.getElementById('modal-stars-container');

    // --- CARREGAMENTO DE ÁUDIO ---
    // Usa os nomes exatos que estão na sua pasta
    const sounds = {};
    const audioFiles = ['clap', 'count', 'level_success', 'level_fail', 'tick'];
    
    audioFiles.forEach(sound => {
        sounds[sound] = new Audio(`${sound}.mp3`); // Ajuste para .wav se necessário
        sounds[sound].load();
    });

    function playSound(name) {
        if (sounds[name]) {
            sounds[name].currentTime = 0;
            sounds[name].play().catch(e => console.log("Erro áudio:", e));
        }
    }

    // --- DADOS DOS NÍVEIS ---
    // t: tempo inicial, d: duração (1=Semínima, 0.5=Colcheia, 0.25=Semicolcheia)
    const RHYTHM_LEVELS = [
        // NÍVEL 1: Revisão (Semínimas e Pausas)
        { tempo: 60, pattern: [{t:0,d:1},{t:1,d:1},{t:2,d:1, rest:true},{t:3,d:1}] },
        
        // NÍVEL 2: Revisão (Colcheias/Ti-Ti)
        { tempo: 60, pattern: [{t:0,d:1},{t:1,d:0.5},{t:1.5,d:0.5},{t:2,d:1},{t:3,d:1}] },
        
        // NÍVEL 3: Introdução "Ti-ri-ti-ri" (Semicolcheias isoladas)
        // No tempo 2, temos 4 notas rápidas
        { tempo: 55, pattern: [{t:0,d:1}, {t:1,d:1, rest:true}, {t:2,d:0.25},{t:2.25,d:0.25},{t:2.5,d:0.25},{t:2.75,d:0.25}, {t:3,d:1}] },
        
        // NÍVEL 4: Praticando o grupo
        { tempo: 55, pattern: [{t:0,d:1}, {t:1,d:0.25},{t:1.25,d:0.25},{t:1.5,d:0.25},{t:1.75,d:0.25}, {t:2,d:1}, {t:3,d:1}] },
        
        // NÍVEL 5: Misturando Ti-Ti com Ti-ri-ti-ri
        { tempo: 55, pattern: [{t:0,d:0.5},{t:0.5,d:0.5}, {t:1,d:0.25},{t:1.25,d:0.25},{t:1.5,d:0.25},{t:1.75,d:0.25}, {t:2,d:1}, {t:3,d:1}] },
        
        // NÍVEL 6: Duas sequências rápidas
        { tempo: 50, pattern: [{t:0,d:0.25},{t:0.25,d:0.25},{t:0.5,d:0.25},{t:0.75,d:0.25}, {t:1,d:0.25},{t:1.25,d:0.25},{t:1.5,d:0.25},{t:1.75,d:0.25}, {t:2,d:1, rest:true}, {t:3,d:1}] },
        
        // NÍVEL 7: O Desafio Misto
        { tempo: 60, pattern: [{t:0,d:1}, {t:1,d:0.5},{t:1.5,d:0.5}, {t:2,d:0.25},{t:2.25,d:0.25},{t:2.5,d:0.25},{t:2.75,d:0.25}, {t:3,d:1}] },
        
        // NÍVEL 8: Mestre das Semicolcheias
        { tempo: 65, pattern: [{t:0,d:0.25},{t:0.25,d:0.25},{t:0.5,d:0.25},{t:0.75,d:0.25}, {t:1,d:0.5},{t:1.5,d:0.5}, {t:2,d:0.25},{t:2.25,d:0.25},{t:2.5,d:0.25},{t:2.75,d:0.25}, {t:3,d:1}] }
    ];

    let currentLevel = 0, gameState = 'IDLE';
    let beats = [], playerBeats = [];
    let activeTimeouts = [], metronomeInterval;
    let progress = JSON.parse(localStorage.getItem('mestreRitmo2Progress')) || { maxLevel: 1, stars: {} };

    function clearAllTimers() {
        activeTimeouts.forEach(t => clearTimeout(t));
        activeTimeouts = [];
        clearInterval(metronomeInterval);
    }

    function showLevelSelection() {
        gameContainer.classList.add('hidden');
        levelSelectionScreen.classList.remove('hidden');
        modalScreen.classList.add('hidden');

        levelGrid.innerHTML = '';
        for (let i = 0; i < RHYTHM_LEVELS.length; i++) {
            const button = document.createElement('button');
            button.className = 'level-button';
            
            if (i < progress.maxLevel) {
                button.innerHTML = `<span>${i + 1}</span><div class="stars-container">${getStarsHTML(progress.stars[i] || 0)}</div>`;
                button.onclick = () => startLevel(i);
            } else {
                button.innerHTML = '🔒';
                button.classList.add('locked');
                button.disabled = true;
            }
            levelGrid.appendChild(button);
        }
    }

    function getStarsHTML(count) {
        let html = '';
        for (let i = 0; i < 3; i++) {
            html += `<span class="star ${i < count ? 'filled' : ''}">★</span>`;
        }
        return html;
    }

    function startLevel(index) {
        currentLevel = index;
        levelSelectionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        levelDisplay.textContent = index + 1;
        
        // Configura modal de introdução
        const level = RHYTHM_LEVELS[currentLevel];
        modalTitle.textContent = `Nível ${currentLevel + 1}`;
        modalText.innerHTML = "Escute o exemplo.<br>Fique atento às notas rápidas!";
        modalRhythmPreview.innerHTML = getRhythmVisual(level.pattern);
        modalStarsContainer.innerHTML = "";
        modalButton.textContent = "Ouvir Exemplo";
        
        modalScreen.classList.remove('hidden');
        modalButton.onclick = () => {
            modalScreen.classList.add('hidden');
            playDemonstration();
        };
    }

    function playDemonstration() {
        clearAllTimers();
        gameState = 'DEMO';
        statusDisplay.textContent = "Escute...";
        statusDisplay.classList.remove('hidden');
        clapButton.disabled = true;
        rhythmGuide.innerHTML = getRhythmVisual(RHYTHM_LEVELS[currentLevel].pattern);
        rhythmGuide.classList.remove('hidden');

        const level = RHYTHM_LEVELS[currentLevel];
        const secPerBeat = 60.0 / level.tempo;
        beats = level.pattern.map(b => ({...b, time: b.t * secPerBeat}));

        // Toca a demonstração (computador tocando)
        beats.forEach((beat, index) => {
            if (!beat.rest) {
                activeTimeouts.push(setTimeout(() => {
                    playSound('clap'); // Som do arquivo
                    highlightVisualNote(index);
                    // Efeito visual no botão principal
                    clapButton.style.backgroundColor = "#e8f8f5";
                    setTimeout(() => clapButton.style.backgroundColor = "#f9f9f9", 100);
                }, beat.time * 1000));
            }
        });

        // Inicia a contagem para o jogador
        const totalDuration = (4 * secPerBeat + 1) * 1000;
        activeTimeouts.push(setTimeout(runCountIn, totalDuration));
    }

    function highlightVisualNote(index) {
        const icons = document.querySelectorAll('.rhythm-guide-icon');
        if(icons[index]) {
            icons[index].classList.add('active');
            setTimeout(() => icons[index].classList.remove('active'), 200);
        }
    }

    function runCountIn() {
        gameState = 'COUNT_IN';
        statusDisplay.textContent = "Prepare-se...";
        let count = 1;
        const level = RHYTHM_LEVELS[currentLevel];
        const beatMs = (60.0 / level.tempo) * 1000;

        // Usa o som 'count.mp3' se for falado, ou tick se preferir
        metronomeInterval = setInterval(() => {
            if (count <= 4) {
                statusDisplay.textContent = count;
                playSound(count <= 4 ? 'tick' : 'tick'); 
                count++;
            } else {
                clearAllTimers();
                startPlayerTurn();
            }
        }, beatMs);
    }

    function startPlayerTurn() {
        gameState = 'PLAY';
        statusDisplay.textContent = "Sua Vez!";
        statusDisplay.style.color = "#27ae60";
        clapButton.disabled = false;
        playerBeats = [];
        
        const startTime = performance.now();
        const level = RHYTHM_LEVELS[currentLevel];
        const secPerBeat = 60.0 / level.tempo;

        // Inicia metrônomo de fundo para ajudar (opcional, pode remover se quiser mais difícil)
        // startMetronome(secPerBeat); 

        const handleInput = () => {
            if(gameState !== 'PLAY') return;
            const time = (performance.now() - startTime) / 1000;
            playerBeats.push(time);
            playSound('clap');
        };

        clapButton.onclick = handleInput;
        document.onkeydown = (e) => {
            if (e.code === 'Space' && gameState === 'PLAY' && !e.repeat) {
                e.preventDefault();
                clapButton.click(); // Dispara o visual do clique também
            }
        };

        const totalDuration = (4 * secPerBeat) * 1000;
        activeTimeouts.push(setTimeout(checkResult, totalDuration + 600)); // Margem extra para o último toque
    }

    function checkResult() {
        gameState = 'RESULT';
        clapButton.disabled = true;
        document.onkeydown = null;
        // stopMetronome();
        
        let validHits = 0;
        const level = RHYTHM_LEVELS[currentLevel];
        const totalNotes = beats.filter(b => !b.rest).length;
        
        // Tolerância de tempo (0.25s é justo para Web)
        const tolerance = 0.25; 
        let inputs = [...playerBeats];

        beats.forEach(target => {
            if (!target.rest) {
                const matchIndex = inputs.findIndex(inputTime => Math.abs(inputTime - target.time) < tolerance);
                if (matchIndex !== -1) {
                    validHits++;
                    inputs.splice(matchIndex, 1); 
                }
            }
        });

        const accuracy = totalNotes > 0 ? validHits / totalNotes : 0;
        const stars = calculateStars(accuracy);
        
        saveProgress(stars);
        showResultModal(stars, validHits, totalNotes);
    }

    function calculateStars(acc) {
        if (acc >= 0.9) return 3;
        if (acc >= 0.7) return 2;
        if (acc >= 0.5) return 1;
        return 0;
    }

    function saveProgress(stars) {
        if (stars > 0) {
            if (currentLevel + 1 >= progress.maxLevel) {
                progress.maxLevel = Math.min(progress.maxLevel + 1, RHYTHM_LEVELS.length);
            }
            progress.stars[currentLevel] = Math.max(progress.stars[currentLevel] || 0, stars);
            localStorage.setItem('mestreRitmo2Progress', JSON.stringify(progress));
        }
    }

    function showResultModal(stars, hits, total) {
        modalStarsContainer.innerHTML = getStarsHTML(stars);
        if (stars > 0) {
            playSound('level_success'); // Som de vitória da pasta
            modalTitle.textContent = "Muito Bem!";
            modalText.innerHTML = `Acertou ${hits} de ${total} notas.`;
            modalButton.textContent = "Próximo Nível";
            modalButton.onclick = () => {
                if (currentLevel + 1 < RHYTHM_LEVELS.length) startLevel(currentLevel + 1);
                else showLevelSelection();
            };
        } else {
            playSound('level_fail'); // Som de falha da pasta
            modalTitle.textContent = "Tente Novamente";
            modalText.innerHTML = "O ritmo escapou... Tente focar nas notas rápidas.";
            modalButton.textContent = "Recomeçar";
            modalButton.onclick = () => startLevel(currentLevel);
        }
        modalRhythmPreview.innerHTML = ''; 
        modalScreen.classList.remove('hidden');
    }

    // Gera o HTML visual das notas (Bolinhas e Mãozinhas)
    function getRhythmVisual(pattern) {
        let html = '';
        pattern.forEach(b => {
            if (b.rest) {
                html += '<span class="rhythm-guide-icon">🤫</span>';
            } else if (b.d <= 0.25) {
                // Semicolcheia (Bolinha pequena)
                html += '<span class="rhythm-guide-icon semicolcheia">●</span>';
            } else if (b.d <= 0.5) {
                // Colcheia (Mãozinha menor)
                html += '<span class="rhythm-guide-icon colcheia">✋</span>';
            } else {
                // Semínima (Mão normal)
                html += '<span class="rhythm-guide-icon">✋</span>';
            }
        });
        return html;
    }

    backToLevelsButton.onclick = () => {
        clearAllTimers();
        showLevelSelection();
    };

    // Iniciar na tela de seleção
    showLevelSelection();
});