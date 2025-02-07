# http://flask.pocoo.org/docs/1.0/tutorial/database/
import os
from contextlib import contextmanager

import psycopg2.pool

dbpool = psycopg2.pool.ThreadedConnectionPool(host=os.environ.get('DB_HOST', "127.0.0.1"),
                                              port=os.environ.get('DB_PORT', 5432),
                                              dbname=os.environ.get('DB_NAME', "treemap"),
                                                  user=os.environ.get('DB_USER', "treemap_user"),
                                              password=os.environ.get('DB_PASSWORD', "treemap_password"),
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
