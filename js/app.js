document.addEventListener("DOMContentLoaded", () => {
    let checkbox = document.getElementById('modo-daltonico');
    let COLORS;
    if (checkbox.checked) {
        COLORS = {
            CORRECT: "#008000",
            INCORRECT: "#FFA500",
            NOT_IN_WORD: "#808080"
        };
    } else {
        COLORS = {
            CORRECT: "#6AA84F",
            INCORRECT: "#FFD966",
            NOT_IN_WORD: "#434343"
        };
    }

    const overlays = {
        regrasOverlay: document.getElementById("regras"),
        vitoriaOverlay: document.getElementById("vitoria"),
        derrotaOverlay: document.getElementById("derrota"),
        palavraNaoEncontradaOverlay: document.getElementById("palavraNaoEncontrada"),
        palavraIncompletaOverlay: document.getElementById("palavraIncompleta"),
        configuracoesOverlay: document.getElementById("configuracoes"),
        estatisticasOverlay: document.getElementById("estatisticas")
    };

    overlays.regrasOverlay.classList.add("show");

    Object.values(overlays).forEach(overlay => {
        overlay.addEventListener("click", () => overlay.classList.remove("show"));
    });

    document.getElementById("btn-rules").addEventListener("click", () => overlays.regrasOverlay.classList.add("show"));

    document.getElementById("btn-configuracoes").addEventListener("click", () => overlays.configuracoesOverlay.classList.add("show"));
    document.getElementById("btn-estatisticas").addEventListener("click", () => overlays.estatisticasOverlay.classList.add("show"));

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

    const updateWinStrikeDisplay = (count) => {
        document.getElementById('win-strike').textContent = `Vitórias seguidas: ${count}`;
    };

    const updateEstatisticasDisplay = (vitoria, derrota) => {
        document.getElementById('win-count').textContent = `Vitórias: ${vitoria}`;
        document.getElementById('loss-count').textContent = `Derrotas: ${derrota}`;
    };

    let winStrike = localStorage.getItem('winStrike') ? parseInt(localStorage.getItem('winStrike')) : 0;
    let vitorias = localStorage.getItem('vitorias') ? parseInt(localStorage.getItem('vitorias')) : 0;
    let derrotas = localStorage.getItem('derrotas') ? parseInt(localStorage.getItem('derrotas')) : 0;

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
        } else if (key === 'ArrowRight') {
            navegarParaDireita(state);
        } else if (key === 'ArrowLeft') {
            navegarParaEsquerda(state);
        } else if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            insertLetter(key, state);
        } else if (key === 'Backspace') {
            btnBackspace(state);
        }
    };
    
    const navegarParaDireita = (state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        const currentIndex = (state.currentInput - 1) % rowInputs.length;
        const nextIndex = (currentIndex + 1) % rowInputs.length;
        rowInputs[nextIndex].focus();
        state.currentInput = nextIndex + 1;
    };
    
    const navegarParaEsquerda = (state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        const currentIndex = (state.currentInput - 1) % rowInputs.length;
        const previousIndex = (currentIndex - 1 + rowInputs.length) % rowInputs.length;
        rowInputs[previousIndex].focus();
        state.currentInput = previousIndex + 1;
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
        
        // Encontra o índice do input atual focado
        const currentIndex = (state.currentInput - 1) % rowInputs.length;
        const currentInput = rowInputs[currentIndex];
        
        // Verifica se o input atual já está preenchido
        if (!currentInput.value) {
            // Se não estiver preenchido, insere a letra no input atual
            currentInput.value = letter;
            currentInput.focus();
            state.currentInput = (state.currentInput % rowInputs.length) + 1;
            
            // Verifica se todos os inputs estão preenchidos
            const allInputsFilled = Array.from(rowInputs).every(input => input.value !== "");
            if (allInputsFilled) {
                // Remove o foco de todos os inputs
                rowInputs.forEach(input => input.blur());
            }
        } else {
            // Se o input atual já está preenchido, tenta encontrar o próximo input vazio
            let nextIndex = (currentIndex + 1) % rowInputs.length;
            while (nextIndex !== currentIndex && rowInputs[nextIndex].value) {
                nextIndex = (nextIndex + 1) % rowInputs.length;
            }
            
            // Insere a letra no próximo input vazio encontrado
            if (!rowInputs[nextIndex].value) {
                rowInputs[nextIndex].value = letter;
                rowInputs[nextIndex].focus();
                state.currentInput = nextIndex + 1;
            }
        }
    };
       
    
    const handleLetterButtonClick = (letter, state) => {
        insertLetter(letter, state);
    };

    const btnBackspace = (state) => {
        const rowInputs = document.querySelectorAll(`#row-${state.currentRow} .main-input`);
        
        // Verifica se algum input está em foco
        const focusedInput = document.activeElement;
        const focusedIndex = Array.from(rowInputs).findIndex(input => input === focusedInput);
    
        if (focusedIndex === -1) {
            // Se nenhum input estiver em foco, foca no último e apaga
            const lastInput = rowInputs[rowInputs.length - 1];
            lastInput.value = "";
            lastInput.focus();
            state.currentInput = rowInputs.length;
        } else {
            // Se algum input está em foco
            if (focusedInput.value !== "") {
                // Se o input focado estiver preenchido, apaga ele e foca nele
                focusedInput.value = "";
                focusedInput.focus();
            } else {
                // Se o input focado não estiver preenchido, volta para o anterior e apaga
                const previousIndex = Math.max(focusedIndex - 1, 0);
                const previousInput = rowInputs[previousIndex];
                previousInput.value = "";
                previousInput.focus();
                state.currentInput = previousIndex + 1;
            }
        }
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
            winStrike++;
            localStorage.setItem('winStrike', winStrike);
            updateWinStrikeDisplay(winStrike);
            document.querySelector("#vitoria .vitoria-overlay-content #win-strike").textContent = `Vitórias seguidas: ${winStrike}`;
            vitorias++;
            localStorage.setItem('vitorias', vitorias);
            updateEstatisticasDisplay(vitorias,derrotas);
            showOverlay(overlays.vitoriaOverlay);
            return;
        } else if (state.currentRow === 6) {
            mostrarTelaDerrota(palavraSorteada);
            winStrike = 0;
            localStorage.setItem('winStrike', winStrike);
            derrotas++;
            localStorage.setItem('derrotas', derrotas);
            updateEstatisticasDisplay(vitorias,derrotas);
            return;
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