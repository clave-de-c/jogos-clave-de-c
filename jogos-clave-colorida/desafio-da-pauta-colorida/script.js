const audios = {
    'click': new Audio('click.mp3'),
    'vitoria': new Audio('sucesso-fim.mp3'),
    'DÓ': new Audio('c3.mp3'), 
    'RÉ': new Audio('d3.mp3'), 
    'MÍ': new Audio('e3.mp3'),
    'FÁ': new Audio('f3.mp3'), 
    'SOL': new Audio('g3.mp3'), 
    'LÁ': new Audio('a3.mp3'),
    'SI': new Audio('b3.mp3'), 
    'DÓ↑': new Audio('c4.mp3'), 
    'RÉ↑': new Audio('d4.mp3'), 
    'MÍ↑': new Audio('e4.mp3'),
    'FÁ↑': new Audio('f4.mp3') 
};

const notasInfo = {
    'DÓ':  { cor: '#d41e1e', target: 'DO' },
    'RÉ':  { cor: '#f18c4d', target: 'RE' },
    'MÍ':  { cor: '#ffda43', target: 'MI' },
    'FÁ':  { cor: '#10ad54', target: 'FA' },
    'SOL': { cor: '#38b6ff', target: 'SOL' },
    'LÁ':  { cor: '#004aad', target: 'LA' },
    'SI':  { cor: '#7c45e8', target: 'SI' },
    'DÓ↑': { cor: '#d41e1e', target: 'DO_ALTO' },
    'RÉ↑': { cor: '#f18c4d', target: 'RE_ALTO' },
    'MÍ↑': { cor: '#ffda43', target: 'MI_ALTO' },
    'FÁ↑': { cor: '#10ad54', target: 'FA_ALTO' }
};

const posicoesX = {
    'DÓ': '10%', 'RÉ': '18%', 'MÍ': '26%', 'FÁ': '34%',
    'SOL': '42%', 'LÁ': '50%', 'SI': '58%', 'DÓ↑': '66%',
    'RÉ↑': '74%', 'MÍ↑': '82%', 'FÁ↑': '90%'
};

const niveisConfig = {
    1: ['MÍ', 'SOL', 'SI', 'RÉ↑', 'FÁ↑'], 
    2: ['FÁ', 'LÁ', 'DÓ↑', 'MÍ↑'],        
    3: ['DÓ', 'RÉ', 'MÍ', 'FÁ', 'SOL', 'LÁ', 'SI', 'DÓ↑'] 
};

let notasDisponiveis = [];
let notaAtual = '';
let acertos = 0;
let nivelAtual = 3;

document.addEventListener('click', function(e) {
    if(e.target.classList.contains('btn-main') || e.target.classList.contains('btn-mini')) {
        audios['click'].currentTime = 0;
        audios['click'].play().catch(e => e);
    }
});

function iniciarJogo(nivel) {
    nivelAtual = nivel;
    document.getElementById('menu-inicial').classList.remove('active');
    document.getElementById('area-jogo').classList.add('active');
    document.getElementById('top-controls').classList.remove('hidden');
    
    notasDisponiveis = [...niveisConfig[nivelAtual]].sort(() => Math.random() - 0.5);
    
    document.getElementById('total-notas').innerText = niveisConfig[nivelAtual].length;
    acertos = 0;
    document.getElementById('pontos').innerText = acertos;
    
    document.querySelectorAll('.nota-circular').forEach(nota => {
        if(nota.parentElement.id !== 'pool-notas') nota.remove();
    });

    proximaNota();
}

function proximaNota() {
    if (notasDisponiveis.length === 0) return;
    
    notaAtual = notasDisponiveis.pop();
    const isAgudo = notaAtual.includes('↑');
    const nomeVisual = notaAtual.replace('↑', ''); 
    
    const pool = document.getElementById('pool-notas');
    pool.innerHTML = `<div class="nota-circular ${isAgudo ? 'seta-agudo' : ''}" draggable="true" 
        style="background-color: ${notasInfo[notaAtual].cor}" 
        id="drag-nota" ondragstart="drag(event)">${nomeVisual}</div>`;
        
    document.getElementById('feedback-txt').innerText = `Coloque o ${notaAtual.replace('↑', ' Agudo')} na pauta!`;
    document.getElementById('feedback-txt').className = 'msg-neutra';
}

function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

document.querySelectorAll('.linha-drop, .espaco').forEach(zona => {
    zona.ondragover = (ev) => ev.preventDefault();
    zona.ondrop = (ev) => {
        ev.preventDefault();
        const alvo = ev.currentTarget.getAttribute('data-nota');
        if(alvo === notasInfo[notaAtual].target) {
            sucesso(ev.currentTarget);
        } else {
            document.getElementById('feedback-txt').innerText = "Ops! Linha ou espaço incorreto.";
            document.getElementById('feedback-txt').className = 'msg-erro';
        }
    };
});

function sucesso(zonaAlvo) {
    acertos++;
    document.getElementById('pontos').innerText = acertos;
    
    audios[notaAtual].currentTime = 0;
    audios[notaAtual].play().catch(e => e);

    const notaElement = document.getElementById('drag-nota');
    notaElement.setAttribute('draggable', 'false'); 
    notaElement.removeAttribute('id'); 
    notaElement.setAttribute('data-nome', notaAtual);
    
    notaElement.style.position = 'absolute';
    notaElement.style.left = posicoesX[notaAtual]; 
    notaElement.style.top = '50%';                 
    notaElement.style.transform = 'translate(-50%, -50%)'; 
    zonaAlvo.appendChild(notaElement); 
    
    const total = niveisConfig[nivelAtual].length;
    if (acertos >= total) {
        document.getElementById('feedback-txt').innerText = "Perfeito! Ouça as notas!";
        document.getElementById('feedback-txt').className = 'msg-sucesso';
        setTimeout(tocarEscadaFinal, 1000);
    } else {
        setTimeout(proximaNota, 800);
    }
}

function tocarEscadaFinal() {
    const escalaParaTocar = niveisConfig[nivelAtual];
    let delay = 0;
    
    escalaParaTocar.forEach((nota, index) => {
        setTimeout(() => {
            const el = document.querySelector(`.nota-circular[data-nome="${nota}"]`);
            if (el) {
                audios[nota].currentTime = 0;
                audios[nota].play().catch(e => e);
                el.classList.add('anim-pulo');
                setTimeout(() => el.classList.remove('anim-pulo'), 400);
            }
            if (index === escalaParaTocar.length - 1) setTimeout(finalizarJogo, 1200);
        }, delay);
        delay += 550;
    });
}

function finalizarJogo() {
    document.getElementById('area-jogo').classList.remove('active');
    document.getElementById('tela-vitoria').classList.add('active');
    audios['vitoria'].play().catch(e => e);
}

function abrirInstrucoes() {
    document.getElementById('menu-inicial').classList.remove('active');
    document.getElementById('tela-instrucoes').classList.add('active');
}

function voltarMenu() { location.reload(); }