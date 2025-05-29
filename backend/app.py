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

class Friendship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

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

    if Users.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

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

@app.route('/friend-request/<int:receiver_id>', methods=['POST'])
def send_friend_request(receiver_id):
    # ID of user who sent the request
    requester_id = request.json['requester_id']

    # Check if a friendship already exists in either direction
    existing = Friendship.query.filter(
        ((Friendship.requester_id == requester_id) & (Friendship.receiver_id == receiver_id)) |
        ((Friendship.requester_id == receiver_id) & (Friendship.receiver_id == requester_id))
    ).first()

    # If a friendship or pending request already exists, return an error
    if existing:
        return jsonify({'error': 'You are already friends, or your request has already been sent'}), 400

    # Create a new friendship with status 'pending'
    friendship = Friendship(requester_id=requester_id, receiver_id=receiver_id, status='pending')
    db.session.add(friendship)
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Friend request sent'}), 201

@app.route('/friend-request/<int:requester_id>/accept', methods=['POST'])
def accept_friend_request(requester_id):
    # ID of user who sent the request
    receiver_id = request.json['receiver_id']

    # Find the pending friend request
    friendship = Friendship.query.filter_by(requester_id=requester_id, receiver_id=receiver_id, status='pending').first()
    if not friendship:
        return jsonify({'error': 'Request not found'}), 404

    # Update the status to 'accepted'
    friendship.status = 'accepted'
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Friend request accepted'}), 200

@app.route('/friend-request/<int:requester_id>/decline', methods=['POST'])
def decline_friend_request(requester_id):
    # ID of user who sent the request
    receiver_id = request.json['receiver_id']

    # Find the pending friend request
    friendship = Friendship.query.filter_by(requester_id=requester_id, receiver_id=receiver_id, status='pending').first()
    if not friendship:
        return jsonify({'error': 'Request not found'}), 404

    # Delete the pending friendship request
    db.session.delete(friendship)
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Friend request declined'}), 200

@app.route('/message/<int:receiver_id>', methods=['POST'])
def send_message(receiver_id):
    # ID of user who sent the message, and the content it holds
    sender_id = request.json['sender_id']
    content = request.json['content']

    # Check if users are friends
    friendship = Friendship.query.filter(
        ((Friendship.requester_id == sender_id) & (Friendship.receiver_id == receiver_id) & (Friendship.status == 'accepted')) |
        ((Friendship.requester_id == receiver_id) & (Friendship.receiver_id == sender_id) & (Friendship.status == 'accepted'))
    ).first()

    # If users are not friends, deny the message 
    if not friendship:
        return jsonify({'error': 'Users are not friends'}), 403

    # Create and save the message
    message = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
    db.session.add(message)
    db.session.commit()

    # Return a success message
    return jsonify({'message': 'Message sent'}), 201

@app.route('/feed/<int:user_id>', methods=['GET'])
def get_feed(user_id):
    # Query of all friends
    friendships = Friendship.query.filter(
        ((Friendship.requester_id == user_id) | (Friendship.receiver_id == user_id)) &
        (Friendship.status == 'accepted')
    ).all()

    # Create a set of friend user IDs
    friend_ids = set()
    for f in friendships:
        if f.requester_id == user_id:
            friend_ids.add(f.receiver_id)
        else:
            friend_ids.add(f.requester_id)

    # Get all posts from friends
    posts = Post.query.filter(Post.user_id.in_(friend_ids)).order_by(Post.timestamp.desc()).all()

    # Return posts in JSON format
    return jsonify([
        {'id': p.id, 'user_id': p.user_id, 'content': p.content, 'timestamp': p.timestamp} for p in posts
    ])
