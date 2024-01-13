import requests
import os
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
MAX_RETRIES = 5

load_dotenv()
NCBI_API_KEY = os.getenv('NCBI_API_KEY')

#os.environ

# api-endpoint
def executeQuery(query):
    PARAMS = {'term':query, 'api_key':NCBI_API_KEY, 'db':'pubmed'}
    response = requests.get(url = URL, params = PARAMS)
    root = ET.fromstring(response.text.strip())
    count = root.find("Count").text
    return count

def runQuery(query):
    retries = 0
    while(retries <= MAX_RETRIES ):
        try:
            count = executeQuery(query)
            return count
        except:
            print(f"Query {query} failed... (Retry {retries}/{MAX_RETRIES})")
            retries += 1
    print(f"Query {query} failed... (max retries reached)")
    return 0

