FROM python:3.9

WORKDIR /app

COPY ./requirements.txt ./app/requirements.txt

RUN pip install --no-cache-dir -r ./app/requirements.txt

COPY . /app

CMD ["streamlit", "run", "main.py"]