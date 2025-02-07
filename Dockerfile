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

CMD ["gunicorn"  , "-b", "0.0.0.0:80","--timeout","120","--workers","5",	"app:app"]