const boardDiv = document.getElementById("board");
const piecesDiv = document.getElementById("piece-container");
var puzzlePath, rows, cols, puzzleName, size, count;
var pieces = [];
var timeSpent;

let selectedPuzzle = new URL(document.location).searchParams.get("name");
document.body.onload = prepareGame(selectedPuzzle);
document.body.addEventListener("dragover", (event) => event.preventDefault(), false); // Allows to drag pieces all over document.
document.body.addEventListener("drop", (event) => drop(event), false); // Same

async function prepareGame(selectedPuzzle) {
    puzzlePath = `puzzles/${selectedPuzzle}`;
    // Get generic puzzle data
    let puzzleJSON = await fetch(`${puzzlePath}/data.json`)
        .then((res) => res.json())
        .then((json) => { return json });

    // Init variables
    rows = puzzleJSON.rows;
    cols = puzzleJSON.columns;
    size = `${45 / cols}vw`;
    puzzleName = puzzleJSON.name;
    count = rows * cols;

    const originalImage = document.getElementById("original-image");
    originalImage.src = `${puzzlePath}/sample/sample.jpg`;

    generateBoard();
    generatePieces();

    loadPuzzleData(puzzleName);
    window.addEventListener("beforeunload", (event) => savePuzzleData(event));
}

function generateBoard() {
    const table = document.createElement("table");
    table.id = "board-table";

    for (let x = 1; x < rows + 1; x++) {
        const row = table.insertRow();
        for (let y = 1; y < cols + 1; y++) {
            const col = row.insertCell();
            col.id = `cell:${x}:${y}`;
            col.classList.add("cell");
            col.style.width = size;
            col.style.height = size;

            col.addEventListener("dragover", (event) => event.preventDefault());
            col.addEventListener("drop", (event) => validatePiece(event));
        }
    }

    boardDiv.appendChild(table);
}

function generatePieces() {
    const boardDimensions = document.getElementById("piece-container").getBoundingClientRect();

    for (let x = 1; x < rows + 1; x++) {
        for (let y = 1; y < cols + 1; y++) {
            const piece = document.createElement("img");

            piece.id = `piece:${x}:${y}`;
            piece.classList.add("piece");
            piece.src = `${puzzlePath}/pieces/fila-${x}-columna-${y}.jpg`;
            piece.style.width = size;
            piece.style.height = size;
            piece.style.left = `calc(${(Math.random() * boardDimensions.width) + boardDimensions.left}px - ${piece.style.width})`;
            piece.style.top = `calc(${(Math.random() * boardDimensions.height) + boardDimensions.top}px)`;

            piece.toggleAttribute("draggable", true);

            piece.addEventListener("dragstart", (event) => {
                let style = window.getComputedStyle(event.target, null);
                // Transfers ID, x and y positions.
                event.dataTransfer.setData("data", `${piece.id},${parseInt(style.getPropertyValue("left"), 10) - event.clientX},${parseInt(style.getPropertyValue("top"), 10) - event.clientY}`);
            });

            pieces.push(piece);
        }
    }

    for (let i = 0; i < count; i++) {
        let rand = Math.floor(Math.random() * pieces.length);
        let piece = pieces[rand];
        pieces.splice(rand, 1);

        piecesDiv.appendChild(piece);
    }
};

function validatePiece(event) {
    event.preventDefault();

    const pieceId = event.dataTransfer.getData("data").split(',')[0];
    pieceData = pieceId.split(':');

    // Return if element dragged is not a piece
    if (pieceData[0] !== "piece") return;

    // Return if dropper isn't cell
    const targetCell = event.toElement;
    if (!targetCell.classList.contains("cell")) return;

    // Check if piece and cell IDs match, then append.
    const expectedCell = document.getElementById(`cell:${pieceData[1]}:${pieceData[2]}`);
    if (targetCell === expectedCell) setPiece(targetCell, pieceId)
    
    if (count === 0) { win(); }
}

function setPiece(targetCell, pieceId) {
    const pieceDiv = document.getElementById(pieceId);

    pieceDiv.style.border = "none";
    pieceDiv.style.position = "inherit";
    pieceDiv.toggleAttribute("draggable", false);
    pieceDiv.removeEventListener("dragstart", (event) => {
        event.dataTransfer.setData("pieceId", piece.id); // Not wrong
    });
    pieceDiv.classList.add("piece-set");

    targetCell.appendChild(pieceDiv);
    count--;
}

function win() {
    let table = document.getElementById("board-table");

    // Remove border
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            table.rows.item(x).cells.item(y).style.border = "0";
        }
    }

    

    let data = window.localStorage.getItem("savedPuzzleData");
    json = JSON.parse(data);
    let index = json.puzzles.findIndex((puzzle) => puzzle.name == puzzleName);
    
    alert(`Felicidades!\nTiempo empleado: ${json.puzzles[index].timeSpent}s (Pendiente implementar reloj)`);
    
    json.puzzles[index] = {
        "name": puzzleName,
        "timeSpent": 0,
        "piecesSet": []
    };
    json = JSON.stringify(json);
    localStorage.setItem("savedPuzzleData", json);
}

function drop(event) {
    var data = event.dataTransfer.getData("data").split(',');
    var piece = document.getElementById(data[0]);
    piece.style.left = (event.clientX + parseInt(data[1], 10)) + 'px';
    piece.style.top = (event.clientY + parseInt(data[2], 10)) + 'px';
    event.preventDefault();
    return false;
}

function createPuzzleData(selectedPuzzle) {
    let json = {
        "puzzles": [
            {
                "name": selectedPuzzle,
                "timeSpent": 0,
                "piecesSet": []
            }
        ]
    };

    let data = JSON.stringify(json);
    localStorage.setItem("savedPuzzleData", data);

    return json;
}

function loadPuzzleData(selectedPuzzle) {
    let json;
    let data = localStorage.getItem("savedPuzzleData");

    if (!data) json = createPuzzleData(selectedPuzzle);

    json = JSON.parse(data);
    if (!json.puzzles) json = createPuzzleData(selectedPuzzle);

    if (!json.puzzles.find((puzzle) => puzzle.name === selectedPuzzle)) {
        json.puzzles.push({
            "name": selectedPuzzle,
            "timeSpent": 0,
            "piecesSet": []
        });
        let saved = JSON.stringify(json);
        localStorage.setItem("savedPuzzleData", saved);
    }

    let puzzleData = json.puzzles.find((puzzle) => puzzle.name === selectedPuzzle);

    puzzleData.piecesSet.forEach(pieceId => {
        let id = pieceId.split(':');
        //let piece = document.getElementById(`piece:${id[1]}:${id[2]}`);
        let cell = document.getElementById(`cell:${id[1]}:${id[2]}`);
        setPiece(cell, pieceId);
    });

    timeSpent = puzzleData.timeSpent;
    setInterval(() => {// In seconds
        timeSpent++; // +1 Second
        //console.log(timeSpent);
    }, 1000);

    //startTimer(puzzleData.timeSpent);
}

function savePuzzleData(event) {
    let data = localStorage.getItem("savedPuzzleData");
    if (!data) return;
    console.log(data);
    let json = JSON.parse(data);

    let setPieces = document.getElementsByClassName("piece-set");

    let arr = Array.from(setPieces);

    for (let i = 0; i < arr.length; i++) { arr[i] = arr[i].id; }

    let index = json.puzzles.findIndex((puzzle) => puzzle.name == puzzleName);
    if (index === -1) return console.log("errIndex");
    console.log(timeSpent);
    json.puzzles[index] = {
        "name": puzzleName,
        "timeSpent": timeSpent,
        "piecesSet": arr
    };

    json = JSON.stringify(json);
    localStorage.setItem("savedPuzzleData", json);

    //event.preventDefault();
    //event.returnValue = "Tu progreso ha sido guardado."; // Legacy
}

function startTimer(seconds) {
    const today = new Date();
    //let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    // TODO
}