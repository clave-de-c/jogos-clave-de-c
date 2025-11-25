document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos ---
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const winScreen = document.getElementById('win-screen');
    const playBtn = document.getElementById('play-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Mute
    const muteBtn = document.getElementById('mute-btn');
    let isMuted = false;
    
    // --- Áudios ---
    const bgMusic = document.getElementById('bg-music');
    const sndPickup = document.getElementById('snd-pickup');
    const sndWin = document.getElementById('snd-win');
    const sndError = document.getElementById('snd-error');

    const notesData = [
        { name: 'Do', label: 'Dó', colorClass: 'bg-Do' },
        { name: 'Re', label: 'Ré', colorClass: 'bg-Re' },
        { name: 'Mi', label: 'Mi', colorClass: 'bg-Mi' },
        { name: 'Fa', label: 'Fá', colorClass: 'bg-Fa' },
        { name: 'Sol', label: 'Sol', colorClass: 'bg-Sol' },
        { name: 'La', label: 'Lá', colorClass: 'bg-La' },
        { name: 'Si', label: 'Si', colorClass: 'bg-Si' }
    ];

    // --- Controle de Áudio ---
    function setMusicVolume(vol) {
        if (!isMuted) bgMusic.volume = vol;
    }

    // Toggle Mute
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        sndPickup.muted = isMuted;
        sndWin.muted = isMuted;
        sndError.muted = isMuted;
        
        muteBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    // Tentar tocar música ao carregar
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => console.log("Aguardando interação"));

    // --- Navegação ---
    playBtn.addEventListener('click', () => {
        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.style.display = 'block';
        
        setMusicVolume(0.15);
        if(bgMusic.paused && !isMuted) bgMusic.play();
        
        startGame();
    });

    restartBtn.addEventListener('click', () => {
        winScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.style.display = 'block';
        
        sndWin.pause();
        sndWin.currentTime = 0;
        setMusicVolume(0.15);
        if(bgMusic.paused && !isMuted) bgMusic.play();

        startGame();
    });

    backToMenuBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        winScreen.classList.remove('active');
        menuScreen.classList.add('active');
        backToMenuBtn.style.display = 'none';
        
        sndWin.pause();
        sndWin.currentTime = 0;
        setMusicVolume(0.4);
        if(bgMusic.paused && !isMuted) bgMusic.play();
    });

    instructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('active');
    });

    // --- Lógica do Jogo ---
    let draggedItem = null;

    function playPickupSound() {
        if(isMuted) return;
        sndPickup.currentTime = 0;
        sndPickup.play().catch(() => {});
    }

    function startGame() {
        const pool = document.getElementById('notes-pool');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        pool.innerHTML = '';
        dropZones.forEach(z => z.innerHTML = '');
        document.getElementById('feedback-msg').innerText = "Arraste os presentes para os espaços.";
        document.getElementById('feedback-msg').style.color = "#666";

        // Importante: Habilitar o pool para receber itens de volta
        pool.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        pool.addEventListener('drop', function() {
            if (draggedItem) {
                this.appendChild(draggedItem);
            }
        });

        const shuffled = [...notesData].sort(() => Math.random() - 0.5);

        shuffled.forEach(note => {
            const el = document.createElement('div');
            el.className = `note-gift ${note.colorClass}`;
            el.draggable = true;
            el.setAttribute('data-note', note.name);
            el.innerText = note.label;

            // Drag Events
            el.addEventListener('dragstart', function() {
                playPickupSound();
                draggedItem = this;
                setTimeout(() => this.style.opacity = '0.5', 0);
            });
            el.addEventListener('dragend', function() {
                setTimeout(() => this.style.opacity = '1', 0);
                draggedItem = null;
            });

            // Touch Events
            el.addEventListener('touchstart', (e) => {
                playPickupSound();
                handleTouchStart(e);
            }, {passive: false});
            el.addEventListener('touchend', handleTouchEnd);

            pool.appendChild(el);
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', function() {
                this.classList.remove('drag-over');
                if (this.children.length === 0 && draggedItem) {
                    this.appendChild(draggedItem);
                }
            });
        });
    }

    // Touch Logic
    let touchItem = null;
    function handleTouchStart(e) { touchItem = e.target; }
    function handleTouchEnd(e) {
        if(!touchItem) return;
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = target ? target.closest('.drop-zone') : null;
        const pool = document.getElementById('notes-pool');

        // Se soltou numa zona válida vazia
        if (dropZone && dropZone.children.length === 0) {
            dropZone.appendChild(touchItem);
        } 
        // AQUI ESTÁ A CORREÇÃO: Se soltou fora de qualquer zona, ou de volta no pool
        else {
             // Devolve para o pool se não estiver em uma zona
             if(pool) pool.appendChild(touchItem);
        }
        touchItem = null;
    }

    window.checkOrder = function() {
        const zones = document.querySelectorAll('.drop-zone');
        let correct = 0;
        let full = true;

        zones.forEach(z => {
            if (z.children.length === 0) full = false;
            else {
                const note = z.children[0].getAttribute('data-note');
                const target = z.getAttribute('data-target');
                if (note === target) correct++;
            }
        });

        const feedback = document.getElementById('feedback-msg');

        if (!full) {
            feedback.innerText = "Preencha todos os espaços!";
            feedback.style.color = "orange";
            return;
        }

        if (correct === 7) {
            if(!isMuted) {
                bgMusic.pause();
                sndWin.currentTime = 0;
                sndWin.play();
            }
            
            gameScreen.classList.remove('active');
            winScreen.classList.add('active');
            backToMenuBtn.style.display = 'block';
        } else {
            if(!isMuted) sndError.play();
            feedback.innerText = `Ops! ${correct} de 7 corretos.`;
            feedback.style.color = "red";
        }
    }
});