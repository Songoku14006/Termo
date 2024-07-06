document.addEventListener("DOMContentLoaded", () => {
    const COLORS = {
        CORRECT: "#6AA84F",
        INCORRECT: "#FFD966",
        NOT_IN_WORD: "#434343"
    };

    const overlays = {
        regrasOverlay: document.getElementById("regras"),
        vitoriaOverlay: document.getElementById("vitoria"),
        derrotaOverlay: document.getElementById("derrota"),
        palavraNaoEncontradaOverlay: document.getElementById("palavraNaoEncontrada"),
        palavraIncompletaOverlay: document.getElementById("palavraIncompleta")
    };

    overlays.regrasOverlay.classList.add("show");

    Object.values(overlays).forEach(overlay => {
        overlay.addEventListener("click", () => overlay.classList.remove("show"));
    });

    document.getElementById("btn-rules").addEventListener("click", () => overlays.regrasOverlay.classList.add("show"));

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

    const initGame = async () => {
        const state = {
            currentRow: 1,
            currentInput: 1,
            palavras: [],
            todasCorretas: true,
            letrasUsadas: [],
            posicao: null,
        };

        state.palavras = await loadFileAsArray('biblioteca/palavras.txt');
        getRandomWord(state);
        setupEventListeners(state);
    };

    const setupEventListeners = (state) => {
        document.querySelectorAll(".footer-teclado").forEach(tecla => {
            tecla.addEventListener("click", () => handleLetterButtonClick(tecla.textContent.toLowerCase(), state));
        });
        document.addEventListener('keydown', (event) => handleKeyDown(event, state), { passive: true });
        document.addEventListener('focus', (event) => handleFocus(event, state), true);

        const backspace = document.querySelector(".div-backspace-button");
        if (backspace) {
            backspace.addEventListener("click", () => btnBackspace(state));
        }

        addClickListener('enter', () => verificarPalavra(state));
        addClickListener('btn-restart', () => resetarPagina(state));
    };

    const addClickListener = (id, handler) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    };

    const handleKeyDown = (event, state) => {
        const key = event.key;
        if (key === 'Enter') {
            verificarPalavra(state);
        } else if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            insertLetter(key, state);
        } else if (key === 'Backspace') {
            btnBackspace(state);
        }
    };

    const handleFocus = (event, state) => {
        const idMatch = event.target.id.match(/input-(\d+)/);
        if (idMatch) state.currentInput = parseInt(idMatch[1], 10);
    };

    const getRandomWord = (state) => {
        state.posicao = getRandomNumber(state.palavras.length);
    };

    const getRandomNumber = (size) => Math.floor(Math.random() * size);

    const insertLetter = (letter, state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        if (state.currentInput <= rowInputs.length) {
            rowInputs[state.currentInput - 1].value = letter;
            rowInputs[state.currentInput - 1].focus();
            state.currentInput = (state.currentInput % rowInputs.length) + 1;
            if (state.currentInput > rowInputs.length) {
                verificarPalavra(state);
            }
        }
    };

    const handleLetterButtonClick = (letter, state) => {
        insertLetter(letter, state);
    };

    const btnBackspace = (state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        state.currentInput = Math.max(state.currentInput - 1, 1);
        for (let i = rowInputs.length - 1; i >= 0; i--) {
            if (rowInputs[i].value !== "") {
                rowInputs[i].value = "";
                state.currentInput = i + 1;
                break;
            }
        }
        rowInputs[state.currentInput - 1].focus();
    };

    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const alterarCoresInputs = (resultado, state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        rowInputs.forEach((input, index) => {
            const status = resultado[index];
            const cor = {
                "Correto": COLORS.CORRECT,
                "Incorreto": COLORS.INCORRECT,
                "Não está na palavra": COLORS.NOT_IN_WORD
            }[status] || "";
            input.style.backgroundColor = cor;
            if (status !== "Correto") state.todasCorretas = false;
        });
    };

    const ativarProximaLinha = (state) => {
        const currentInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        currentInputs.forEach(input => input.disabled = true);
        state.currentRow++;
        const nextInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        nextInputs.forEach(input => input.disabled = false);
        state.currentInput = 1;
        document.getElementById(`main-input-${state.currentInput}`)?.focus();
    };

    const verificarPalavra = (state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        const palavraDigitada = Array.from(rowInputs).map(input => input.value).join('');

        if (palavraDigitada.length !== 5) {
            showOverlay(overlays.palavraIncompletaOverlay);
            return;
        }

        const palavraSorteada = state.palavras[state.posicao];
        const palavraDigitadaSemAcentos = removeAccents(palavraDigitada.toLowerCase());
        const palavrasSemAcentos = state.palavras.map(palavra => removeAccents(palavra.toLowerCase()));

        if (!palavrasSemAcentos.includes(palavraDigitadaSemAcentos)) {
            showOverlay(overlays.palavraNaoEncontradaOverlay);
            return;
        }

        if (palavraDigitadaSemAcentos === removeAccents(palavraSorteada.toLowerCase())) {
            rowInputs.forEach(input => input.style.backgroundColor = COLORS.CORRECT);
            adicionarLetrasUsadas(palavraDigitada, state);
            atualizarCoresTeclas(palavraDigitada, Array(5).fill("Correto"), palavraSorteada);
            showOverlay(overlays.vitoriaOverlay);
            return;
        } else if (state.currentRow === 6) {
            mostrarTelaDerrota(palavraSorteada);
        }

        const resultado = verificarResultado(palavraDigitada, palavraSorteada);
        alterarCoresInputs(resultado, state);
        adicionarLetrasUsadas(palavraDigitada, state);
        atualizarCoresTeclas(palavraDigitada, resultado, palavraSorteada);
        ativarProximaLinha(state);
    };

    const verificarResultado = (palavraDigitada, palavraSorteada) => {
        if (palavraDigitada.length !== palavraSorteada.length) {
            return [];
        }

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

    const adicionarLetrasUsadas = (palavra, state) => {
        for (let letra of palavra) {
            if (!state.letrasUsadas.includes(letra.toUpperCase()) && !state.letrasUsadas.includes(letra.toLowerCase())) {
                state.letrasUsadas.push(letra);
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
                    } else if (status === "Incorreto" && !tecla.classList.contains('correto')) {
                        tecla.classList.remove('nao-na-palavra');
                        tecla.classList.add('incorreto');
                    } else if (status === "Não está na palavra" && !tecla.classList.contains('correto')) {
                        tecla.classList.remove('incorreto');
                        tecla.classList.add('nao-na-palavra');
                    }
                    letrasCorretas.add(teclaTexto);
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
        showOverlay(overlays.derrotaOverlay);
    };

    const resetarPagina = (state) => {
        state.currentRow = 1;
        state.currentInput = 1;
        state.todasCorretas = true;
        state.letrasUsadas = [];

        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
            input.style.backgroundColor = '';
            input.disabled = true;
        });

        document.querySelectorAll('#row-1 .main-input').forEach((input, index) => {
            input.disabled = false;
            if (index === 0) input.focus();
        });

        document.querySelectorAll(".footer-teclado").forEach(tecla => {
            tecla.classList.remove('correto', 'incorreto', 'nao-na-palavra');
        });

        getRandomWord(state);
    };

    initGame();
});