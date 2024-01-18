const URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
const notificationManager = document.getElementById('notifications');

window.addEventListener('load', event => {
    checkAPIKey() ? document.getElementById('api-key-stored').classList.remove("hidden") : document.getElementById('no-api-key-stored').classList.remove("hidden") 
});

function checkAPIKey() {
    return localStorage.getItem('ncbiApiKey') ? true : false;
};

notificationManager.addEventListener('notify', event => {
    event.target.classList.remove('-top-24');
    notificationManager.firstChild.textContent = event.detail.msg;
});

function hideNotification() {
    notificationManager.classList.add('-top-24');
    notificationManager.firstChild.textContent = ''
};

document.getElementById('api-key-manager').addEventListener('manage', event => {
    if (event.detail) {
        document.getElementById('no-api-key-stored').classList.add("hidden");
        document.getElementById('api-key-stored').classList.remove("hidden");
    } else {
        document.getElementById('no-api-key-stored').classList.remove("hidden");
        document.getElementById('api-key-stored').classList.add("hidden");
    }
});

function setAPIKey() {
    const apiKey = prompt("Please enter API key");
    localStorage.setItem('ncbiApiKey', apiKey);
    const apiKeySetEvent = new CustomEvent("manage", {detail: true});
    document.getElementById('api-key-manager').dispatchEvent(apiKeySetEvent);
};

function deleteAPIKey() {
    localStorage.removeItem('ncbiApiKey');
    const apiKeySetEvent = new CustomEvent("manage", {detail: false});
    document.getElementById('api-key-manager').dispatchEvent(apiKeySetEvent);
};

function updateProgressBar(value) {
    document.getElementById('progressBar').value = value;
};

async function run() {
    let genes = document.getElementById('genes').value.split('\n').filter(e => e != '');
    let queries = document.getElementById('queries').value.split('\n').filter(e => e != '');
    
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
            let paramsUrl = URL + `?term=${query}&db=pubmed`
            const jsonResponse = await requestData(paramsUrl, localStorage.getItem('ncbiApiKey') || false);
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
};


async function requestData(UrlWithParamsWithoutApiKey, apiKey) {
    // Add api key to url as parameter
    let UrlWithParamsAndAPIKey
    if (apiKey) {
        UrlWithParamsAndAPIKey = UrlWithParamsWithoutApiKey + `&api_key=${apiKey}`;
    }
    try {
        // Request data with API key
        const response = await fetch(apiKey ? UrlWithParamsAndAPIKey : UrlWithParamsWithoutApiKey, { mode: 'cors' });
        const body = await response.text();
        return body
    } catch(error) {
        // Requesting data failed
        console.error(error);
        if (apiKey) {
            try {
                // If an API key was set, try again without API key parameter
                const body = await requestData(UrlWithParamsWithoutApiKey);
                //
                console.log('Removing incorrect API key ...')
                deleteAPIKey();
                console.log("Repeating without API key ...");
                const notify = new CustomEvent('notify',  {detail: {msg: 'API incorrect and deleted!'}});
                notificationManager.dispatchEvent(notify);
                return body
            } catch(error) {
                throw error
            }
        }
    }
};

function extractCount(responseBody) {
    // Response body is xml.
    const match = responseBody.match(/<Count>\d*<\/Count>/);
    const matchAsString = match.toString().replace('<Count>', '').replace('</Count>', '');
    return Number(matchAsString)
};

function resetTable() {
    const tableRows = document.querySelectorAll("tr");
    tableRows.forEach(ele => ele.remove());
};

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
};

function copyTableToClipboard() {
    let html = document.getElementById('table').outerHTML;

    const blob = new Blob([html], { type: "text/html" });
    navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
};