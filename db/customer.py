from flask_login import UserMixin

from db.db import db_cursor


class Customer(UserMixin):
    def     __init__(self, user_id, name, email, profile_pic, created_timestamp, premium):
        self.id = user_id
        self.user_id = user_id
        self.name = name
        self.email = email
        self.profile_pic = profile_pic
        self.created_timestamp = created_timestamp
        self.premium = premium

    @staticmethod
    def get(user_id):

        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM customer WHERE user_id = %s", (user_id,)
            )
            customer=cur.fetchone()
            if not customer:
                return None

        customer = Customer(
            user_id=customer[1], name=customer[2], email=customer[3], profile_pic=customer[4], created_timestamp= customer[5], premium=customer[6]
         )
        return customer

    @staticmethod
    def create(user_id, name, email, profile_pic):
        with db_cursor() as cur:
            cur.execute(
                "INSERT INTO customer (user_id, name, email, profile_pic) "
                "VALUES (%s, %s, %s, %s)",
                (user_id, name, email, profile_pic),
            )