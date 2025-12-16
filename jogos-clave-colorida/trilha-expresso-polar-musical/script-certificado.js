document.addEventListener('DOMContentLoaded', () => {
    // Verifica se realmente completou o nível 4 (Segurança básica)
    // Se quiser testar sem jogar, comente as 3 linhas abaixo
    /* const progress = parseInt(localStorage.getItem('clavePolarProgress')) || 1;
    if (progress < 5) {
        alert("Você precisa completar a trilha primeiro!");
        window.location.href = "mapa.html";
    }
    */

    // Coloca a data de hoje automaticamente
    const dataEl = document.getElementById('data-atual');
    const hoje = new Date();
    dataEl.innerText = `Data: ${hoje.toLocaleDateString('pt-BR')}`;
});

function gerarCertificado() {
    const inputNome = document.getElementById('player-name').value.trim();
    
    if (inputNome === "") {
        alert("Por favor, digite seu nome!");
        return;
    }

    // Preenche o certificado
    document.getElementById('nome-final').innerText = inputNome;

    // Troca as telas
    document.getElementById('input-container').classList.add('hidden');
    document.getElementById('certificado-container').classList.remove('hidden');
}