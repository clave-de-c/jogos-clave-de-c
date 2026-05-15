const btnVoltar = document.getElementById('btn-voltar');
const placarContainer = document.getElementById('placar-container');
const btnOuvirRadar = document.getElementById('btn-ouvir-radar');

// ==========================================
// MEMÓRIA LOCAL (SALVAR PROGRESSO)
// ==========================================
// Puxa o progresso do aluno salvo no navegador (Se não houver, começa no 1)
let faseLiberada = parseInt(localStorage.getItem('progressoTrilhaBasica')) || 1;

// Garante que o mapa já carregue as cores certas assim que a página abre
document.addEventListener('DOMContentLoaded', () => {
    atualizarVisualMapa();
});

const notasMetodo = [
    { nome: "DÓ", corId: "#d41e1e", audioId: "som-do" },
    { nome: "RÉ", corId: "#f18c4d", audioId: "som-re" },
    { nome: "MI", corId: "#ffda43", audioId: "som-mi" },
    { nome: "FÁ", corId: "#10ad54", audioId: "som-fa" },
    { nome: "SOL", corId: "#38b6ff", audioId: "som-sol" },
    { nome: "LÁ", corId: "#004aad", audioId: "som-la" },
    { nome: "SI", corId: "#7c45e8", audioId: "som-si" }
];

// ==========================================
// NAVEGAÇÃO E MAPA (Gamificação Visual)
// ==========================================
function mudarTela(idTela) {
    tocarSom('som-clique');
    document.querySelectorAll('.game-screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');

    if(idTela === 'mapa-trilha') {
        btnVoltar.classList.add('hidden');
        placarContainer.classList.add('hidden');
        atualizarVisualMapa(); 
    } else {
        btnVoltar.classList.remove('hidden');
        if(idTela === 'area-jogo') placarContainer.classList.remove('hidden');
    }
}

function abrirInstrucoes() { mudarTela('tela-instrucoes'); }
function voltarMapa() { mudarTela('mapa-trilha'); }

function atualizarVisualMapa() {
    const botoesFase = document.querySelectorAll('.circulo-fase');
    const linhas = document.querySelectorAll('.linha-pontilhada');

    botoesFase.forEach((btn, index) => {
        let numFase = parseInt(btn.getAttribute('data-fase'));
        
        btn.classList.remove('trancada', 'ativa', 'concluida');
        
        if (numFase < faseLiberada) {
            // Fase já vencida = Verde
            btn.classList.add('concluida');
            btn.innerHTML = (numFase === 6) ? '🏆' : numFase;
        } 
        else if (numFase === faseLiberada) {
            // Fase de agora = Azul e Pulsando
            btn.classList.add('ativa');
            btn.innerHTML = (numFase === 6) ? '🏆' : numFase;
        } 
        else {
            // Fase do futuro = Cinza trancado
            btn.classList.add('trancada');
            btn.innerHTML = '🔒';
        }

        if(index > 0 && linhas[index-1]) {
            if (numFase <= faseLiberada) linhas[index-1].classList.add('ativa');
            else linhas[index-1].classList.remove('ativa');
        }
    });
}

function resetarProgresso() {
    if(confirm("Tem certeza que deseja apagar todo o progresso do aluno?")) {
        tocarSom('som-clique');
        faseLiberada = 1;
        localStorage.setItem('progressoTrilhaBasica', 1); // Zera no cachê do navegador
        atualizarVisualMapa();
        alert("O progresso foi resetado para a Fase 1.");
    }
}

function tocarSom(audioId) {
    const som = document.getElementById(audioId);
    if(som) { som.currentTime = 0; som.play().catch(()=>{}); }
}

// ==========================================
// LÓGICA DO CERTIFICADO (Fase 6)
// ==========================================
function abrirModalNome() {
    if (faseLiberada >= 6) {
        mudarTela('tela-nome-certificado');
        document.getElementById('input-nome-aluno').focus();
    }
}

function gerarCertificado() {
    const nomeDigitado = document.getElementById('input-nome-aluno').value.trim();
    if(nomeDigitado === "") {
        alert("Por favor, digite o nome para o certificado!");
        return;
    }
    
    document.getElementById('cert-svg-nome').textContent = nomeDigitado;
    const dataFormatada = new Date().toLocaleDateString('pt-BR');
    document.getElementById('cert-svg-data').textContent = "Concluído em: " + dataFormatada;
    
    tocarSom('som-acerto');
    mudarTela('tela-certificado');
}

function imprimirCertificado() {
    window.print();
}

function salvarCertificadoPNG() {
    tocarSom('som-clique');
    const svg = document.getElementById('svg-certificado');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);

    // Garante que o SVG tenha o namespace correto para a conversão
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Criamos um canvas virtual com o dobro do tamanho (1600x1130) para ficar com ALTÍSSIMA resolução!
    const canvas = document.createElement("canvas");
    canvas.width = 1600; 
    canvas.height = 1130;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    // Transforma o texto do SVG em um arquivo de imagem virtual
    const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        // Preenche o fundo do canvas de branco (senão o PNG fica transparente)
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenha o nosso certificado por cima
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // Converte o canvas para um link de download de PNG
        const imgURI = canvas.toDataURL("image/png");
        
        // Pega o nome do aluno para nomear o arquivo bonito
        const nomeDaCrianca = document.getElementById('cert-svg-nome').textContent.trim();
        let nomeDoArquivo = `Certificado_${nomeDaCrianca || 'Clave_Colorida'}.png`;
        // Tira espaços e troca por underline para não bugar no celular
        nomeDoArquivo = nomeDoArquivo.replace(/\s+/g, '_');

        // Cria o botão de download invisível e clica nele
        const a = document.createElement("a");
        a.download = nomeDoArquivo;
        a.href = imgURI;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        tocarSom('som-acerto'); // Toca o som de sucesso após baixar
    };
    
    img.src = url;
}
// ==========================================
// SELETOR DE ESTAÇÕES
// ==========================================
function iniciarEstacao(numero) {
    if (numero > faseLiberada) return; 

    const feedback = document.getElementById('feedback-txt');
    const containerAlvos = document.getElementById('container-alvos');
    const containerPecas = document.getElementById('container-pecas');

    mudarTela('area-jogo');
    document.getElementById('pontos').innerText = numero;
    
    containerAlvos.innerHTML = "";
    containerPecas.innerHTML = "";
    btnOuvirRadar.classList.add('hidden');

    if(numero === 1) {
        feedback.innerText = "Arraste e solte a cor para a sua nota!";
        acertosFase1 = 0;
        montarDragAndDropFase1();
    } 
    else if(numero === 2) {
        feedback.innerText = "Ouça o som e clique na cor correta!";
        btnOuvirRadar.classList.remove('hidden');
        acertosAtuaisFase2 = 0;
        poolFase2 = []; 
        montarRadarFase2();
    }
    else if(numero === 3) {
        montarFase3Caminho();
    }
    else if(numero === 4) {
        acertosAtuaisFase4 = 0;
        poolFase4 = [];
        montarFase4Nomes();
    }
    else if(numero === 5) {
        montarPlayAlongFase5();
    }
}

// ==========================================
// LÓGICA DA FASE 1
// ==========================================
let acertosFase1 = 0;
function montarDragAndDropFase1() {
    const containerAlvos = document.getElementById('container-alvos');
    const containerPecas = document.getElementById('container-pecas');
    notasMetodo.forEach(nota => {
        const alvo = document.createElement('div');
        alvo.classList.add('zona-alvo'); alvo.innerText = nota.nome; alvo.dataset.nota = nota.nome; alvo.dataset.ocupado = "nao";
        containerAlvos.appendChild(alvo);
    });
    let notasEmbaralhadas = [...notasMetodo].sort(() => Math.random() - 0.5);
    notasEmbaralhadas.forEach(nota => {
        const peca = document.createElement('div');
        peca.classList.add('peca-arrastavel'); peca.style.backgroundColor = nota.corId; peca.dataset.nota = nota.nome; peca.dataset.audio = nota.audioId;
        configurarEventosDeArrasto(peca); containerPecas.appendChild(peca);
    });
}
function configurarEventosDeArrasto(peca) {
    peca.addEventListener('pointerdown', e => {
        e.preventDefault(); try { peca.setPointerCapture(e.pointerId); } catch(err){}
        const rect = peca.getBoundingClientRect(); peca.style.width = rect.width + 'px'; peca.style.height = rect.height + 'px';
        peca.style.position = 'fixed'; peca.style.zIndex = '1000';
        const mover = (ev) => { peca.style.left = ev.clientX - peca.offsetWidth / 2 + 'px'; peca.style.top = ev.clientY - peca.offsetHeight / 2 + 'px'; };
        mover(e);
        const soltar = (ev) => {
            peca.removeEventListener('pointermove', mover); peca.removeEventListener('pointerup', soltar);
            try { peca.releasePointerCapture(ev.pointerId); } catch(err){}
            peca.style.display = 'none'; let alvo = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.zona-alvo'); peca.style.display = 'flex';
            if (alvo && alvo.dataset.nota === peca.dataset.nota && alvo.dataset.ocupado === "nao") {
                tocarSom(peca.dataset.audio); peca.style.position = 'static'; peca.style.width = '100%'; peca.style.height = '100%';
                peca.classList.replace('peca-arrastavel', 'peca-encaixada'); alvo.innerText = ""; alvo.style.border = "none"; alvo.dataset.ocupado = "sim"; alvo.appendChild(peca);
                alvo.classList.add('acerto-anim'); setTimeout(() => alvo.classList.remove('acerto-anim'), 500);
                acertosFase1++; if(acertosFase1 === 7) finalizarFase(1);
            } else {
                peca.style.position = 'static'; peca.style.width = ''; peca.style.height = ''; peca.classList.add('erro-anim');
                setTimeout(() => peca.classList.remove('erro-anim'), 400); tocarSom('som-clique');
            }
        };
        peca.addEventListener('pointermove', mover); peca.addEventListener('pointerup', soltar);
    });
}

// ==========================================
// LÓGICA DA FASE 2
// ==========================================
let notaAlvoFase2 = null;
let acertosAtuaisFase2 = 0;
let poolFase2 = []; 
function montarRadarFase2() {
    const containerPecas = document.getElementById('container-pecas');
    notasMetodo.forEach(nota => {
        const btn = document.createElement('button');
        btn.classList.add('circulo-nota'); btn.style.backgroundColor = nota.corId;
        btn.onclick = () => verificarEscolhaFase2(nota, btn); containerPecas.appendChild(btn);
    });
    proximaPerguntaFase2();
}
function proximaPerguntaFase2() {
    if (poolFase2.length === 0) poolFase2 = [...notasMetodo].sort(() => Math.random() - 0.5);
    notaAlvoFase2 = poolFase2.pop();
    document.getElementById('feedback-txt').innerText = "Ouça o som e clique na cor...";
    setTimeout(tocarNotaAlvoFase2, 500);
}
function tocarNotaAlvoFase2() { if(notaAlvoFase2) tocarSom(notaAlvoFase2.audioId); }
function verificarEscolhaFase2(notaClicada, elemento) {
    if (notaClicada.audioId === notaAlvoFase2.audioId) {
        tocarSom('som-acerto'); elemento.classList.add('acerto-anim');
        document.getElementById('feedback-txt').innerText = "Boa! Você acertou: " + notaClicada.nome;
        acertosAtuaisFase2++;
        setTimeout(() => {
            elemento.classList.remove('acerto-anim');
            if (acertosAtuaisFase2 >= 7) finalizarFase(2);
            else proximaPerguntaFase2();
        }, 1500);
    } else {
        tocarSom('som-clique'); elemento.classList.add('erro-anim');
        document.getElementById('feedback-txt').innerText = "Quase! Ouça novamente...";
        setTimeout(() => elemento.classList.remove('erro-anim'), 400);
    }
}

// ==========================================
// LÓGICA DA FASE 3
// ==========================================
let sequenciaFase3 = []; let cliqueAtualFase3 = 0; let rodadaFase3 = 1; 
function montarFase3Caminho() {
    document.getElementById('feedback-txt').innerText = "Preparando o caminho...";
    const containerPecas = document.getElementById('container-pecas');
    notasMetodo.forEach(nota => {
        const btn = document.createElement('button'); btn.classList.add('circulo-nota'); btn.style.backgroundColor = nota.corId;
        btn.id = 'btn-fase3-' + nota.nome; btn.innerText = nota.nome;
        btn.onclick = () => verificarCliqueFase3(nota, btn); containerPecas.appendChild(btn);
    });
    rodadaFase3 = 1; iniciarRodadaFase3();
}
function iniciarRodadaFase3() {
    cliqueAtualFase3 = 0; let qtdNotas = rodadaFase3 + 2; sequenciaFase3 = [];
    for(let i = 0; i < qtdNotas; i++) sequenciaFase3.push(notasMetodo[Math.floor(Math.random() * notasMetodo.length)]);
    reproduzirSequenciaFase3();
}
function reproduzirSequenciaFase3() {
    cliqueAtualFase3 = 0; document.getElementById('feedback-txt').innerText = `Rodada ${rodadaFase3}/3: Observe a sequência...`;
    document.querySelectorAll('.circulo-nota').forEach(btn => btn.disabled = true);
    let i = 0;
    setTimeout(() => {
        let intervalo = setInterval(() => {
            if(i >= sequenciaFase3.length) {
                clearInterval(intervalo); document.getElementById('feedback-txt').innerText = "Sua vez! Repita a sequência.";
                document.querySelectorAll('.circulo-nota').forEach(btn => btn.disabled = false); return;
            }
            let nota = sequenciaFase3[i]; tocarSom(nota.audioId);
            let btn = document.getElementById('btn-fase3-' + nota.nome);
            btn.classList.add('acerto-anim'); setTimeout(() => btn.classList.remove('acerto-anim'), 400); i++;
        }, 900); 
    }, 1000);
}
function verificarCliqueFase3(notaClicada, btn) {
    if(notaClicada.nome === sequenciaFase3[cliqueAtualFase3].nome) {
        tocarSom(notaClicada.audioId); btn.classList.add('acerto-anim'); setTimeout(() => btn.classList.remove('acerto-anim'), 300); cliqueAtualFase3++;
        if(cliqueAtualFase3 === sequenciaFase3.length) {
            document.querySelectorAll('.circulo-nota').forEach(b => b.disabled = true);
            if(rodadaFase3 === 3) setTimeout(() => finalizarFase(3), 1000); 
            else { document.getElementById('feedback-txt').innerText = "Excelente! Preparando próxima rodada..."; rodadaFase3++; setTimeout(iniciarRodadaFase3, 1500); }
        }
    } else {
        tocarSom('som-clique'); btn.classList.add('erro-anim'); setTimeout(() => btn.classList.remove('erro-anim'), 400);
        document.getElementById('feedback-txt').innerText = "Ops! Vamos tentar de novo...";
        document.querySelectorAll('.circulo-nota').forEach(b => b.disabled = true); setTimeout(reproduzirSequenciaFase3, 1500); 
    }
}

// ==========================================
// LÓGICA DA FASE 4
// ==========================================
let notaAlvoFase4 = null; let acertosAtuaisFase4 = 0; let poolFase4 = []; 
const frasesEmpolgantes = ["UAU! É O ", "ISSO AÍ! ", "PERFEITO! É O ", "MUITO BEM! ", "EXATAMENTE! "];
function montarFase4Nomes() {
    const containerPecas = document.getElementById('container-pecas');
    notasMetodo.forEach(nota => {
        const btn = document.createElement('button'); btn.classList.add('circulo-nota'); btn.style.backgroundColor = nota.corId;
        btn.onclick = () => verificarEscolhaFase4(nota, btn); containerPecas.appendChild(btn);
    });
    proximaPerguntaFase4();
}
function proximaPerguntaFase4() {
    if (poolFase4.length === 0) poolFase4 = [...notasMetodo].sort(() => Math.random() - 0.5);
    notaAlvoFase4 = poolFase4.pop();
    document.getElementById('feedback-txt').innerHTML = `Qual é a cor da nota <br><span style="font-size: 2.8rem; color: #333; display: block; margin-top: 10px;">${notaAlvoFase4.nome}?</span>`;
}
function verificarEscolhaFase4(notaClicada, elemento) {
    const feedbackTxt = document.getElementById('feedback-txt');
    if (notaClicada.nome === notaAlvoFase4.nome) {
        tocarSom(notaClicada.audioId); elemento.classList.add('super-acerto');
        let frase = frasesEmpolgantes[Math.floor(Math.random() * frasesEmpolgantes.length)];
        feedbackTxt.innerHTML = `<span style="font-size: 2.5rem; color: #27ae60; display: block; margin-top: 10px;">${frase} ${notaAlvoFase4.nome}!</span>`;
        acertosAtuaisFase4++; document.querySelectorAll('.circulo-nota').forEach(b => b.disabled = true);
        setTimeout(() => {
            elemento.classList.remove('super-acerto'); document.querySelectorAll('.circulo-nota').forEach(b => b.disabled = false);
            if (acertosAtuaisFase4 >= 7) finalizarFase(4); else proximaPerguntaFase4();
        }, 1500); 
    } else {
        tocarSom('som-clique'); elemento.classList.add('erro-anim'); setTimeout(() => elemento.classList.remove('erro-anim'), 400);
    }
}

// ==========================================
// LÓGICA DA FASE 5: O GRANDE CONCERTO (HARD MODE)
// ==========================================
let musicaFase5 = []; let notaAtualNaPista = null;
function montarPlayAlongFase5() {
    document.getElementById('feedback-txt').innerText = "Leia a nota na pista e toque na cor certa!";
    const containerAlvos = document.getElementById('container-alvos');
    const containerPecas = document.getElementById('container-pecas');
    containerAlvos.innerHTML = `
        <div class="pista-playalong">
            <div class="alvo-pista" id="alvo-pista"></div>
            <div class="nota-deslizante" id="nota-deslizante"></div>
        </div>
    `;
    notasMetodo.forEach(nota => {
        const btn = document.createElement('button'); 
        btn.classList.add('circulo-nota'); 
        btn.style.backgroundColor = nota.corId; 
        
        // NOVIDADE DA FASE 5: OS BOTÕES SÃO APENAS CORES, SEM TEXTO!
        // btn.innerText = nota.nome; <- Comentado para forçar a memorização da cor
        
        btn.onclick = () => verificarBatidaPlayAlong(nota, btn); containerPecas.appendChild(btn);
    });
    musicaFase5 = [notasMetodo[0], notasMetodo[1], notasMetodo[2], notasMetodo[3], notasMetodo[4], notasMetodo[3], notasMetodo[2], notasMetodo[1], notasMetodo[0]];
    setTimeout(lancarProximaNotaFase5, 1000);
}

function lancarProximaNotaFase5() {
    if(musicaFase5.length === 0) { finalizarFase(5); return; }
    notaAtualNaPista = musicaFase5.shift(); 
    
    const divNota = document.getElementById('nota-deslizante');
    divNota.innerText = notaAtualNaPista.nome; 
    divNota.style.backgroundColor = '#7f8c8d'; 
    
    divNota.classList.remove('na-posicao'); void divNota.offsetWidth; divNota.classList.add('na-posicao');
}

function verificarBatidaPlayAlong(notaClicada, btnClicado) {
    if(!notaAtualNaPista) return;
    const alvoPista = document.getElementById('alvo-pista'); const divNota = document.getElementById('nota-deslizante');
    if(notaClicada.nome === notaAtualNaPista.nome) {
        tocarSom(notaClicada.audioId); btnClicado.classList.add('acerto-anim'); alvoPista.style.borderColor = "#27ae60"; 
        divNota.style.opacity = '0'; notaAtualNaPista = null; 
        setTimeout(() => {
            btnClicado.classList.remove('acerto-anim'); alvoPista.style.borderColor = "#bdc3c7"; divNota.style.opacity = '1'; lancarProximaNotaFase5(); 
        }, 500);
    } else {
        tocarSom('som-clique'); btnClicado.classList.add('erro-anim'); setTimeout(() => btnClicado.classList.remove('erro-anim'), 400);
    }
}

// ==========================================
// FINALIZAÇÃO DE FASE E SALVAR PROGRESSO
// ==========================================
function finalizarFase(numero) {
    // Toca o som épico se for a última fase do jogo, senão toca o acerto normal
    if (numero === 5) {
        tocarSom('som-vitoria');
    } else {
        tocarSom('som-acerto');
    }

    if(faseLiberada === numero) {
        faseLiberada = numero + 1; 
        // SALVA NA MEMÓRIA DO NAVEGADOR
        localStorage.setItem('progressoTrilhaBasica', faseLiberada);
    }
    mudarTela('tela-vitoria');
}