import { palavras } from './palavras.js';

document.addEventListener("DOMContentLoaded", function() {
    let currentRow = 1;
    let size = palavras.length;
    let selectedIndex = 1;    
    let selectInput = document.getElementById(`main-input-${selectedIndex}`);
    selectInput.focus(); 
    
    document.addEventListener('focus', (event) => {
        const focusedElement = document.activeElement;
        const elementId = focusedElement.id;
        const numberMatch = elementId.match(/\d+/);
        if (numberMatch) {
            const number = numberMatch[0];
            selectedIndex = parseInt(number, 10);
            console.log(selectedIndex);
        }
    }, true);

    function insertLetter(event) {
        const letter = event.target.textContent;
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        
        if (selectedIndex <= rowInputs.length) {
            rowInputs[selectedIndex - 1].value = letter;
            selectedIndex++;
            if (selectedIndex > rowInputs.length) {
                selectedIndex = rowInputs.length;
            }
        }
    }
    
    const letras = document.querySelectorAll(".footer-teclado");
    letras.forEach(function(letra) {
        letra.addEventListener("click", insertLetter);
    });

    getRandomWord();
    function getRandomWord() {
        let posicao = getRandomNumber(size);
        let fruit = palavras.at(posicao);
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
        }
        for (let i = rowInputs.length - 1; i >= 0; i--) {
            if (rowInputs[i].value !== "") {
                rowInputs[i].value = "";
                rowInputs[selectedIndex - 1].focus();
                break;
            }
        }
    }
});

