from flask_login import UserMixin

from db.db import db_cursor


class Mindmap(UserMixin):
    def __init__(self, id, customer_id, title, description, map):
        self.id = id,
        customer_id = customer_id
        self.title = title
        self.description = description
        self.map = map

    @staticmethod
    def get(customer_id, title):
        with db_cursor() as cur:
            print("SELECT * FROM Mindmap WHERE customer_id = %s AND title = %s")
            cur.execute(
                "SELECT * FROM Mindmap WHERE customer_id = %s AND title = %s", (customer_id, title)
            )
            mindmap = cur.fetchone()

            if not mindmap:
                return None

        mindmap = Mindmap(
            id=mindmap[0], customer_id=mindmap[1], title=mindmap[2], description=mindmap[3], map=mindmap[4]
        )

        return mindmap

    @staticmethod
    def create(customer_id, title, description, map):
        with db_cursor() as cur:
            cur.execute(
                "INSERT INTO mindmap (customer_id, title, description, map) "
                "VALUES (%s, %s, %s, %s)",
                (customer_id, title, description, map),
            )

    @staticmethod
    def updateMap(map, customer_id, title):
        with db_cursor() as cur:
            cur.execute(
                "UPDATE mindmap "
                "SET     map = %s "
                "WHERE customer_id = %s "
                "AND title = %s",
                (map, customer_id, title),
            )
