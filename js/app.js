document.addEventListener("DOMContentLoaded", () => {
    let currentRow = 1;
    let currentInput = 1;
    let palavras = [];
    let posicao;
    let todasCorretas = true;
    let letrasUsadas = [];

    const COLORS = {
        CORRECT: "#6AA84F",
        INCORRECT: "#FFD966",
        NOT_IN_WORD: "#434343"
    };

    const regrasOverlay = document.getElementById("regras");
    const botaoRegras = document.getElementById("btn-rules");
    const vitoriaOverlay = document.getElementById("vitoria");
    const derrotaOverlay = document.getElementById("derrota");
    const palavraNaoEncontradaOverlay = document.getElementById("palavraNaoEncontrada");
    const palavraIncompletaOverlay = document.getElementById("palavraIncompleta");

    const overlays = {
        regrasOverlay,
        vitoriaOverlay,
        derrotaOverlay,
        palavraNaoEncontradaOverlay,
        palavraIncompletaOverlay
    };

    regrasOverlay.classList.add("show");

    Object.values(overlays).forEach(overlay => {
        overlay.addEventListener("click", () => overlay.classList.remove("show"));
    });

    botaoRegras.addEventListener("click", () => regrasOverlay.classList.add("show"));

    const showOverlay = (overlay) => {
        overlay.classList.add("show");
        setTimeout(() => overlay.classList.remove("show"), 1500);
    };

    const loadFileAsArray = async (filePath) => {
        try {
            const response = await fetch(filePath);
            const text = await response.text();
            return text.split('\n').map(word => word.trim()).filter(Boolean);
        } catch (error) {
            console.error('Erro ao carregar o arquivo:', error);
            return [];
        }
    };

    const init = async () => {
        palavras = await loadFileAsArray('biblioteca/palavras.txt');
        getRandomWord();
        setupEventListeners();
    };

    const setupEventListeners = () => {
        const letras = document.querySelectorAll(".footer-teclado");
        letras.forEach(letra => letra.addEventListener("click", handleLetterButtonClick));

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('focus', handleFocus, true);

        const backspace = document.querySelector(".div-backspace-button");
        if (backspace) backspace.addEventListener("click", btnBackspace);

        const enterButton = document.getElementById('enter');
        if (enterButton) enterButton.addEventListener('click', verificarPalavra);

        const restartButton = document.getElementById('btn-restart');
        if (restartButton) restartButton.addEventListener('click', resetarPagina);
    };

    const handleKeyDown = (event) => {
        const key = event.key;
        if (key === 'Enter') {
            verificarPalavra();
        } else if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            insertLetter(key);
        } else if (key === 'Backspace') {
            btnBackspace();
        }
    };

    const handleFocus = (event) => {
        const focusedElement = document.activeElement;
        const numberMatch = focusedElement.id.match(/input-(\d+)/);
        if (numberMatch) {
            currentInput = parseInt(numberMatch[1], 10);
        }
    };

    const getRandomWord = () => {
        posicao = getRandomNumber(palavras.length);
        console.log(palavras[posicao]);
    };

    const getRandomNumber = (size) => Math.floor(Math.random() * size);

    const insertLetter = (letter) => {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);

        if (currentInput <= rowInputs.length) {
            rowInputs[currentInput - 1].value = letter;
            rowInputs[currentInput - 1].focus();
            currentInput = (currentInput % rowInputs.length) + 1;
        }
    };

    const handleLetterButtonClick = (event) => {
        insertLetter(event.target.textContent);
    };

    const btnBackspace = () => {
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
    };

    const removeAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const alterarCoresInputs = (resultado) => {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);

        rowInputs.forEach((input, index) => {
            const status = resultado[index];
            input.style.backgroundColor = {
                "Correto": COLORS.CORRECT,
                "Incorreto": COLORS.INCORRECT,
                "Não está na palavra": COLORS.NOT_IN_WORD
            }[status] || "";
            if (status !== "Correto") todasCorretas = false;
        });
    };

    const ativarProximaLinha = () => {
        const currentInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        currentInputs.forEach(input => input.disabled = true);
        currentRow++;
        const nextInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        nextInputs.forEach(input => input.disabled = false);
        currentInput = 1;
        document.getElementById(`main-input-${currentInput}`)?.focus();
    };

    const verificarPalavra = () => {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        let palavraDigitada = Array.from(rowInputs).map(input => input.value).join('');

        if (palavraDigitada.length !== 5) {
            showOverlay(palavraIncompletaOverlay);
            return;
        }

        const palavraSorteada = palavras[posicao];
        const palavraDigitadaSemAcentos = removeAcentos(palavraDigitada.toLowerCase());
        const palavrasSemAcentos = palavras.map(palavra => removeAcentos(palavra.toLowerCase()));

        if (!palavrasSemAcentos.includes(palavraDigitadaSemAcentos)) {
            showOverlay(palavraNaoEncontradaOverlay);
            return;
        }

        if (palavraDigitadaSemAcentos === removeAcentos(palavraSorteada.toLowerCase())) {
            rowInputs.forEach(input => input.style.backgroundColor = COLORS.CORRECT);
            adicionarLetrasUsadas(palavraDigitada);
            atualizarCoresTeclas(palavraDigitada, Array(5).fill("Correto"), palavraSorteada);
            showOverlay(vitoriaOverlay);
            return;
        } else if (currentRow === 6) {
            mostrarTelaDerrota(palavraSorteada);
        }

        const resultado = verificarResultado(palavraDigitada, palavraSorteada);
        alterarCoresInputs(resultado);
        adicionarLetrasUsadas(palavraDigitada);
        atualizarCoresTeclas(palavraDigitada, resultado, palavraSorteada);
        ativarProximaLinha();
    };

    const verificarResultado = (palavraDigitada, palavraSorteada) => {
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
    };

    const adicionarLetrasUsadas = (palavra) => {
        for (let letra of palavra) {
            if (!letrasUsadas.includes(letra.toUpperCase()) && !letrasUsadas.includes(letra.toLowerCase())) {
                letrasUsadas.push(letra);
            }
        }
    };

    const atualizarCoresTeclas = (palavraDigitada, resultado, palavraSorteada) => {
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
    };

    const mostrarTelaDerrota = (palavraCorreta) => {
        const derrotaOverlayContent = document.querySelector(".derrota-overlay-content");
        derrotaOverlayContent.innerHTML = `A palavra correta era: ${palavraCorreta}`;
        showOverlay(derrotaOverlay);
    };

    const resetarPagina = () => {
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
    };

    init();
});