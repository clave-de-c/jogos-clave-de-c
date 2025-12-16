// Dados das Notas
const notes = [
    {id: 'Do', label: 'Dó', cls: 'c-Do'}, 
    {id: 'Re', label: 'Ré', cls: 'c-Re'},
    {id: 'Mi', label: 'Mi', cls: 'c-Mi'}, 
    {id: 'Fa', label: 'Fá', cls: 'c-Fa'},
    {id: 'Sol', label: 'Sol', cls: 'c-Sol'}, 
    {id: 'La', label: 'Lá', cls: 'c-La'},
    {id: 'Si', label: 'Si', cls: 'c-Si'}
];

let draggedItem = null;
let touchItem = null; // Variável para controlar toque no celular

// Inicialização
window.onload = () => {
    createSnow();
    initGame();
};

function initGame() {
    const pool = document.getElementById('pool');
    
    // Embaralhar notas
    const shuffled = [...notes].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(n => {
        const plank = document.createElement('div');
        plank.className = `plank ${n.cls}`;
        plank.textContent = n.label;
        plank.draggable = true;
        plank.dataset.note = n.id;
        
        // Eventos Mouse (Computador)
        plank.addEventListener('dragstart', dragStart);
        plank.addEventListener('dragend', dragEnd);
        
        // Eventos Touch (Celular/Tablet)
        plank.addEventListener('touchstart', touchStart, {passive: false});
        plank.addEventListener('touchmove', touchMove, {passive: false});
        plank.addEventListener('touchend', touchEnd);

        pool.appendChild(plank);
    });

    // Tenta iniciar áudio na primeira interação do usuário
    document.body.addEventListener('click', () => {
        const bg = document.getElementById('bg-music');
        if(bg.paused) { 
            bg.volume = 0.2; 
            bg.play().catch(e => console.log("Áudio bloqueado pelo navegador")); 
        }
    }, {once:true});
}

// --- CONTROLE DE SOM ---
function toggleSound() {
    const bg = document.getElementById('bg-music');
    const btn = document.getElementById('btn-sound');
    if(bg.paused) {
        bg.play();
        btn.innerText = "🔊";
    } else {
        bg.pause();
        btn.innerText = "🔇";
    }
}

function playSound(id) {
    const audio = document.getElementById(id);
    if(audio) { 
        audio.currentTime = 0; 
        audio.play().catch(e=>{}); 
    }
}

// --- DRAG & DROP (COMPUTADOR) ---
function dragStart() { 
    draggedItem = this; 
    setTimeout(() => this.style.opacity = '0.5', 0); 
}

function dragEnd() { 
    this.style.opacity = '1'; 
    draggedItem = null; 
}

const slots = document.querySelectorAll('.slot, .plank-pool');
slots.forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', function() {
        if(draggedItem) {
            movePlank(draggedItem, this);
        }
    });
});

// --- DRAG & DROP (CELULAR - Touch) ---
function touchStart(e) {
    e.preventDefault(); // Impede a rolagem da tela ao arrastar a peça
    touchItem = this;
    touchItem.style.position = 'absolute';
    touchItem.style.zIndex = 1000;
    touchItem.style.opacity = '0.8';
}

function touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    // Move a peça para onde o dedo está
    touchItem.style.left = (touch.clientX - 30) + 'px'; // Ajuste fino para o dedo não cobrir tudo
    touchItem.style.top = (touch.clientY - 50) + 'px';
}

function touchEnd(e) {
    const touch = e.changedTouches[0];
    touchItem.style.position = 'static'; // Volta ao layout normal
    touchItem.style.opacity = '1';
    
    // Truque: Esconde a peça rapidinho para ver qual elemento está EMBAIXO dela
    touchItem.hidden = true; 
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchItem.hidden = false;

    // Se soltou em cima de um slot ou da piscina de peças
    const slot = elemBelow ? elemBelow.closest('.slot, .plank-pool') : null;
    
    if(slot) {
        movePlank(touchItem, slot);
    }
    
    touchItem = null;
}

// --- LÓGICA DE MOVIMENTO ---
function movePlank(item, destination) {
    // Se o destino for um Slot e já tiver uma peça, joga a peça antiga de volta pra piscina
    if(destination.classList.contains('slot') && destination.children.length > 1) { 
        // > 1 porque o slot tem o <span class="number">
        const existingPlank = destination.querySelector('.plank');
        if (existingPlank) {
            document.getElementById('pool').appendChild(existingPlank);
        }
    }
    
    destination.appendChild(item);
    playSound('snd-click');
}

// --- VERIFICAÇÃO DE VITÓRIA ---
window.checkOrder = function() {
    const slots = document.querySelectorAll('.slot');
    let correct = 0;
    let filled = 0;

    slots.forEach(slot => {
        const plank = slot.querySelector('.plank');
        if(plank) {
            filled++;
            if(plank.dataset.note === slot.dataset.target) {
                correct++;
            }
        }
    });

    if(filled < 7) {
        alert("O trilho está incompleto! Coloque todas as peças antes de consertar.");
        return;
    }

    if(correct === 7) {
        document.getElementById('bg-music').pause();
        playSound('snd-win');
        document.getElementById('win-modal').style.display = 'flex';
        
        // Salva progresso (opcional)
        localStorage.setItem('fase2_concluida', 'true');
    } else {
        alert(`Ops! Apenas ${correct} peças estão no lugar certo. Lembre da escala: Dó, Ré, Mi...`);
    }
}

// --- EFEITO DE NEVE ---
function createSnow() {
    const container = document.getElementById('snow-container');
    for(let i=0; i<30; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.width = flake.style.height = (Math.random() * 5 + 2) + 'px';
        flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        flake.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(flake);
    }
}