from flask_login import UserMixin

from db.db import db_cursor


class Customer(UserMixin):
    def     __init__(self, google_user_id, name, email, profile_pic):
        self.id = google_user_id
        self.google_user_id = google_user_id
        self.name = name
        self.email = email
        self.profile_pic = profile_pic

    @staticmethod
    def get(google_user_id):

        with db_cursor() as cur:
            cur.execute(
                "SELECT * FROM customer WHERE google_user_id = %s", (google_user_id,)
            )
            customer=cur.fetchone()

            if not customer:
                return None

        customer = Customer(
            google_user_id=customer[1], name=customer[2], email=customer[3], profile_pic=customer[4]
        )
        return customer

    @staticmethod
    def create(google_user_id, name, email, profile_pic):
        with db_cursor() as cur:
            cur.execute(
                "INSERT INTO customer (google_user_id, name, email, profile_pic) "
                "VALUES (%s, %s, %s, %s)",
                (google_user_id, name, email, profile_pic),
            )