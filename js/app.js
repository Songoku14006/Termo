document.addEventListener("DOMContentLoaded", function() {
    let currentRow = 1;
    let currentInput = 1;
    let palavras = [];
    let posicao;
    let todasCorretas = true;

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

    document.addEventListener('focus', (event) => {
        const focusedElement = document.activeElement;
        const elementId = focusedElement.id;
        const numberMatch = elementId.match(/input-(\d+)/);
        if (numberMatch) {
            const number = numberMatch[1];
            currentInput = parseInt(number, 10);
            console.log(currentInput);
        }
    }, true);
    

    function insertLetter(letter) {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        
        if (currentInput <= rowInputs.length) {
            rowInputs[currentInput - 1].value = letter;
            rowInputs[currentInput - 1].focus();
            currentInput++;
            if (currentInput > rowInputs.length) {
                currentInput = 1;
            }
        }
    }

    function handleLetterButtonClick(event) {
        const letter = event.target.textContent;
        insertLetter(letter);
    }

    function setupEventListeners() {
        const letras = document.querySelectorAll(".footer-teclado");
        letras.forEach(function(letra) {
            letra.addEventListener("click", handleLetterButtonClick);
        });

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

        const backspace = document.querySelector(".div-backspace-button");
        if (backspace) {
            backspace.addEventListener("click", btnBackspace);
        }

        const enterButton = document.getElementById('enter');
        if (enterButton) {
            enterButton.addEventListener('click', verificarPalavra);
        }
    }

    function getRandomWord() {
        const size = palavras.length;
        posicao = getRandomNumber(size);
        let fruit = palavras[posicao];
        console.log(fruit);
    }

    function getRandomNumber(size) {
        let randomNumber = Math.floor(Math.random() * size);
        return randomNumber;
    }

    function btnBackspace() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        if (currentInput > 1) {
            currentInput--;
        } else {
            currentInput = 1;
        }

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

            switch (status) {
                case "Correto":
                    input.style.backgroundColor = "#6AA84F";
                    break;
                case "Incorreto":
                    input.style.backgroundColor = "#FFD966";
                    todasCorretas = false;
                    break;
                case "Não está na palavra":
                    input.style.backgroundColor = "#434343";
                    todasCorretas = false;
                    break;
                default:
                    input.style.backgroundColor = "";
                    todasCorretas = false;
            }
        });
    
        if (todasCorretas) {
            rowInputs.forEach(input => {
                input.style.backgroundColor = "#6AA84F";
            });
        }
    }

    function ativarProximaLinha() {
        const currentInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);

        currentRow++;

        const nextInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        nextInputs.forEach(input => {
            input.disabled = false;
        });

        currentInput = 1;
        const selectInput = document.getElementById(`main-input-${currentInput}`);
        if (selectInput) {
            selectInput.focus();
        }
    }

    function verificarPalavra() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        const letrasUsadas = [];
        const letras = document.querySelectorAll(".footer-teclado");
        letras.forEach(function() {
            
        });
        let palavraDigitada = "";
        rowInputs.forEach(input => {
            palavraDigitada += input.value;
            letrasUsadas.push(input.value);
        });
        
        

        if (palavraDigitada.length !== 5) {
            console.log("Digite todas as letras para verificar.");
            return;
        }
    
        const palavraSorteada = palavras[posicao];
    
        function removeAcentos(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
    
        function comparaSemAcentos(str1, str2) {
            return removeAcentos(str1.toLowerCase()) === removeAcentos(str2.toLowerCase());
        }
    
        const palavrasSemAcentos = palavras.map(palavra => removeAcentos(palavra.toLowerCase()));
        const palavraDigitadaSemAcentos = removeAcentos(palavraDigitada.toLowerCase());
    
        if (!palavrasSemAcentos.includes(palavraDigitadaSemAcentos)) {
            console.log("Palavra não encontrada no array de palavras.");
            return;
        }
    
        if (comparaSemAcentos(palavraDigitada, palavraSorteada)) {
            console.log("Palavra correta!");
            rowInputs.forEach(input => {
            input.style.backgroundColor = "#6AA84F";
            });
            return;
        }
    
        let resultado = [];
        let letraContagem = {};

        for (let letra of palavraSorteada) {
            letraContagem[letra] = (letraContagem[letra] || 0) + 1;
        }

        for (let i = 0; i < palavraDigitada.length; i++) {
            const letraDigitada = palavraDigitada[i];
            const letraSorteada = palavraSorteada[i];
    
            if (letraDigitada === letraSorteada) {
                resultado.push("Correto");
                letraContagem[letraDigitada]--;
            } else {
                resultado.push(null);
            }
        }

        for (let i = 0; i < palavraDigitada.length; i++) {
            if (resultado[i] === null) {
                const letraDigitada = palavraDigitada[i];
                if (letraContagem[letraDigitada] > 0) {
                    resultado[i] = "Incorreto";
                    letraContagem[letraDigitada]--;
                } else {
                    resultado[i] = "Não está na palavra";
                }
            }
        }
    
        alterarCoresInputs(resultado);
        ativarProximaLinha();
    }

    init();
});
