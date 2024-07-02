import { palavras } from './palavras.js';

document.addEventListener("DOMContentLoaded", function() {
    let currentRow = 1;
    let size = palavras.length;
    let selectedIndex = 1;    
    let posicao;
    let selectInput = document.getElementById(`main-input-${selectedIndex}`);
    let todasCorretas = true;

    document.addEventListener('focus', (event) => {
        const focusedElement = document.activeElement;
        const elementId = focusedElement.id;
        const numberMatch = elementId.match(/\d+/);
        if (numberMatch) {
            const number = numberMatch[0];
            selectedIndex = parseInt(number, 10);
        }
    }, true);

    function insertLetter(letter) {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        
        if (selectedIndex <= rowInputs.length) {
            rowInputs[selectedIndex - 1].value = letter;
            rowInputs[selectedIndex - 1].focus();
            selectedIndex++;
            if (selectedIndex > rowInputs.length) {
                selectedIndex = 1;
            }
        }
    }

    function handleLetterButtonClick(event) {
        const letter = event.target.textContent;
        insertLetter(letter);
    }

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

    getRandomWord();
    function getRandomWord() {
        posicao = getRandomNumber(size);
        let fruit = palavras[posicao];
        console.log(fruit);
    }

    function getRandomNumber(size) {
        let randomNumber = Math.floor(Math.random() * size);
        return randomNumber;
    }

    const backspace = document.querySelector(".div-backspace-button");
    if (backspace) {
        backspace.addEventListener("click", btnBackspace);
    }

    function btnBackspace() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        if (selectedIndex > 1) {
            selectedIndex--;
        } else {
            selectedIndex = 1;
        }

        for (let i = rowInputs.length - 1; i >= 0; i--) {
            if (rowInputs[i].value !== "") {
                rowInputs[i].value = "";
                selectedIndex = i + 1;
                break;
            }
        }
        rowInputs[selectedIndex - 1].focus();
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
                    input.style.backgroundColor = "green";
                    break;
                case "Incorreto":
                    input.style.backgroundColor = "yellow";
                    todasCorretas = false; // Se encontrar algum Incorreto, não serão todas corretas
                    break;
                case "Não está na palavra":
                    input.style.backgroundColor = "black";
                    todasCorretas = false; // Se encontrar algum Não está na palavra, não serão todas corretas
                    break;
                default:
                    input.style.backgroundColor = "";
                    todasCorretas = false; // Se não houver status definido, não serão todas corretas
            }
        });
    
        if (todasCorretas) {
            rowInputs.forEach(input => {
                input.style.backgroundColor = "green";
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

        selectedIndex = 1;
        const selectInput = document.getElementById(`main-input-${selectedIndex}`);
        if (selectInput) {
            selectInput.focus();
        }
    }

    function verificarPalavra() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        let palavraDigitada = "";
        rowInputs.forEach(input => {
            palavraDigitada += input.value;
        });

        if (palavraDigitada.length !== 5) {
            console.log("Digite todas as letras para verificar.");
            return;
        }

        const palavraSorteada = palavras[posicao];

        if (!palavras.includes(palavraDigitada)) {
            console.log("Palavra não encontrada no array de palavras.");
            return;
        }

        function comparaSemAcentos(str1, str2) {
            return removeAcentos(str1.toLowerCase()) === removeAcentos(str2.toLowerCase());
        }

        if (comparaSemAcentos(palavraDigitada, palavraSorteada)) {
            console.log("Palavra correta!");
            todasCorretas = true;
            return;
        }

        let resultado = [];
        for (let i = 0; i < palavraDigitada.length; i++) {
            const letraDigitada = palavraDigitada[i];
            const letraSorteada = palavraSorteada[i];

            if (letraDigitada === letraSorteada) {
                resultado.push("Correto");
            } else if (removeAcentos(palavraSorteada).includes(removeAcentos(letraDigitada))) {
                resultado.push("Incorreto");
            } else {
                resultado.push("Não está na palavra");
            }
        }

        alterarCoresInputs(resultado);
        ativarProximaLinha();
    }

    const enterButton = document.getElementById('enter');
    if (enterButton) {
        enterButton.addEventListener('click', verificarPalavra);
    }
});