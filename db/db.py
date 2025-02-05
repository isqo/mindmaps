# http://flask.pocoo.org/docs/1.0/tutorial/database/
from contextlib import contextmanager

import psycopg2.pool

DB_NAME = "treemap"
DB_USER = "treemap_user"
DB_PASS = "treemap_password"
DB_HOST = "localhost"
DB_PORT = "5432"

dbpool = psycopg2.pool.ThreadedConnectionPool(host=DB_HOST,
                                              port=DB_PORT,
                                              dbname=DB_NAME,
                                              user=DB_USER,
                                              password=DB_PASS,
                                              minconn=10,
                                              maxconn=50
                                              );


@contextmanager
def db_cursor():
    conn = dbpool.getconn()
    try:
        with conn.cursor() as cur:
            yield cur
            conn.commit()
    # You can have multiple exception types here.
    # For example, if you wanted to specifically check for the
    # 23503 "FOREIGN KEY VIOLATION" error type, you could do:
    # except psycopg2.Error as e:
    #     conn.rollback()
    #     if e.pgcode = '23503':
    #         raise KeyError(e.diag.message_primary)
    #     else
    #         raise Exception(e.pgcode)
    except:
        conn.rollback()
        raise
    finally:
        dbpool.putconn(conn)
