import { palavras } from './palavras.js';

let size = palavras.length;

function getRandomNumber(size) {
    let randomNumber = Math.random() * size-1;
    return randomNumber;
}
document.addEventListener('DOMContentLoaded', getRandomWord());

function getRandomWord() {
    let posicao = getRandomNumber(size);
    let fruit = palavras.at(posicao);
    console.log(fruit);
}