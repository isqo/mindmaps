# Python standard libraries
import json
import os
import uuid

import requests
import stripe
# Third-party libraries
from flask import Flask, redirect, request, url_for, g, render_template, jsonify
from flask_jwt_extended import JWTManager
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient

from db.customer import Customer
from db.mindmap import Mindmap

# Internal imports


# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

# Stripe

stripe_keys = {
    "secret_key": os.environ["STRIPE_SECRET_KEY"],
    "publishable_key": os.environ["STRIPE_PUBLISHABLE_KEY"],
    "price_id": os.environ["STRIPE_PRICE_ID"],  # new
    "endpoint_secret": os.environ["STRIPE_ENDPOINT_SECRET"],  # new
}

stripe.api_key = stripe_keys["secret_key"]

# Flask app setup
app = Flask(__name__, static_url_path='/')
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)
jwt = JWTManager(app)

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)


@app.before_request
def before_request():
    if current_user.is_authenticated:
        g.user = current_user.get_id()
    else:
        g.user = None



# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return Customer.get(user_id)


@app.route("/config")
def get_publishable_key():
    stripe_config = {"publicKey": stripe_keys["publishable_key"]}
    return jsonify(stripe_config)


@app.route("/success")
def success():
    return render_template("success.html")


@app.route("/cancel")
def cancelled():
    return render_template("cancel.html")


@app.route("/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_keys["endpoint_secret"]
        )

    except ValueError as e:
        # Invalid payload
        return "Invalid payload", 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return "Invalid signature", 400

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        # Fulfill the purchase...
        handle_checkout_session(session)

    return "Success", 200


def handle_checkout_session(session):
    # here you should fetch the details from the session and save the relevant information
    # to the database (e.g. associate the user with their subscription)
    print("Subscription was successful.")


@app.route("/create-checkout-session")
def create_checkout_session():
    domain_url = "https://treemap.services/"
    stripe.api_key = stripe_keys["secret_key"]

    try:
        checkout_session = stripe.checkout.Session.create(
            # you should get the user id here and pass it along as 'client_reference_id'
            #
            # this will allow you to associate the Stripe session with
            # the user saved in your database
            #
            # example: client_reference_id=user.id,
            success_url=domain_url + "success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=domain_url + "cancel",
            payment_method_types=["card"],
            mode="subscription",
            line_items=[
                {
                    "price": stripe_keys["price_id"],
                    "quantity": 1,
                }
            ]
        )
        return jsonify({"sessionId": checkout_session["id"]})
    except Exception as e:
        return jsonify(error=str(e)), 403


@app.route("/")
def index():
    if current_user.is_authenticated:
        return render_template('treemap.html')
    else:
        return render_template('index.html')


@app.route("/gallery")
def gallery():
    return render_template('gallery.html')


@app.route("/user/profile")
def my_profile():
    return render_template('my_profile.html')

@app.route("/my-gallery")
@login_required
def myGallery():
    return render_template('mygallery.html')

@app.route("/premium")
def premium():
    return render_template('premium.html')

@app.route("/my-private")
@login_required
def myPrivate():
    return render_template('myprivate.html')


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


@app.route("/login")
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@app.route("/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")
    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))

    # Now that you have tokens (yay) let's find and hit the URL
    # from Google that gives you the user's profile information,
    # including their Google profile image and email
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    # You want to make sure their email is verified.
    # The user authenticated with Google, authorized your
    # app, and now you've verified their email through Google!
    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    # Create a user in your db with the information provided
    # by Google
    customer = Customer(
        google_user_id=unique_id, name=users_name, email=users_email, profile_pic=picture, premium=False,
        created_timestamp=None
    )
    # Doesn't exist? Add it to the database.
    if not Customer.get(google_user_id=unique_id):
        Customer.create(unique_id, users_name, users_email, picture)

    # Create the tokens we will be sending back to the user
    # access_token = create_access_token(identity=users_name)
    # refresh_token = create_refresh_token(identity=users_name)

    # Set the JWTs and the CSRF double submit protection cookies
    # in this response
    # resp = jsonify({'login': True})
    # set_access_cookies(resp, access_token)
    # set_refresh_cookies(resp, refresh_token)

    # Begin user session by logging the user in
    value = login_user(customer)
    print(value)
    # response = make_response(redirect(url_for("index")))
    # response.set_cookie('access_token', access_token)
    # response.set_cookie('refresh_token', refresh_token)
    return redirect(url_for("index"))


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route('/mindmap', methods=['POST'])
@login_required
def mindmap():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    map_uuid = request.args.get('uuid')
    map = json.dumps(request.json, separators=(',', ':'))

    if map_uuid:
        mindmap = Mindmap.getByUUID(map_uuid)
        if mindmap:
            Mindmap.updateMapById(map=map, uuid=map_uuid)
        else:
            title = "new map"
            description = "new description"
            Mindmap.create(map_uuid=map_uuid, customer_id=user_id, title=title, description=description, map=map)

    return "success"


@app.route('/mindmap/info', methods=['POST'])
def mindmap_info():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    data = request.get_json()
    map_uuid = request.args.get('uuid')
    description = None
    title = None
    if not map_uuid:
        raise Exception("map_id is mandatory")
    if 'title' in data:
        title = data["title"]
    if 'description' in data:
        description = data["description"]

    Mindmap.updateInfo(uuid=map_uuid, customer_id=user_id, title=title, description=description)

    return "success"


@app.route('/mindmap/info', methods=['GET'])
def get_mindmap_info():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    map_uuid = request.args.get('uuid')

    map = Mindmap.getByUUID(uuid=map_uuid)
    if map:
        return {"uuid": map_uuid, "title": map.title, "description": map.description}

    return {"uuid": map_uuid}


@app.route('/mindmaps/mine', methods=['GET'])
@login_required
def get_my_mindmaps():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    private = request.args.get('private')

    maps = Mindmap.getAllByCustomerAndPrivacy(customer_id=user_id, private=private)
    print(len(maps))
    if maps:
        return maps

    return {}

@app.route("/user/profile/<id>")
def profile(id):
    context = {
        'user_id': id
    }
    return render_template("profile.html", **context)

@app.route('/mindmaps', methods=['GET'])
def get_mindmaps():
    maps = Mindmap.getAll()
    if maps:
        return maps

    return {}

@app.route('/mindmaps/all', methods=['GET'])
def get_mindmaps_all():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    maps = Mindmap.getAllByCustomer(user_id)
    if maps:
        return maps

    return {}

@app.route('/mindmaps/all/<user_id>', methods=['GET'])
def get_mindmaps_all_by_customer(user_id):

    maps = Mindmap.getAllByCustomer(user_id)
    if maps:
        return maps

    return {}

@app.route('/user/premium', methods=['GET'])
@login_required
def isPremium():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id
    customer = Customer.get(user_id)
    premium = customer.premium
    if premium:
        g.premium = True
        return {"premium": True}
    else:
        g.premium = False
        return {"premium": False}


@app.route('/mindmaps/private', methods=['GET'])
@login_required
def get_mindmaps_private():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id
    data = isPremium()
    maps = {}
    if data['premium']:
        g.is_premium = True
        maps = Mindmap.getAllPrivate(user_id)
    return maps


@app.route('/mindmap/remove', methods=['DELETE'])
@login_required
def remove_mindmap():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    uuid = request.args.get('uuid')

    Mindmap.remove(uuid=uuid)

    return {}, 200


@app.route('/mindmap/clone', methods=['POST'])
@login_required
def clone_a_node():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    old_uuid = request.args.get('uuid')
    new_uuid = uuid.uuid4();

    mindMap = Mindmap.getByUUID(uuid=old_uuid)

    mindMap.map['id'] = str(new_uuid)

    Mindmap.create(map_uuid=str(new_uuid), customer_id=user_id, title=mindMap.title, description=mindMap.description,
                   map=json.dumps(mindMap.map))

    return {"uuid": new_uuid, "customer_id": user_id, "title": mindMap.title, "description": mindMap.description,
            "map": mindMap.map}, 200


@app.route('/mindmap/private', methods=['POST'])
@login_required
def make_it_private():
    user_id = None
    if current_user.is_authenticated:
        user_id = current_user.id

    uuid = request.args.get('uuid')

    Mindmap.setItPrivate(uuid=uuid)

    return "succeeded!", 200


if __name__ == "__main__":
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = "1"
    app.run(debug=True)
