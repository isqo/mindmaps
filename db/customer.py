from flask_login import UserMixin

from db.db import db_cursor


class Customer(UserMixin):
    def __init__(self, user_id, name, email, profile_pic, created_timestamp, premium, origin):
        self.id = user_id
        self.user_id = user_id
        self.name = name
        self.email = email
        self.profile_pic = profile_pic
        self.created_timestamp = created_timestamp
        self.premium = premium
        self.origin = origin

    @staticmethod
    def get(user_id):

        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM customer WHERE user_id = %s", (user_id,)
            )
            customer = cur.fetchone()
            if not customer:
                return None

        customer = Customer(
            user_id=customer[1], name=customer[2], email=customer[3], profile_pic=customer[4],
            created_timestamp=customer[5], premium=customer[6] , origin=customer[7]
        )
        return customer

    @staticmethod
    def getDict(user_id):

        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM customer WHERE user_id = %s", (user_id,)
            )
            row = cur.fetchone()
            if not row:
                return None

        dictionary = {}

        dictionary["user_id"] = row[1]
        dictionary["name"] = row[2]
        dictionary["email"] = row[3]
        dictionary["profile_pic"] = row[4]
        dictionary["created_timestamp"] = row[5]
        dictionary["premium"] = row[6]
        dictionary["origin"] = row[7]

        return dictionary

    @staticmethod
    def create(user_id, name, email, profile_pic, origin):
        with db_cursor() as cur:
            cur.execute(
                "INSERT INTO customer (user_id, name, email, profile_pic, origin) "
                "VALUES (%s, %s, %s, %s %s)",
                (user_id, name, email, profile_pic, origin),
            )
