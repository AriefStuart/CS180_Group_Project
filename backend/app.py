import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import base64

app = Flask(__name__)

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

    def __init__(self, fullname, username, password, bio=None):
        self.fullname = fullname
        self.username = username
        self.password = password
        self.bio = bio

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Users
        load_instance = True

user_schema = UserSchema()
users_schema = UserSchema(many=True)

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

    user.fullname = fullname
    user.username = username
    user.bio = bio

    db.session.commit()
    return user_schema.jsonify(user)

@app.route('/add', methods=['POST'])
def add_user():
    fullname = request.json['fullname']
    username = request.json['username']
    password = request.json['password']

    users = Users(fullname, username, password, None)
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