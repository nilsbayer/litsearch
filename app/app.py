from flask import Flask, jsonify, render_template, flash, url_for, redirect, request, abort, send_from_directory, session
from flask_bcrypt import Bcrypt
import os
import PyPDF2
import requests
from dotenv import load_dotenv, find_dotenv
from sentence_transformers import SentenceTransformer, util
import numpy as np
import re
import math
import time
import secrets
import chromadb
from chromadb.config import Settings
import chromadb
from time import perf_counter
import json
from pymongo import MongoClient
from datetime import datetime

if not os.path.exists(os.path.join("pdfs")):
    os.mkdir("pdfs")

app = Flask(__name__, static_url_path="/")

load_dotenv(find_dotenv())
app.config["SECRET_KEY"] = os.getenv("APP_PWD")

bcrypt = Bcrypt(app)

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

# Get connection to Mongo Database
DB_URI = os.getenv("DB_URI")
mongo_client = MongoClient(DB_URI)
# client = MongoClient(
#           host='test_mongodb',
#           port=27017,
#           username='root',
#           password='pass', 
#           authSource="admin")    
mongo_db = mongo_client.get_database("users")
users_col = mongo_db["users"]

# sbert_model = SentenceTransformer('all-MiniLM-L6-v2')

# headers = {"Authorization": f"Bearer {os.getenv('HF_AUTH')}"}

# def create_tags(payload):
#     API_URL_TAGS = "https://api-inference.huggingface.co/models/fabiochiu/t5-base-tag-generation"
    
#     response = requests.post(API_URL_TAGS, headers=headers, json=payload)
#     return response.json()

# def summarize_text(payload):
#     API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
#     response = requests.post(API_URL, headers=headers, json=payload)
#     return response.json()


def get_pdf_text(pdf_path):
    # creating a pdf file object
    pdfFileObj = open(pdf_path, 'rb')
        
    # creating a pdf reader object
    pdf_reader = PyPDF2.PdfReader(pdfFileObj)

    # extract text
    total_text_list = []

    for i in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[i].extract_text()
        total_text_list.append(page_text)

    pdf_text = " ".join(total_text_list)
    pdfFileObj.close()

    return pdf_text

all_text_together = ""
emb_sentences = []

from forms import FileUploadForm, SubjectSearchForm, SurveyCreationForm, LoginForm, SignUpForm, DescriptionForm, EditorForm, newPaperForm

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

def get_paragraph(result_id):
    found_idx = int(result_id.split("_")[1])

    next_idxs = [found_idx+i for i in range(1,6)]
    before_idx = [found_idx - 1]
    query_idx_list = before_idx + next_idxs

    queryable_idxs = [f"{result_id.split('_')[0]}_{i}" for i in query_idx_list]

    after_sentences = collection.get(ids=queryable_idxs[2:]).get("documents")
    try:
        before_sentence = collection.get(ids=queryable_idxs[0]).get("documents")[0]
    except:
        before_sentence = ""
    found_sentence = collection.get(ids=queryable_idxs[1]).get("documents")[0]

    paragraph = ".".join(after_sentences)
    paragraph = paragraph.replace("  ", "")
    return before_sentence, found_sentence, paragraph

@app.route("/", methods=["GET"])
def index():
    form = SubjectSearchForm()

    if "email" in session:
        log_status = True
        user_projects = users_col.distinct("projects", {"email": session["email"]})
        if len(user_projects) > 3:
            recent_projects = user_projects[:3]
        else:
            recent_projects = user_projects
    else:
        recent_projects = None
        log_status = False

    args = request.args
    if len(args.getlist("search")) > 0:
        search_term = args.getlist("search")[0]

        start_time = perf_counter()
        # Query the collection
        results = collection.query(
            query_texts=search_term,
            n_results=20
        )

        results_to_show = []
        
        for i in range(20):
            id_for_paragraph = results.get("ids")[0][i]
            authors = json.loads(results.get("metadatas")[0][i].get("authors"))
            if len(authors) == 1:
                authors = authors[0]
            else:
                authors = " & ".join(authors)
            year = results.get("metadatas")[0][i].get("publication_year")
            title = results.get("metadatas")[0][i].get("title")
            before, actual_found, paragraph = get_paragraph(id_for_paragraph)
            _ = {
                "before_text": before,
                "found_text": actual_found,
                "after_text": paragraph,
                "authors": authors,
                "year": year,
                "title": title
            }
            results_to_show.append(_)
        
        print("****************** Results ready to show in", perf_counter() - start_time, "*******************")

        return render_template("results.html", results=results_to_show, logged_in=True)
    else:
        return render_template("index.html", form=form, recent_projects=recent_projects, logged_in=log_status)

@app.route("/signup/<string:package>", methods=["GET", "POST"])
def signup(package):
    form = SignUpForm()

    package_list = ["smart-student", "freshman", "graduater"]

    if request.method == "GET":
        if package in package_list:
            package = package
        else:
            return redirect(url_for("explain_quicklit"))

    if "email" in session:
        # User is already logged in 
        return redirect(url_for("index"))

    if form.validate_on_submit():
        user = users_col.find_one({"email": form.email.data})
        if user:
            flash("Email is already in use.")
            return redirect(url_for("signup", package=package))

        if form.package.data not in package_list:
            return redirect(url_for("explain_quicklit"))
        
        if form.package.data != "freshman":
            days_to_paid = 0
        else:
            days_to_paid = None

        hashed_pwd = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user_data = {
            "full_name": form.full_name.data,
            "email": form.email.data,
            "password": hashed_pwd,
            "package": form.package.data,
            "institution": None,
            "stripe_cus_id": "cus_1236767",
            "stripe_subscription_id": "sub_12345346",
            "sign_up_date": datetime.now(),
            "days_to_paid": days_to_paid,
            "projects": [],
            "papers": []
        }
        users_col.insert_one(user_data)

        flash("You successfully created an account!<br> Please login now.")
        return redirect(url_for("login"))

    if request.method == "GET":
        return render_template("signup.html", search_available=False, form=form, package=package, logged_in=False)

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()

    if "email" in session:
        # User is already logged in 
        return redirect(url_for("index"))


    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user_found = users_col.find_one({"email": email})
        if user_found:
            email_val = user_found['email']
            passwordcheck = user_found['password']
            
            if bcrypt.check_password_hash(passwordcheck, password):
                session["email"] = email_val
                flash("Welcome! You logged in successfully.")
                return redirect(url_for("index"))
            else:
                if "email" in session:
                    return redirect(url_for("index"))
                # Wrong password
                flash("Login failed. Please check your email and password")
                return redirect(url_for("login"))
        else:
            message = 'Email not found'
            flash("Email was not found")
            return redirect(url_for("login"))

    return render_template("login.html", search_available=False, form=form, logged_in=False)

@app.route("/logout")
def logout():
    if "email" in session:
        session.pop("email", None)
    flash("You logged out successfully.")
    return redirect(url_for("login"))

@app.route("/your-account")
def your_account():
    if "email" in session:
        # Pulling user's data
        users_data = users_col.find_one({"email": session["email"]})
        packages = {
            "freshman": "Freshman",
            "smart-student": "Smart Student",
            "graduater": "Graduater"
        }
        current_package = packages.get(users_data.get("package"))

        data_to_send = {
            "email": users_data.get("email"),
            "name": users_data.get("full_name"),
            "package": current_package,
            "user_since": users_data.get("sign_up_date").strftime("%d.%m.%Y"),
        }

        return render_template("account.html", user=data_to_send)
    else:
        return redirect(url_for("index"))

@app.route("/what-is-quicklit")
def explain_quicklit():
    if "email" in session:
        logged_in = True
    else:
        logged_in = False
    return render_template("what_is_quicklit.html", logged_in=logged_in)

@app.route("/upload-your-paper", methods=["POST", "GET"])
def upload():
    form = FileUploadForm()

    if "email" in session:
        logged_in = True
    else:
        logged_in = False

    if form.validate_on_submit():
        # Saving the uploaded PDFs
        recently_uploaded = []
        for every_file in form.files.data:
            every_file.save(os.path.join("pdfs", every_file.filename))
            recently_uploaded.append(os.path.join("pdfs", every_file.filename))
        
        pdfs_content_list = []
        for recent_pdf in recently_uploaded:
            # Reading the pdf files
            pdf_content = get_pdf_text(recent_pdf)
            pdfs_content_list.append(pdf_content)

            # Delete the files
            os.remove(recent_pdf)
        global all_text_together
        all_text_together = " ".join(pdfs_content_list)
        all_text_together = re.sub("\n", "", all_text_together)
        global all_text_together_sentences
        all_text_together_sentences = all_text_together.split(".")

        if len(all_text_together_sentences) > 50:
            turns = int(math.ceil(len(all_text_together_sentences) / 50))
            start_num = 0
            end_num = 50
            summary_list = []
            tags_list = []
            for iteration in range(turns):
                print(iteration, "/", turns)
                all_text_together = " ".join(all_text_together_sentences[start_num:end_num])
                tags = create_tags({"inputs": all_text_together})[0]["generated_text"]
                summary = summarize_text({"inputs": "summarize: "+all_text_together})[0]["summary_text"]
                summary_list.append(summary)
                tags_list.append(tags)
                start_num += 50
                end_num += 50
                time.sleep(.5)

            total_summaries = " ".join(summary_list)
            all_tags = " ".join(tags_list)
            tags = create_tags({"inputs": all_tags})[0]["generated_text"]
            tags = tags.split(",")
            summary = summarize_text({"inputs": "summarize: "+total_summaries})[0]["summary_text"]

        else:
            tags = create_tags({"inputs": all_text_together})[0]["generated_text"]
            tags = tags.split(",")
            summary = summarize_text({"inputs": "summarize: "+all_text_together})[0]["summary_text"]

        return render_template("custom_paper.html", total_text = all_text_together, tags=tags, summary=summary, logged_in=logged_in)
    return render_template("upload.html", form=form, search_available=True, logged_in=logged_in)

@app.route("/my-projects", methods=["POST", "GET"])
def create_survey():
    form = SurveyCreationForm()

    if "email" not in session:
        return render_template("projects_info.html", form=form, search_available=True, logged_in=False) # user should see what a project can do / give already description and then being show that they need to sign up --> loss aversion
    
    else:
        if form.validate_on_submit():
            description = form.description.data
            project_name = form.name.data
            existing_projects = users_col.find_one({"email": session["email"]}).get("projects")
            if len(existing_projects) > 0:
                for project in existing_projects:
                    if project_name == project.get("project_name"):
                        flash("Project name taken. You already have a project called like this.")
                        return redirect(url_for("create_survey"))
            
            project_token = secrets.token_hex(10)
            project_data = {
                "project_name": project_name,
                "token": project_token,
                "description": description,
                "found_papers": [],
                "saved_papers": [],
                "potential_questions": [],
                "creation_date": datetime.now()
            }
            users_col.update_one(
                {"email": session["email"]},
                { "$push": { "projects": project_data } }
            )

            return redirect(url_for("get_project", project_token=project_token))

        else:
            # current_user = users_col.find_one({"email": session["email"]})
            # users_projects = current_user.get("projects")
            users_projects = users_col.distinct("projects", {"email": session["email"]})

            if len(users_projects) > 0:
                return render_template("project_overview.html", form=form, search_available=True, users_projects=users_projects, logged_in=True)

            return render_template("create_survey.html", form=form, search_available=True, logged_in=True)


@app.route("/project/<string:project_token>")
def get_project(project_token):
    if "email" not in session:
        return redirect(url_for("login"))

    form = DescriptionForm()

    user_data = users_col.find_one({"email": session["email"]})
    user_projects = user_data.get("projects")

    for project in user_projects:
        if project.get("token") == project_token:
            this_project = project

    for paper in user_data.get("papers"):
        if paper.get("connected_project") == project_token:
            connected_paper = paper
        else:
            connected_paper = None
    
    # project = {
    #     "title": "Bachelor Thesis ESB",
    #     "found_papers": [
    #         {
    #             "title": "Attention is all you need",
    #             "explanatory_paragraph": "lorem ipsum...",
    #             "link": "http://localhost:5000/paper/asd"
    #         },
    #         {
    #             "title": "Attention is all you need",
    #             "explanatory_paragraph": "lorem ipsum...",
    #             "link": "http://localhost:5000/paper/asd"
    #         },
    #         {
    #             "title": "Attention is all you need",
    #             "explanatory_paragraph": "lorem ipsum...",
    #             "link": "http://localhost:5000/paper/asd"
    #         }
    #     ],
    #     "description": "I want to investigate ...",
    #     "literature": [
    #         {
    #             "title": "Successfull business leaders",
    #             "explanatory_paragraph": "lorem ipsum...",
    #             "link": "http://localhost:5000/paper/asd"
    #         }
    #     ]
    # }
    return render_template("project.html", editor_paper=connected_paper, form=form, project=this_project, search_available=True, logged_in=True)

@app.route("/paper/<string:paper_token>")
def get_paper(paper_token):
    if not paper_token:
        print("no token set")
        abort(404)

    if "email" in session:
        logged_in=True
    else:
        logged_in=False

    paper = {
        "title": "Attention is all you need",
        "summary": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit officiis veniam voluptatem culpa earum, deserunt rem quibusdam ab, obcaecati unde ea sequi. Autem, illo! Tenetur a omnis placeat repellat nemo? Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit officiis veniam voluptatem culpa earum, deserunt rem quibusdam ab, obcaecati unde ea sequi. Autem, illo! Tenetur a omnis placeat repellat nemo Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit officiis veniam voluptatem culpa earum, deserunt rem quibusdam ab, obcaecati unde ea sequi. Autem, illo! Tenetur a omnis placeat repellat nemo Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit officiis veniam voluptatem culpa earum, deserunt rem quibusdam ab, obcaecati unde ea sequi. Autem, illo! Tenetur a omnis placeat repellat nemo",
        "APA_citation": "Gomez & Bayer, Attention is all you need, 2020, Journal of Love, Reutlingen",
        "similar_papers": [
            {
                "title": "Transformers",
                "link": "http://localhost:5000/paper/ABC"
            }
        ],
        "tags": ["Artificial Intelligence"],
        "link_pdf": "https://arxiv.org/pdf/1706.03762.pdf",
        "pdf_provider": "arxiv.org"
    }
    return render_template("paper.html", paper=paper, search_available=True, logged_in=logged_in)

@app.route("/editor/<string:paper_token>")
def editor(paper_token):
    form = EditorForm()
    if "email" in session:
        logged_in = True
        if paper_token == "overview":
            form = newPaperForm()
            # Query for projects
            user_data = users_col.find_one(
                {"email": session["email"]},
            )
            user_papers = user_data["papers"]
            if len(user_papers) == 0:
                user_papers = None

            return render_template("paper_overview.html", user_papers=user_papers, form=form, search_available=True, logged_in=logged_in)
        else:
            user_data = users_col.find_one(
                {"email": session["email"]},
            )
            user_papers = user_data.get("papers")
            for paper in user_papers:
                if paper.get("token") == paper_token:
                    this_project = paper

            return render_template("editor.html", paper=this_project, form=form, search_available=True, logged_in=logged_in)

    else:
        logged_in = False
    
    return render_template("editor.html", form=form, search_available=True, logged_in=logged_in)


"*****************************************                  POST REQUESTS                *******************************************************"

@app.route("/project/start-paper", methods=["POST"])
def start_paper():
    if request.method == "POST":
        project_token = request.get_json().get("project_token")
        project_name = request.get_json().get("project_name")

        paper_title = project_name + " - Paper"

        existing_papers = users_col.find_one({"email": session["email"]}).get("papers")
        if len(existing_papers) > 0:
            for paper in existing_papers:
                if paper_title == paper.get("title"):
                    paper_title = project_name + " - Paper (Copy)"
        
        paper_token = secrets.token_hex(10)
        paper_data = {
            "title": paper_title,
            "text": "",
            "token": paper_token,
            "references": [],
            "connected_project": project_token,
            "creation_date": datetime.now()
        }
        users_col.update_one(
            {"email": session["email"]},
            { "$push": { "papers": paper_data } }
        )

        return jsonify(
            {
                "message": "success",
                "url": url_for("editor", paper_token=paper_token)
            })
    return jsonify({"message": "error"})

@app.route("/editor/new-paper", methods=["POST"])
def new_paper():
    form = newPaperForm()
    if form.validate_on_submit():
        paper_title = form.paper_title.data
        project_token = form.project_token.data
        if project_token == "none":
            project_token = None
        existing_papers = users_col.find_one({"email": session["email"]}).get("papers")
        if len(existing_papers) > 0:
            for paper in existing_papers:
                if paper_title == paper.get("title"):
                    flash("Paper name taken. You already have a paper called like this.")
                    return redirect(url_for("create_survey"))
        
        paper_token = secrets.token_hex(10)
        paper_data = {
            "title": paper_title,
            "text": "",
            "token": paper_token,
            "references": [],
            "connected_project": project_token,
            "creation_date": datetime.now()
        }
        users_col.update_one(
            {"email": session["email"]},
            { "$push": { "papers": paper_data } }
        )

        return redirect(url_for("editor", paper_token=paper_token))

    return jsonify({"message": "error"})

topics = ["Artificial Intelligence", "Sustainability", "Medicine", "Marketing", "Finance", "Accounting", "Mechanical Engineering"]
papers = ["Attention is all you need", "Machine learning in medicine", "The power of linear regression"]
topics_and_papers = topics + papers

def find_n_largest(list_item, n):
    largest_idxs =[]
    for i in range(n):
        list_item = np.asarray(list_item)
        largest_val_idx = list_item.argmax()
        largest_idxs.append(largest_val_idx)
        list_item = list_item.tolist()
        del list_item[largest_val_idx]
    return largest_idxs

@app.route("/search", methods=["POST"])
def search():
    if request.method == "POST":
        emb_search = sbert_model.encode(request.get_json().get("current_search"))
        emb_results = sbert_model.encode(topics_and_papers)

        cos_sim = util.cos_sim(emb_search, emb_results).tolist()[0]
        results_to_send = []
        for x in find_n_largest(cos_sim, 5):
            if topics_and_papers[x] in topics:
                _ = {"item": topics_and_papers[x], "type": "topic"}
            elif topics_and_papers[x] in papers:
                _ = {"item": topics_and_papers[x], "type": "paper"}
            
            if _ not in results_to_send:
                results_to_send.append(_)

        return jsonify(results_to_send)

@app.route("/subject-search", methods=["POST"])
def subject_search():
    if request.method == "POST":
        emb_subject = sbert_model.encode(request.get_json().get("subject"))
        global emb_sentences

        top_sentence = util.cos_sim(emb_subject, emb_sentences)[0].argmax().item()
        following_sentences = top_sentence + 5
        if following_sentences:
            to_send = all_text_together_sentences[top_sentence:following_sentences]
            to_send = ". ".join(to_send)
        else:
            to_send = all_text_together_sentences[top_sentence:]
            to_send = ". ".join(to_send)

        return jsonify({"text": to_send})

@app.route("/encode-text", methods=["GET"])
def encode_text():
    global all_text_together_sentences
    global emb_sentences
    emb_sentences = sbert_model.encode(all_text_together_sentences)
    print("Done encoding")
    return "okay"

# Asyncronous routes
@app.route("/get-projects-papers", methods=["POST"])
def get_projects_papers():

    saved_papers = [
        {
            "distance": 3.78,
            "title": "Attention is all you need",
            "token": "asd"
        }
    ]
    return jsonify({"saved_papers": saved_papers})

@app.route("/update-project-desc", methods=["POST"])
def update_project_desc():
    if request.method == "POST":
        if "email" in session:
            new_desc = request.get_json().get("description_text")
            project_token = request.get_json().get("project_token")
            try:
                users_col.update_one(
                    {
                        "email": session["email"],
                        "projects": {"$elemMatch": {"token": project_token}}
                    },
                    {"$set": {"projects.$.description": new_desc}}
                )
                return jsonify(
                    {
                        "message": "OK",
                        "new_desc": new_desc,
                        "notification": "Description updated successfully."
                    }
                )
            except:
                print("Failed update")
                return jsonify(
                    {
                        "message": "error",
                    }
                )
        
        return jsonify({"error": "Not logged in"})

    return jsonify({"error": "Wrong method"})

@app.route("/analyse-editor-text", methods=["POST"])
def analyse_editor_text():
    if request.method == "POST":
        form = EditorForm()
        last_sentence = request.get_json().get("last_sentence")
        last_2_sentences = request.get_json().get("last_2_sentences")

        # Query chromadb
        results = collection.query(
            query_texts=last_sentence,
            n_results=10
        )

        results_to_show = []

        for i in range(10):
            id_for_paragraph = results.get("ids")[0][i]
            authors = json.loads(results.get("metadatas")[0][i].get("authors"))
            if len(authors) == 1:
                authors = authors[0]
            else:
                authors = authors[0] + " et. al."
            year = results.get("metadatas")[0][i].get("publication_year")
            title = results.get("metadatas")[0][i].get("title")
            before, actual_found, paragraph = get_paragraph(id_for_paragraph)
            _ = {
                "paragraph": before + ". " + actual_found + ". " + paragraph,
                "title": title,
                "auth_year": authors + ", " + str(year)
            }
            results_to_show.append(_)

        return jsonify({
            "message": "success",
            "results": results_to_show
        })
    # else:
    #     return jsonify({"message": "Error. Form was not valid."})
    else:
        return jsonify({"message": "Error. Wrong method."})

@app.route("/editor/save", methods=["POST"])
def save_paper():
    if "email" not in session:
        abort(403)

    if request.method == "POST":
        new_text = request.get_json().get("paper_text")
        paper_token = request.get_json().get("paper_token")

        try:
            users_col.update_one(
                {
                    "email": session["email"],
                    "papers": {"$elemMatch": {"token": paper_token}}
                },
                {"$set": {"papers.$.text": new_text}}
            )

            return jsonify({"message": "success"})

        except:
            return jsonify({"message": "error update"})

    return jsonify({"message": "error"})