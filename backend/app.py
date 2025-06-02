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
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

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

@app.route('/api/messages', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    receiver_id = data['receiver_id']
    content = data['content']
    message = Message(sender_id=current_user.id, receiver_id=receiver_id, content=content)
    db.session.add(message)
    db.session.commit()
    
    return jsonify({'status': 'Message sent'})

@app.route('/api/messages/<int:friend_id>', methods=['GET'])
@login_required
def get_messages(friend_id):
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend_id)) |
        ((Message.sender_id == friend_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()
    
    return jsonify([{
        'sender_id': msg.sender_id,
        'receiver_id': msg.receiver_id,
        'content': msg.content,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages])

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
