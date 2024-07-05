document.addEventListener("DOMContentLoaded", function() {
    let currentRow = 1;
    let currentInput = 1;
    let palavras = [];
    let posicao;
    let todasCorretas = true;
    let letrasUsadas = [];

    const regrasOverlay = document.getElementById("regras");
    const botaoRegras = document.getElementById("btn-rules");
    const vitoriaOverlay = document.getElementById("vitoria");
    const derrotaOverlay = document.getElementById("derrota");
    const palavraNaoEncontradaOverlay = document.getElementById("palavraNaoEncontrada");
    const palavraIncompletaOverlay = document.getElementById("palavraIncompleta");

    regrasOverlay.classList.add("show");

    regrasOverlay.addEventListener("click", function() {
        regrasOverlay.classList.remove("show");
    });

    botaoRegras.addEventListener("click", function() {
        regrasOverlay.classList.add("show");
    });

    function mostrarTelaVitoria() {
        vitoriaOverlay.classList.add("show");
        vitoriaOverlay.addEventListener("click", function() {
            vitoriaOverlay.classList.remove("show");
        });
    }

    function mostrarTelaDerrota() {
        derrotaOverlay.classList.add("show");
        derrotaOverlay.addEventListener("click", function() {
            derrotaOverlay.classList.remove("show");
        });
    }

    function mostrarPalavraNaoEncontrada() {
        palavraNaoEncontradaOverlay.classList.add("show");
        palavraNaoEncontradaOverlay.addEventListener("click", function() {
            palavraNaoEncontradaOverlay.classList.remove("show");
        });
    }

    function mostrarPalavraIncompleta() {
        palavraIncompletaOverlay.classList.add("show");
        palavraIncompletaOverlay.addEventListener("click", function() {
            palavraIncompletaOverlay.classList.remove("show");
        });
    }

    function loadFileAsArray(filePath) {
        return fetch(filePath)
            .then(response => response.text())
            .then(text => text.split('\n').map(word => word.trim()).filter(word => word.length > 0))
            .catch(error => {
                console.error('Erro ao carregar o arquivo:', error);
                return [];
            });
    }

    function init() {
        loadFileAsArray('biblioteca/palavras.txt').then(wordsArray => {
            palavras = wordsArray;
            getRandomWord();
            setupEventListeners();
        });
    }

    function setupEventListeners() {
        const letras = document.querySelectorAll(".footer-teclado");
        letras.forEach(letra => letra.addEventListener("click", handleLetterButtonClick));

        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if (key === 'Enter') {
                verificarPalavra();
            } else if (key.length === 1 && /[a-zA-Z]/.test(key)) {
                insertLetter(key);
            } else if (key === 'Backspace') {
                btnBackspace();
            }
        });

        document.addEventListener('focus', (event) => {
            const focusedElement = document.activeElement;
            const numberMatch = focusedElement.id.match(/input-(\d+)/);
            if (numberMatch) {
                currentInput = parseInt(numberMatch[1], 10);
                console.log(currentInput);
            }
        }, true);

        const backspace = document.querySelector(".div-backspace-button");
        if (backspace) backspace.addEventListener("click", btnBackspace);

        const enterButton = document.getElementById('enter');
        if (enterButton) enterButton.addEventListener('click', verificarPalavra);

        const restartButton = document.getElementById('btn-restart');
        if (restartButton) restartButton.addEventListener('click', resetarPagina);
    }

    function getRandomWord() {
        posicao = getRandomNumber(palavras.length);
        console.log(palavras[posicao]);
    }

    function getRandomNumber(size) {
        return Math.floor(Math.random() * size);
    }

    function insertLetter(letter) {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        
        if (currentInput <= rowInputs.length) {
            rowInputs[currentInput - 1].value = letter;
            rowInputs[currentInput - 1].focus();
            currentInput = (currentInput % rowInputs.length) + 1;
        }
    }

    function handleLetterButtonClick(event) {
        insertLetter(event.target.textContent);
    }

    function btnBackspace() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        currentInput = Math.max(currentInput - 1, 1);

        for (let i = rowInputs.length - 1; i >= 0; i--) {
            if (rowInputs[i].value !== "") {
                rowInputs[i].value = "";
                currentInput = i + 1;
                break;
            }
        }
        rowInputs[currentInput - 1].focus();
    }

    function removeAcentos(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function alterarCoresInputs(resultado) {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
    
        rowInputs.forEach((input, index) => {
            const status = resultado[index];
            input.style.backgroundColor = {
                "Correto": "#6AA84F",
                "Incorreto": "#FFD966",
                "Não está na palavra": "#434343"
            }[status] || "";
            if (status !== "Correto") todasCorretas = false;
        });

        if (todasCorretas) {
            rowInputs.forEach(input => input.style.backgroundColor = "#6AA84F");
        }
    }

    function ativarProximaLinha() {
        currentRow++;
        const nextInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        nextInputs.forEach(input => input.disabled = false);
        currentInput = 1;
        document.getElementById(`main-input-${currentInput}`)?.focus();
    }

    function verificarPalavra() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        let palavraDigitada = Array.from(rowInputs).map(input => input.value).join('');

        if (palavraDigitada.length !== 5) {
            mostrarPalavraIncompleta();
            return;
        }
    
        const palavraSorteada = palavras[posicao];
    
        const palavraDigitadaSemAcentos = removeAcentos(palavraDigitada.toLowerCase());
        const palavrasSemAcentos = palavras.map(palavra => removeAcentos(palavra.toLowerCase()));
    
        if (!palavrasSemAcentos.includes(palavraDigitadaSemAcentos)) {
            mostrarPalavraNaoEncontrada();
            return;
        }

        if (removeAcentos(palavraDigitada.toLowerCase()) === removeAcentos(palavraSorteada.toLowerCase())) {
            console.log("Palavra correta!");
            rowInputs.forEach(input => input.style.backgroundColor = "#6AA84F");
            adicionarLetrasUsadas(palavraDigitada);
            atualizarCoresTeclas(palavraDigitada, Array(5).fill("Correto"), palavraSorteada);
            mostrarTelaVitoria();
            return;
        } else {
            if (currentRow === 6) {
                mostrarTelaDerrota(palavraSorteada);
            }
        }
    
        const resultado = verificarResultado(palavraDigitada, palavraSorteada);
        alterarCoresInputs(resultado);
        adicionarLetrasUsadas(palavraDigitada);
        atualizarCoresTeclas(palavraDigitada, resultado, palavraSorteada);
        ativarProximaLinha();
    }

    function verificarResultado(palavraDigitada, palavraSorteada) {
        const resultado = Array(palavraDigitada.length).fill(null);
        const letraContagem = {};

        for (let letra of palavraSorteada) {
            letraContagem[letra] = (letraContagem[letra] || 0) + 1;
        }

        for (let i = 0; i < palavraDigitada.length; i++) {
            if (palavraDigitada[i] === palavraSorteada[i]) {
                resultado[i] = "Correto";
                letraContagem[palavraDigitada[i]]--;
            }
        }

        for (let i = 0; i < palavraDigitada.length; i++) {
            if (resultado[i] === null) {
                if (letraContagem[palavraDigitada[i]] > 0) {
                    resultado[i] = "Incorreto";
                    letraContagem[palavraDigitada[i]]--;
                } else {
                    resultado[i] = "Não está na palavra";
                }
            }
        }

        return resultado;
    }

    function adicionarLetrasUsadas(palavra) {
        for (let letra of palavra) {
            if (!letrasUsadas.includes(letra.toUpperCase()) && !letrasUsadas.includes(letra.toLowerCase())) {
                letrasUsadas.push(letra);
            }
        }
    }

    function atualizarCoresTeclas(palavraDigitada, resultado, palavraSorteada) {
        const teclas = document.querySelectorAll(".footer-teclado");
        const letrasCorretas = new Set();
    
        for (let i = 0; i < palavraDigitada.length; i++) {
            const letraDigitada = palavraDigitada[i];
            const status = resultado[i];
    
            teclas.forEach(tecla => {
                const teclaTexto = tecla.textContent.toLowerCase();
                if (!letrasCorretas.has(teclaTexto) && teclaTexto === letraDigitada.toLowerCase()) {
                    if (status === "Correto") {
                        tecla.classList.remove('incorreto', 'nao-na-palavra');
                        tecla.classList.add('correto');
                        letrasCorretas.add(teclaTexto);
                    } else if (status === "Incorreto" && !tecla.classList.contains('correto')) {
                        tecla.classList.remove('nao-na-palavra');
                        tecla.classList.add('incorreto');
                    } else if (status === "Não está na palavra" && !tecla.classList.contains('correto')) {
                        tecla.classList.remove('incorreto');
                        tecla.classList.add('nao-na-palavra');
                    }
                }
            });
        }
    
        palavraSorteada.split('').forEach(letra => {
            const ocorrenciasDigitadas = palavraDigitada.split(letra).length - 1;
            const ocorrenciasSorteadas = palavraSorteada.split(letra).length - 1;
    
            if (ocorrenciasDigitadas > ocorrenciasSorteadas) {
                teclas.forEach(tecla => {
                    if (tecla.textContent.toLowerCase() === letra.toLowerCase() &&
                        !letrasCorretas.has(tecla.textContent.toLowerCase()) &&
                        !tecla.classList.contains('correto')) {
                        tecla.classList.remove('nao-na-palavra');
                        tecla.classList.add('incorreto');
                    }
                });
            }
        });
    }

    function mostrarTelaVitoria() {
        vitoriaOverlay.classList.add("show");
        vitoriaOverlay.addEventListener("click", function() {
            vitoriaOverlay.classList.remove("show");
        });
    }

    function mostrarTelaDerrota(palavraCorreta) {
        const derrotaOverlayContent = document.querySelector(".derrota-overlay-content");
        derrotaOverlayContent.innerHTML = `A palavra correta era: ${palavraCorreta}`;
        derrotaOverlay.classList.add("show");
    
        derrotaOverlay.addEventListener("click", function() {
            derrotaOverlay.classList.remove("show");
        });
    }

    function mostrarPalavraNaoEncontrada() {
        palavraNaoEncontradaOverlay.classList.add("show");
        setTimeout(() => {
            palavraNaoEncontradaOverlay.classList.remove("show");
        }, 1500);
    }
    
    function mostrarPalavraIncompleta() {
        palavraIncompletaOverlay.classList.add("show");
        setTimeout(() => {
            palavraIncompletaOverlay.classList.remove("show");
        }, 1500);
    }

    function resetarPagina() {
        currentRow = 1;
        currentInput = 1;
        todasCorretas = true;
        letrasUsadas = [];

        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.value = '';
            input.style.backgroundColor = '';
            input.disabled = true;
        });

        const firstRowInputs = document.querySelectorAll('#row-1 .main-input');
        firstRowInputs.forEach(input => input.disabled = false);
        firstRowInputs[0].focus();

        const teclas = document.querySelectorAll(".footer-teclado");
        teclas.forEach(tecla => {
            tecla.classList.remove('correto', 'incorreto', 'nao-na-palavra');
        });

        getRandomWord();
    }

    init();
});