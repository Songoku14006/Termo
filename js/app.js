function insertLetter(rowId, letter) {
    let row = document.getElementById(rowId);
    let inputs = row.getElementsByClassName('main-input');
    for (let input of inputs) {
        if (!input.disabled && input.value === '') {
            input.value = letter;
            break;
        }
    }
}

function backspace() {
    let inputs = document.querySelectorAll('.main-input');
    for (let i = inputs.length - 1; i >= 0; i--) {
        if (!inputs[i].disabled) {
            if (inputs[i].value !== '') {
                inputs[i].value = '';
                break;
            } else if (i > 0 && inputs[i - 1].value !== '') {
                inputs[i - 1].value = '';
                break;
            }
        }
    }
}

function enter() {
    let rows = document.querySelectorAll('.row');
    for (let row of rows) {
        let inputs = row.getElementsByClassName('main-input');
        let allFilled = true;
        for (let input of inputs) {
            if (input.value === '') {
                allFilled = false;
                break;
            }
        }
        if (allFilled) {
            for (let input of inputs) {
                input.disabled = true;
            }
            break;
        }
    }
}