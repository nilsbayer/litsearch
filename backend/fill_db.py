import os
import PyPDF2
import requests
import re
import json
import secrets
import numpy as np
import string

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions


client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet",
                                    persist_directory="/paper_db"
                                ))

# paper_sentences_col = client.create_collection("paper_sentences")
paper_sentences_col = client.get_collection("paper_sentences")

def get_pdf_text(pdf_path):
    if not os.path.exists("pdfs"):
        os.mkdir("pdfs")

    filename = os.path.join("pdfs", pdf_path.split("/")[-1])
    response = requests.get(pdf_path)
    with open(filename, "wb") as f:
        f.write(response.content)

    # creating a pdf file object
    pdfFileObj = open(filename, 'rb')
        
    # creating a pdf reader object
    pdf_reader = PyPDF2.PdfReader(pdfFileObj)

    # extract text
    total_text_list = []

    for i in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[i].extract_text()
        total_text_list.append(page_text)

    pdf_text = " ".join(total_text_list)
    pdfFileObj.close()
    os.remove(filename)

    pdf_text = re.sub("\n", " ", pdf_text)
    pdf_sentences = re.split('[.!?]', pdf_text)

    return pdf_text, pdf_sentences

def enter_sentences(paper, uid):
    # read in pdf text and split into sentences
    _, sentences = get_pdf_text(paper["url"])
    id_iterable = 0

    # save each sentence
    for sentence in sentences:
        paper_sentences_col.add(
            documents=[sentence],
            metadatas={
                "title": paper["title"],
                "authors": json.dumps(paper["authors"]),
                "publication_year": paper["year"],
                "journal_name": paper["journal"],
                "place": "MISSING"
            },
            ids=f"{uid}_{id_iterable}"
        )
        id_iterable += 1


with open("papers.json", "r") as f:
    paper_data = json.load(f)

len_papers= len(paper_data)
print("Num. of papers", len_papers)

for idx, i in enumerate(paper_data[:2]):
    # generate unique id per paper
    uid = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for i in range(6))

    # save sentences 
    enter_sentences(i, uid)
    print(f"{idx} / {len_papers}")

print(paper_sentences_col.get())