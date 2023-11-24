const boardDiv = document.getElementById("board");
const piecesDiv = document.getElementById("piece-container");
var puzzlePath, rows, cols, puzzleName, size, count;
var pieces = [];

let selectedPuzzle = new URL(document.location).searchParams.get("name");
document.body.onload = prepareGame(selectedPuzzle);


async function prepareGame(puzzleName) {
    puzzlePath = `puzzles/${puzzleName}`;

    // Get generic puzzle data
    var puzzleData = await fetch(`${puzzlePath}/data.json`)
        .then((res) => res.json())
        .then((json) => { return json });

    // Init variables
    rows = puzzleData.rows;
    cols = puzzleData.columns;
    size = `${45/cols}vw`;
    console.log(size);
    puzzleName = puzzleData.name;
    count = rows * cols;

    const originalImage = document.getElementById("original-image");
    originalImage.src = `${puzzlePath}/sample/sample.jpg`;

    generateBoard();
    generatePieces();
}

function generateBoard() {
    const table = document.createElement("table");
    table.id = "board-table";

    for (let x = 1; x < rows + 1; x++) {
        const row = table.insertRow();
        for (let y = 1; y < cols + 1; y++) {
            const col = row.insertCell();
            col.id = `cell,${x},${y}`;
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
    for (let x = 1; x < rows + 1; x++) {
        for (let y = 1; y < cols + 1; y++) {
            const piece = document.createElement("img");
            piece.id = `piece,${x},${y}`;
            piece.classList.add("piece");
            piece.src = `${puzzlePath}/pieces/fila-${x}-columna-${y}.jpg`;
            piece.style.padding = "5px";
            piece.style.width = size;
            piece.style.height = size;
            piece.toggleAttribute("draggable", true);

            piece.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("pieceId", piece.id);
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

    const pieceId = event.dataTransfer.getData("pieceId");
    pieceData = pieceId.split(',');

    // Return if element dragged is not a piece
    if (pieceData[0] !== "piece") return;

    // Return if dropper isn't cell
    const targetCell = event.toElement;
    if (!targetCell.classList.contains("cell")) return;

    // Check if piece and cell IDs match, then append.
    const expectedCell = document.getElementById(`cell,${pieceData[1]},${pieceData[2]}`);
    if (targetCell === expectedCell) {
        const pieceDiv = document.getElementById(pieceId);
        pieceDiv.style.padding = "0";
        targetCell.appendChild(pieceDiv);
        count--;
    }

    if (count === 0) { win(); }
}

function win() {
    let table = document.getElementById("board-table");

    // Remove border
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            table.rows.item(x).cells.item(y).style.border = "0";
        }
    }

    alert("Win");
}

