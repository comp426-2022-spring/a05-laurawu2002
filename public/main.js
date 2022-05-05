// Focus div based on nav button click
const home = document.getElementById('homenav')
home.addEventListener('click', hide)
function hide() {
    document.getElementById('single').setAttribute('class', 'hidden')
    document.getElementById('multi').setAttribute('class', 'hidden')
    document.getElementById('guess').setAttribute('class', 'hidden')
}

// Flip one coin and show coin image to match result when button clicked
const single = document.getElementById('singlenav')
single.addEventListener('click', flipCoin)

function flipCoin() {
    hide()
    fetch('http://localhost:5000/app/flip/', {mode: 'cors'})
      .then(function(response) {
      return response.json();
      })
    .then(function(result) {
        console.log(result);
        document.getElementById('single_result').innerHTML = result.flip
        document.getElementById('coin').setAttribute('src', 'assets/img/' + result.flip + '.png')
        document.getElementById('single').setAttribute('class', 'active')
    })
}

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

const multi = document.getElementById('multinav')
multi.addEventListener('click', showMulti)
function showMulti() {
    hide()
    document.getElementById('multi').setAttribute('class', 'active')
}

const coins = document.getElementById("coins")
coins.addEventListener("submit", flipCoins)

async function flipCoins(event) {
    event.preventDefault();
    const endpoint = "app/flip/coins/"
    const url = document.baseURI+endpoint

    const formEvent = event.currentTarget

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });

        console.log(flips);
        generate_table(flips.raw);

        document.getElementById("heads").innerHTML = "Heads: "+flips.summary.heads;
        document.getElementById("tails").innerHTML = "Tails: "+flips.summary.tails;
    } catch (error) {
        console.log(error);
    }
}

// Create a data sender
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}

function generate_table(array){
    var body = document.getElementById("tbl");
    var tbl  = document.createElement('table');
    var heading = tbl.insertRow();
    var title = document.createElement("heading");
    title.innerHTML = "Image / Result";
    heading.appendChild(title);

    for(var i = 0; i < array.length; i++){
        var row = tbl.insertRow();
        for(var j = 0; j < 2; j++){
                var cell = row.insertCell();
                if(j === 0){
                    var image = document.createElement('img');
                    image.setAttribute("src", "/assets/img/"+array[i]+".png");
                    image.setAttribute("class", "smallcoin");
                    cell.appendChild(image); 
                } else {
                    var cellText = document.createTextNode(array[i]);
                    cell.appendChild(cellText); 
                }
            }     
    }
    body.appendChild(tbl);
    tbl.setAttribute("border", "2");
}

// Guess a flip by clicking either heads or tails button
const guess = document.getElementById('guessnav')
guess.addEventListener('click', showGuess)
function showGuess() {
    hide()
    document.getElementById('guess').setAttribute('class', 'active')
}

const heads = document.getElementById("guessingHead")
heads.addEventListener("click", guessHead)

function guessHead() {
    fetch('http://localhost:5000/app/flip/call/heads', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result);
        document.getElementById("yourguess").innerHTML = "heads";
        document.getElementById("guesscoin").setAttribute("src", "assets/img/heads.png");

        document.getElementById("flipped").innerHTML = result.flip;
        document.getElementById('flippedcoin').setAttribute('src', 'assets/img/' + result.flip + '.png')

        document.getElementById("yourresult").innerHTML = result.result;
    })
}

const tails = document.getElementById("guessingTail")
tails.addEventListener("click", guessTail)

function guessTail() {
    fetch('http://localhost:5000/app/flip/call/tails', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result);
        document.getElementById("yourguess").innerHTML = "tails";
        document.getElementById("guesscoin").setAttribute("src", "assets/img/tails.png");

        document.getElementById("flipped").innerHTML = result.flip;
        document.getElementById('flippedcoin').setAttribute('src', 'assets/img/' + result.flip + '.png')

        document.getElementById("yourresult").innerHTML = result.result;
    })
}