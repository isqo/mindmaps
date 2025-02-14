from flask_login import UserMixin

from db.db import db_cursor


class Mindmap(UserMixin):
    def __init__(self, id, uuid, customer_id, title, description, map):
        self.id = id,
        self.uuid = uuid
        self.customer_id = customer_id
        self.title = title
        self.description = description
        self.map = map

    @staticmethod
    def getByUUID(uuid):
        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM mindmap WHERE mindmap.uuid = %s", (uuid,)
            )
            mindmap = cur.fetchone()

            if not mindmap:
                return None

            mindmap = Mindmap(
                id=mindmap[0], uuid=mindmap[1], customer_id=mindmap[2], title=mindmap[3], description=mindmap[4],
                map=mindmap[5]
            )
            return mindmap

    @staticmethod
    def getById(id):
        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM mindmap WHERE mindmap.id = %s", (id,)
            )
            mindmap = cur.fetchone()

            if not mindmap:
                return None

            mindmap = Mindmap(
                id=mindmap[0], uuid=mindmap[1], customer_id=mindmap[2], title=mindmap[3], description=mindmap[4],
                map=mindmap[5]
            )

        return mindmap

    @staticmethod
    def getAllByCustomerAndPrivacy(customer_id, private):
        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM mindmap WHERE customer_id = %s and private =  %s;", (customer_id, private,)
            )
            rows = cur.fetchall()

            if not rows:
                return None

            dictionaries = {}
            for row in rows:
                dictionary = {}
                dictionary["id"] = row[0]
                dictionary["uuid"] = row[1]
                dictionary["customer_id"] = row[2]
                dictionary["title"] = row[3]
                dictionary["description"] = row[4]
                dictionary["map"] = row[5]
                dictionaries[dictionary["id"]] = dictionary

            return dictionaries

    @staticmethod
    def getAll():
        with db_cursor() as cur:
            cur.execute(
                "SELECT M.id, uuid,customer_id,title, description,map,user_id,name,private " +
                "FROM Mindmap M LEFT JOIN customer C on M.customer_id = C.user_id WHERE private = false"
            )
            rows = cur.fetchall()

            if not rows:
                return None

            dictionaries = {}
            for row in rows:
                dictionary = {}
                dictionary["id"] = row[0]
                dictionary["uuid"] = row[1]
                dictionary["customer_id"] = row[2]
                dictionary["title"] = row[3]
                dictionary["description"] = row[4]
                dictionary["map"] = row[5]
                dictionary["user_id"] = row[6]
                dictionary["user_name"] = row[7]
                dictionaries[dictionary["id"]] = dictionary

            return dictionaries

    @staticmethod
    def getAllByCustomer(customer_id):
        with db_cursor() as cur:
            cur.execute(
                "SELECT M.id, uuid,customer_id,title, description,map,user_id,name, profile_pic FROM Mindmap M " +
                "LEFT JOIN customer C on M.customer_id = C.user_id " +
                "where customer_id = '%s' and private =  false" % (customer_id))

            rows = cur.fetchall()

            if not rows:
                return None

            dictionaries = {}
            for row in rows:
                dictionary = {}
                dictionary["id"] = row[0]
                dictionary["uuid"] = row[1]
                dictionary["customer_id"] = row[2]
                dictionary["title"] = row[3]
                dictionary["description"] = row[4]
                dictionary["map"] = row[5]
                dictionary["user_id"] = row[6]
                dictionary["user_name"] = row[7]
                dictionary["profile_pic"] = row[8]
                dictionaries[dictionary["id"]] = dictionary

            return dictionaries

    @staticmethod
    def get(customer_id, title):
        with db_cursor() as cur:
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
    def create(map_uuid, customer_id, title, description, map):
        with db_cursor() as cur:
            cur.execute(
                "INSERT INTO mindmap (uuid, customer_id, title, description, map) "
                "VALUES (%s, %s, %s, %s, %s)",
                (map_uuid, customer_id, title, description, map),
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

    @staticmethod
    def updateMapById(map, uuid):
        with db_cursor() as cur:
            cur.execute(
                "UPDATE mindmap "
                "SET     map = %s "
                "WHERE uuid = %s ",

                (map, uuid),
            )

    @staticmethod
    def updateInfo(uuid, title, description, customer_id):
        with db_cursor() as cur:
            cur.execute(
                "UPDATE mindmap "
                "SET     title = %s,"
                "     description = %s "
                "WHERE customer_id = %s "
                "AND  uuid = %s",
                (title, description, customer_id, uuid),
            )

    @staticmethod
    def remove(uuid):
        with db_cursor() as cur:
            cur.execute(
                "DELETE FROM mindmap WHERE uuid = %s",
                (uuid,)
            )

    @classmethod
    def getAllPrivate(cls, customer_id):
        with db_cursor() as cur:

            cur.execute(
                "SELECT * FROM mindmap WHERE customer_id = %s and private =  true;", (customer_id,)
            )
            rows = cur.fetchall()

            if not rows:
                return None

            dictionaries = {}
            for row in rows:
                dictionary = {}
                dictionary["id"] = row[0]
                dictionary["uuid"] = row[1]
                dictionary["customer_id"] = row[2]
                dictionary["title"] = row[3]
                dictionary["description"] = row[4]
                dictionary["map"] = row[5]
                dictionaries[dictionary["id"]] = dictionary

            return dictionaries

    @classmethod
    def setItPrivate(cls, uuid):
        with db_cursor() as cur:
            cur.execute(
                "UPDATE mindmap "
                "SET     private = true "
                "WHERE uuid = %s ",
                (uuid,),
            )
