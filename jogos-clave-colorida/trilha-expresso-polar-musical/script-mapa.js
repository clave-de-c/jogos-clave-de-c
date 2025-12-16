const levels = {
    1: "fase1.html",
    2: "fase2.html",
    3: "fase3.html",
    4: "fase4.html",
    5: "certificado.html"
};

// Pega o progresso salvo. Se não tiver, começa no 1.
let currentProgress = parseInt(localStorage.getItem('clavePolarProgress')) || 1;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Nível Atual Salvo:", currentProgress); // Para Debug
    updateMap();
});

function updateMap() {
    for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`level-${i}`);
        if(!node) continue;
        
        const btn = node.querySelector('.btn-start');
        const statusIcon = node.querySelector('.status-icon');
        const iconCircle = node.querySelector('.node-icon');

        // Limpa todas as classes de estado antes de aplicar a nova
        node.classList.remove('locked', 'unlocked', 'completed', 'final-unlocked');

        // LÓGICA DE ESTADOS
        if (i < currentProgress) {
            // Níveis que já passaram (1, 2, 3, 4)
            node.classList.add('completed');
            btn.innerText = "Jogar Novamente";
            statusIcon.innerText = "✅";
            if(iconCircle) iconCircle.innerText = "✓";
            
        } else if (i === currentProgress) {
            // Nível Atual (Onde o jogador parou)
            
            if (i === 5) {
                // CASO ESPECIAL: O CERTIFICADO (Nível 5)
                node.classList.add('unlocked', 'final-unlocked'); // Adiciona classe de brilho dourado
                btn.innerText = "PEGAR CERTIFICADO 🏆";
                statusIcon.innerText = "🔓";
            } else {
                // Níveis Normais (1, 2, 3, 4)
                node.classList.add('unlocked');
                btn.innerText = "JOGAR";
                statusIcon.innerText = ""; // Sem ícone extra
            }
            
        } else {
            // Níveis Futuros (Trancados)
            node.classList.add('locked');
            btn.innerText = "Bloqueado";
            statusIcon.innerText = "🔒";
        }
    }
}

function goToLevel(levelNumber) {
    const url = levels[levelNumber];
    
    // Permite entrar se o nível for menor ou igual ao progresso atual
    if (url && levelNumber <= currentProgress) {
        window.location.href = url;
    } else {
        alert("Complete a fase anterior para desbloquear!");
    }
}

function resetProgress() {
    if(confirm("Tem certeza que quer reiniciar toda a trilha?")) {
        localStorage.setItem('clavePolarProgress', 1);
        location.reload();
    }
}