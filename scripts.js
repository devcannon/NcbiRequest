const URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
const MAX_RETRIES = 5
// const NCBI_API_KEY = XX

function updateProgressBar(value) {
    document.getElementById('progressBar').value = value;
}

async function run() {
    let genes = document.getElementById('genes').value.split('\n');
    let queries = document.getElementById('queries').value.split('\n');
    
    resetTable();
    const progressBar = document.getElementById("progressBar");
    progressBar.classList.remove("hidden");
    
    const results = [];
    results.push(['gene']);
    results[0].push(...queries);
    
    let progress = 0.0;
    const totalRequests = genes.length * queries.length;
    let requestCount = 0;
    for (const gene of genes) {
        const geneResults = [];
        geneResults.push(gene);
        for (let query of queries) {
            query = query.replace("<gene>", gene);
            const paramsUrl = URL + `?term=${query}&db=pubmed` //&api_key=${NCBI_API_KEY}`
            const jsonResponse = await requestData(paramsUrl);
            const count = extractCount(jsonResponse);
            geneResults.push(count);
            requestCount++;
            progress = requestCount / totalRequests * 100;
            updateProgressBar(progress);
        }
        results.push(geneResults);
    }
    updateTable(results);

    const clipBoardButton = document.getElementById("clipBoardButton");
    clipBoardButton.classList.remove("hidden")
}


async function requestData(UrlWithParams) {
    const response = await fetch(UrlWithParams, {
        mode: 'cors'
    });
    const body = await response.text();
    return body
}

function extractCount(responseBody) {
    // Response body is xml.
    const match = responseBody.match(/<Count>\d*<\/Count>/);
    const matchAsString = match.toString().replace('<Count>', '').replace('</Count>', '');
    return Number(matchAsString)
};

function resetTable() {
    const tableRows = document.querySelectorAll("tr");
    tableRows.forEach(ele => ele.remove());
}

function updateTable(resultsArr) {
    const tableBody = document.getElementById('tableBody');

    resultsArr.forEach((rowData, rowIndex) => {
    const row = document.createElement('tr');
        rowData.forEach((cellData, colIndex) => {
            const cell = rowIndex === 0 ? document.createElement('th') : document.createElement('td');
            cell.className = 'py-2 px-4 border-b';
            cell.textContent = cellData;
            row.appendChild(cell);
        });
    tableBody.appendChild(row);
    });
}

function copyTableToClipboard() {
    let html = document.getElementById('table').outerHTML;

    const blob = new Blob([html], { type: "text/html" });
    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}