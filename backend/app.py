import pymysql

pymysql.install_as_MySQLdb()

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import boto3

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root@127.0.0.1:3306/cs180_project"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

# Association table for the many-to-many relationship
friends_association = db.Table(
    "friends",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("friend_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    bio = db.Column(db.String(200), nullable=True)
    profile_picture = db.Column(db.String(200), nullable=True)

    # Many-to-Many relationship for friends
    friends = db.relationship(
        "Users",
        secondary=friends_association,
        primaryjoin=id == friends_association.c.user_id,
        secondaryjoin=id == friends_association.c.friend_id,
        backref="friend_of",
    )

    def __init__(self, fullname, username, password):
        self.fullname = fullname
        self.username = username
        self.password = password
        self.bio = None
        self.profile_picture = None


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Users
        load_instance = True


user_schema = UserSchema()
users_schema = UserSchema(many=True)


class Posts(db.Model):
    post_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    picture_link = db.Column(db.String(200), nullable=False)
    like_count = db.Column(db.Integer, default=0)

    def __init__(self, user_id, picture_link):
        self.user_id = user_id
        self.picture_link = picture_link
        self.like_count = 0


class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Posts
        load_instance = True


post_schema = PostSchema()
posts_schema = PostSchema(many=True)


class Likes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    post_id = db.Column(db.Integer, nullable=False)

    def __init__(self, user_id, post_id):
        self.user_id = user_id
        self.post_id = post_id


@app.route("/get_posts_for_user_and_friends/<user_id>", methods=["GET"])
def get_posts_for_user_and_friends(user_id):
    user = Users.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the user's friends
    friends = user.friends

    # Include the user's own posts and their friends' posts
    posts = Posts.query.filter(
        (Posts.user_id == user.id)
        | (Posts.user_id.in_([friend.id for friend in friends]))
    ).all()

    # Serialize the posts
    post_list = [
        {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "picture_link": post.picture_link,
            "like_count": post.like_count,
        }
        for post in posts
    ]

    return jsonify(post_list)


@app.route("/get_users_excluding_me", methods=["GET"])
def get_users_excluding_me():
    current_user_id = request.args.get(
        "user_id"
    )  # Pass the current user's ID as a query parameter
    current_user = Users.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    users = Users.query.all()
    user_list = []
    for user in users:
        if user.id != current_user.id:  # Exclude the current user
            user_list.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "isFriend": user
                    in current_user.friends,  # Check if the user is a friend
                }
            )

    return jsonify(user_list)


# Route to add a friend
@app.route("/add_friend/<user_id>/<friend_id>/", methods=["POST"])
def add_friend(user_id, friend_id):
    user = Users.query.get(user_id)
    friend = Users.query.get(friend_id)

    if not user or not friend:
        return jsonify({"error": "User or friend not found"}), 404

    if friend in user.friends:
        return jsonify({"message": "Already friends"}), 400

    user.friends.append(friend)
    db.session.commit()
    return jsonify({"message": f"{friend.username} added as a friend"}), 200


# Route to remove a friend
@app.route("/remove_friend/<user_id>/<friend_id>/", methods=["POST"])
def remove_friend(user_id, friend_id):
    user = Users.query.get(user_id)
    friend = Users.query.get(friend_id)

    if not user or not friend:
        return jsonify({"error": "User or friend not found"}), 404

    if friend not in user.friends:
        return jsonify({"message": "Not friends"}), 400

    user.friends.remove(friend)
    db.session.commit()
    return jsonify({"message": f"{friend.username} removed from friends"}), 200



# Route to get all friends of a user
@app.route("/get_friends/<user_id>/", methods=["GET"])
def get_friends(user_id):
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    friends = [
        {"id": friend.id, "username": friend.username} for friend in user.friends
    ]
    return jsonify(friends)


@app.route("/get_liked_posts/<user_id>", methods=["GET"])
def get_liked_posts(user_id):
    liked_posts = Likes.query.filter_by(user_id=user_id).all()
    liked_post_ids = [like.post_id for like in liked_posts]
    return jsonify(liked_post_ids)


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = Users.query.filter_by(username=username).first()
    if (
        user and user.password == password
    ):  # Replace with hashed password check if applicable
        return jsonify({"user_id": user.id}), 200
    return jsonify({"error": "Invalid username or password"}), 401


@app.route("/get_usernames", methods=["GET"])
def get_usernames():
    users = Users.query.all()
    usernames = [user.username for user in users]
    return jsonify(usernames)


# Route to toggle like/unlike for a post
@app.route("/toggle_like/<post_id>/<user_id>/", methods=["POST"])
def toggle_like(post_id, user_id):
    post = Posts.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # Check if the user has already liked the post
    like = Likes.query.filter_by(user_id=user_id, post_id=post_id).first()

    if like:
        # Unlike the post
        db.session.delete(like)
        post.like_count -= 1
        db.session.commit()
        return jsonify(
            {"post_id": post_id, "like_count": post.like_count, "liked": False}
        )
    else:
        # Like the post
        new_like = Likes(user_id=user_id, post_id=post_id)
        db.session.add(new_like)
        post.like_count += 1
        db.session.commit()
        return jsonify(
            {"post_id": post_id, "like_count": post.like_count, "liked": True}
        )


# Route to increment the like count for a post
@app.route("/like_post/<post_id>/", methods=["POST"])
def like_post(post_id):
    post = Posts.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    post.like_count += 1
    db.session.commit()
    return post_schema.jsonify(post)


# Route to decrement the like count for a post
@app.route("/unlike_post/<post_id>/", methods=["POST"])
def unlike_post(post_id):
    post = Posts.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if post.like_count > 0:
        post.like_count -= 1
        db.session.commit()
    return post_schema.jsonify(post)


# Route to get the like count for a specific post
@app.route("/get_like_count/<post_id>/", methods=["GET"])
def get_like_count(post_id):
    post = Posts.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404


@app.route("/add_post", methods=["POST"])
def add_post():
    user_id = request.json["user_id"]
    picture_link = request.json["picture_link"]

    post = Posts(user_id, picture_link)
    db.session.add(post)
    db.session.commit()
    return post_schema.jsonify(post)


@app.route("/get_posts/<id>/", methods=["GET"])
def get_user_posts(id):
    all_posts = Posts.query.filter_by(user_id=id).all()
    results = posts_schema.dump(all_posts)
    return jsonify(results)


@app.route("/get_posts", methods=["GET"])
def get_all_posts():
    all_posts = Posts.query.all()
    results = posts_schema.dump(all_posts)
    return jsonify(results)


@app.route("/get", methods=["GET"])
def get_users():
    all_users = Users.query.all()
    results = users_schema.dump(all_users)
    return jsonify(results)


@app.route("/get/<id>/", methods=["GET"])
def get_user_profile(id):
    user = Users.query.get(id)
    return user_schema.jsonify(user)


@app.route("/update/<id>/", methods=["POST"])
def update_user_profile(id):
    user = Users.query.get(id)
    fullname = request.json["fullname"]
    username = request.json["username"]
    bio = request.json["bio"]
    profile_picture = request.json["profile_picture"]

    user.fullname = fullname
    user.username = username
    user.bio = bio
    user.profile_picture = profile_picture

    db.session.commit()
    return user_schema.jsonify(user)


@app.route("/add", methods=["POST"])
def add_user():
    fullname = request.json["fullname"]
    username = request.json["username"]
    password = request.json["password"]

    users = Users(fullname, username, password)
    db.session.add(users)
    db.session.commit()
    return user_schema.jsonify(users)


@app.route("/delete/<id>/", methods=["DELETE"])
def delete_user(id):
    user = Users.query.get(id)
    db.session.delete(user)
    db.session.commit()
    return user_schema.jsonify(user)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
