import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import boto3

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root@127.0.0.1:3306/cs180_project'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    bio = db.Column(db.String(200), nullable=True)
    profile_picture = db.Column(db.String(200), nullable=True)

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

    def __init__(self, user_id, picture_link):
        self.user_id = user_id
        self.picture_link = picture_link
class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Posts
        load_instance = True

post_schema = PostSchema()
posts_schema = PostSchema(many=True)

@app.route('/add_post', methods=['POST'])
def add_post():
    user_id = request.json['user_id']
    picture_link = request.json['picture_link']

    post = Posts(user_id, picture_link)
    db.session.add(post)
    db.session.commit()
    return post_schema.jsonify(post)

@app.route('/get_posts/<id>/', methods=['GET'])
def get_user_posts(id):
    all_posts = Posts.query.filter_by(user_id=id).all()
    results = posts_schema.dump(all_posts)
    return jsonify(results)

@app.route('/get', methods=['GET'])
def get_users():
    all_users = Users.query.all()
    results = users_schema.dump(all_users)
    return jsonify(results)

@app.route('/get/<id>/', methods=['GET'])
def get_user_profile(id):
    user = Users.query.get(id)
    return user_schema.jsonify(user)

@app.route('/update/<id>/', methods=['POST'])
def update_user_profile(id):
    user = Users.query.get(id)
    fullname = request.json['fullname']
    username = request.json['username']
    bio = request.json['bio']
    profile_picture = request.json['profile_picture']

    user.fullname = fullname
    user.username = username
    user.bio = bio
    user.profile_picture = profile_picture

    db.session.commit()
    return user_schema.jsonify(user)

@app.route('/add', methods=['POST'])
def add_user():
    fullname = request.json['fullname']
    username = request.json['username']
    password = request.json['password']

    users = Users(fullname, username, password)
    db.session.add(users)
    db.session.commit()
    return user_schema.jsonify(users)

@app.route('/delete/<id>/', methods=['DELETE'])
def delete_user(id):
    user = Users.query.get(id)
    db.session.delete(user)
    db.session.commit()
    return user_schema.jsonify(user)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)