document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção dos Elementos do DOM ---
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const playBtn = document.getElementById('play-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    // ATUALIZAÇÃO 1: Garantindo que os seletores do modal estão corretos
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const bellOrchestra = document.getElementById('bell-orchestra');
    const noteNameDisplay = document.getElementById('note-name-display');
    const backgroundMusic = document.getElementById('background-music');

    const notes = [
        { name: 'Dó', id: 'do-sino', color: '#d41e1e', image: 'sino-do.png' },
        { name: 'Ré', id: 're-sino', color: '#f18c4d', image: 'sino-re.png' },
        { name: 'Mi', id: 'mi-sino', color: '#ffda43', image: 'sino-mi.png' },
        { name: 'Fá', id: 'fa-sino', color: '#10ad54', image: 'sino-fa.png' },
        { name: 'Sol', id: 'sol-sino', color: '#38b6ff', image: 'sino-sol.png' },
        { name: 'Lá', id: 'la-sino', color: '#004aad', image: 'sino-la.png' },
        { name: 'Si', id: 'si-sino', color: '#7c45e8', image: 'sino-si.png' },
        { name: 'Dó Agudo', id: 'do-agudo-sino', color: '#F7FCFF', image: 'sino-do-agudo.png' }
    ];

    // --- Lógica de Navegação e Telas ---
    playBtn.addEventListener('click', () => {
        menuScreen.classList.remove('active');
        gameScreen.classList.add('active');
        backToMenuBtn.style.display = 'inline-block';
        
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    });

    backToMenuBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        backToMenuBtn.style.display = 'none';
        noteNameDisplay.textContent = '';
    });
    
    // ATUALIZAÇÃO 1: Lógica do modal de instruções revisada para garantir funcionamento
    instructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('active');
    });

    // --- Lógica Principal do Jogo ---
    function createBells() {
        bellOrchestra.innerHTML = '';
        notes.forEach(note => {
            const bellImage = document.createElement('img');
            bellImage.src = note.image;
            bellImage.className = 'bell-image';
            bellImage.dataset.note = note.id;
            bellImage.alt = `Sino da nota ${note.name}`;

            bellImage.addEventListener('click', () => playNote(note));
            bellOrchestra.appendChild(bellImage);
        });
    }

    function playNote(note) {
        const noteAudio = document.getElementById(`audio-${note.id}`);
        noteAudio.currentTime = 0; 
        noteAudio.play();

        noteNameDisplay.textContent = note.name;
        
        if (note.color === '#F7FCFF') {
            noteNameDisplay.style.color = '#555';
        } else {
            noteNameDisplay.style.color = note.color;
        }

        const bellElement = document.querySelector(`.bell-image[data-note='${note.id}']`);
        bellElement.classList.add('playing');
        
        setTimeout(() => {
            bellElement.classList.remove('playing');
        }, 500);
    }

    // --- Inicialização ---
    document.body.addEventListener('click', () => {
        if (backgroundMusic.paused && menuScreen.classList.contains('active')) {
            backgroundMusic.play().catch(e => console.log("A reprodução automática foi bloqueada."));
        }
    }, { once: true }); 

    createBells(); 
});