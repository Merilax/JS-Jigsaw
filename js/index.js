document.body.onload = load();

async function load() {
    const puzzleList = await fetch("puzzles.json")
        .then((res) => res.json())
        .then((json) => { return json });

    puzzleList.forEach(async (puzzleUrl) => {
        puzzleUrl = "puzzles/" + puzzleUrl;
        let div = document.createElement("div");
        div.classList.add("puzzle");
        div.addEventListener("click", () => loadPuzzle(puzzleUrl));

        const puzzleData = await fetch(`${puzzleUrl}/data.json`)
            .then((res) => res.json())
            .then((json) => { return json });

        let img = document.createElement("img");
        img.src = `${puzzleUrl}/sample/sample.jpg`;
        let title = document.createElement("h2");
        title.textContent = `${puzzleData.name}`;
        let span = document.createElement("span");
        let count = puzzleData.rows * puzzleData.columns
        span.textContent = `${count} piezas`;

        let textDiv = document.createElement("div");
        textDiv.classList.add("text-div");

        div.appendChild(img);
        div.appendChild(textDiv);
        textDiv.appendChild(title);
        textDiv.appendChild(span);

        document.body.appendChild(div);
    });
}

function loadPuzzle(url) {
    /*let xhr = new XMLHttpRequest();
    xhr.open("GET", "game.html", true);
    xhr.send();*/
    location.href = "game.html?name=" + url.slice(8);
}