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