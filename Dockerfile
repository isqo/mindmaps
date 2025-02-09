FROM python:3.11.11-slim-bookworm

RUN apt-get update && apt-get install

RUN apt-get install -y \
  dos2unix \
  libpq-dev \
  libmariadb-dev-compat \
  libmariadb-dev \
  gcc \
  && apt-get clean

RUN python -m pip install --upgrade pip

COPY . .
COPY requirements.txt requirements.txt
COPY entrypoint.sh entrypoint.sh
RUN python -m pip install -r requirements.txt
    RUN pip install psycopg2-binary

#CMD ["gunicorn"  , "-b", "0.0.0.0:8000","--timeout","120","--workers","5",	"app:app"] \

#CMD ["python"  , "app.py"]
#waitress-serve --host 127.0.0.1 --port 5000 app:app

CMD ["waitress-serve", "--host", "0.0.0.0", "--port", "8000", "app:app"]
