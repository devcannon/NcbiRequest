eel.expose(updateProgressBar);
function updateProgressBar(value) {
    document.getElementById('progressBar').value = value;
}

async function run() {
    var genes = document.getElementById('genes').value;
    var queries = document.getElementById('queries').value;

    resetTable();
    const progressBar = document.getElementById("progressBar");
    progressBar.classList.remove("hidden");
    
    json = await eel.run_button_click(genes, queries)();
    const clipBoardButton = document.getElementById("clipBoardButton");
    clipBoardButton.classList.remove("hidden")
    updateTable(json)
}

function resetTable() {
    const tableRows = document.querySelectorAll("tr");
    tableRows.forEach(ele => ele.remove());


}

function updateTable(json) {
    const tableBody = document.getElementById('tableBody');

    JSON.parse(json).forEach((rowData, rowIndex) => {
    const row = document.createElement('tr');

        rowData.forEach((cellData, colIndex) => {
            const cell = rowIndex === 0 ? document.createElement('th') : document.createElement('td');
            cell.className = 'py-2 px-4 border-b';
            cell.textContent = cellData;
            row.appendChild(cell);
        });

    tableBody.appendChild(row);
    });

    tableBody.appendChild(table);
}

function copyTableToClipboard() {
    // const html = document.getElementById('table').innerHTML;
    // let html = '<table><tr><td><a href="https://www.my-url.com">My link</a></td><td>secondCell</td></tr><tr><td>firstCellSecondRow</td><td>secondCellSecondRow</td></tr></table>';

    let html = document.getElementById('table').outerHTML;

    const blob = new Blob([html], { type: "text/html" });
    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}