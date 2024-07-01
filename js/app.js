import { palavras } from './palavras.js';

document.addEventListener("DOMContentLoaded", function() {
    let currentRow = 1;
    let size = palavras.length;
    let selectedIndex = 1;    
    let selectInput = document.getElementById(`main-input-${selectedIndex}`);
    selectInput.focus();   

    function insertLetter(event) {
        const letter = event.target.textContent;
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        
        for (let i = 0; i < rowInputs.length; i++) {
            if (rowInputs[i].value === "") {
                rowInputs[i].value = letter;
                rowInputs[i].focus();
                break;
            }
        }
    }
    
    const letras = document.querySelectorAll(".footer-teclado");
    letras.forEach(function(letra) {
        letra.addEventListener("click", insertLetter);
    });

    document.addEventListener('DOMContentLoaded', getRandomWord());
    function getRandomWord() {
        let posicao = getRandomNumber(size);
        let fruit = palavras.at(posicao);
        console.log(fruit);
    }

    function getRandomNumber(size) {
        let randomNumber = Math.random() * size-1;
        return randomNumber;
    }
    const backspace = document.querySelector(".div-backspace-button");
    if (backspace) {
        backspace.addEventListener("click", btnBackspace);
    }

    function btnBackspace() {
        const rowInputs = document.querySelectorAll(`#row-${currentRow} .main-input`);
        for (let i = rowInputs.length - 1; i >= 0; i--) {
            if (rowInputs[i].value !== "") {
                rowInputs[i].value = "";
                rowInputs[selectedIndex].focus;
                break;
            }
        }
    }
});
