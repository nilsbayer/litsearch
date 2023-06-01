import pickle

# print('Loading Embeddings!')
# print('************************')

#Load sentences & embeddings from disc
# with open('your_embeddings.pkl', "rb") as fIn:
#     stored_data = pickle.load(fIn)
#     stored_EID = stored_data['a']
#     stored_embeddings = stored_data['b']



print('Loading data!')
print('************************')

import json

with open("sentences.json", "r") as f:
    sentences = json.load(f)
with open("metadatas.json", "r") as f:
    metadatas = json.load(f)
with open("sentence_ids.json", "r") as f:
    sentence_ids = json.load(f)

print(f"Data length: sentences {len(sentences)} | metadatas {len(metadatas)} | ids {len(sentence_ids)}")
# import pandas as pd

# df_patent_meta = pd.read_csv('chroma.csv', nrows=6000000)


import chromadb
from chromadb.config import Settings

# Create a new Chroma client with persistence enabled. 
persist_directory = "chroma_with_Hamids_help"

client = chromadb.Client(
    Settings(
        persist_directory=persist_directory,
        chroma_db_impl="duckdb+parquet",
    )
)

# Start from scratch
client.reset()

# Create a new chroma collection
collection_name = "sentence_emb_1"
collection = client.create_collection(name=collection_name)
# Load the collection
collection = client.get_collection(collection_name)


# Define the batch size and read the data from a CSV file

print('Importing Embeddings and Meta data!')
print('************************')

# Add some data to the collection
collection.add(
    documents=sentences,
    metadatas=metadatas,
    ids=sentence_ids
)

client.persist()

print("Added successfully")
print("********************************")



# =======================================
import chromadb
from chromadb.config import Settings
import chromadb
chroma_client = chromadb.Client()

# Create a new Chroma client with persistence enabled. 
persist_directory = "chroma_with_Hamids_help"

client = chromadb.Client(
    Settings(
        persist_directory=persist_directory,
        chroma_db_impl="duckdb+parquet",
    )
)

# Create a new chroma collection
collection_name = "sentence_emb_1"
# Load the collection
collection = client.get_collection(collection_name)


# from sentence_transformers import SentenceTransformer, util
# model = SentenceTransformer('AI-Growth-Lab/PatentSBERTa')

# query_embedding = model.encode("This is a query document")

# Query the collection
results = collection.query(
    query_texts="impact of globalization",
    n_results=20
)

print(results)