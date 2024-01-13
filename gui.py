import eel
import pubmedRequest
import json

# Set the web folder and initial window size
eel.init('web')

@eel.expose
def run_button_click(genes, queries):

    genes = genes.strip().split('\n')
    queries = queries.strip().split('\n')

    results = []
    results.append(["gene"] + queries)

    progress = 0.0
    total_requests = len(genes) * len(queries)
    request_count = 0
    eel.updateProgressBar(progress)
    for gene in genes:
        gene_results = []
        gene_results.append(gene)
        for query in queries:
            gene_results.append(pubmedRequest.runQuery(query.replace("<gene>", gene)))
            request_count += 1
            progress = request_count / total_requests * 100
            eel.updateProgressBar(progress)
        results.append(gene_results)

    jsonresult = json.dumps(results)
    return jsonresult
   
if __name__ == "__main__":
    eel.start('main.html', size=(500, 700))
