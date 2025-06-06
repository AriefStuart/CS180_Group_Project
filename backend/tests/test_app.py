import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import app, db, Users, Posts, Likes


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Add a test user
            user = Users(fullname="Test User", username="testuser", password="testpass")
            db.session.add(user)
            db.session.commit()
        yield client
        with app.app_context():
            db.drop_all()


def test_get_counts(client):
    # The fixture creates a user with id=1 and no posts or friends
    response = client.get("/get_counts/1/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["user_id"] == 1 or data["user_id"] == "1"
    assert data["friend_count"] == 0
    assert data["post_count"] == 0

    # Add a post for the user
    client.post(
        "/add_post", json={"user_id": 1, "picture_link": "http://example.com/photo.jpg"}
    )
    response = client.get("/get_counts/1/")
    data = response.get_json()
    assert data["post_count"] == 1


def test_get_posts_for_user_and_friends(client):
    with app.app_context():
        # Add a friend user
        friend = Users(
            fullname="Friend User", username="frienduser", password="friendpass"
        )
        db.session.add(friend)
        db.session.commit()
        friend_id = friend.id

        # Add friend relationship
        user = Users.query.filter_by(username="testuser").first()
        user.friends.append(friend)
        db.session.commit()
        user_id = user.id

    # Add a post for the main user
    client.post(
        "/add_post",
        json={"user_id": user_id, "picture_link": "http://example.com/user_photo.jpg"},
    )
    # Add a post for the friend
    client.post(
        "/add_post",
        json={
            "user_id": friend_id,
            "picture_link": "http://example.com/friend_photo.jpg",
        },
    )

    # Get posts for user and friends
    response = client.get(f"/get_posts_for_user_and_friends/{user.id}")
    assert response.status_code == 200
    data = response.get_json()

    all_photos = [photo for group in data for photo in group["photos"]]
    assert "http://example.com/user_photo.jpg" in all_photos
    assert "http://example.com/friend_photo.jpg" in all_photos


def test_get_users_excluding_me(client):
    with app.app_context():
        # Add another user
        other = Users(fullname="Other User", username="otheruser", password="otherpass")
        db.session.add(other)
        db.session.commit()
        other_id = other.id

        # Get the test user from the fixture
        current_user = Users.query.filter_by(username="testuser").first()
        current_user_id = current_user.id

        # Add as friend
        current_user.friends.append(other)
        db.session.commit()

    # Call the endpoint as the current user
    response = client.get(f"/get_users_excluding_me?user_id={current_user_id}")
    assert response.status_code == 200
    data = response.get_json()
    # Should only contain the other user
    assert len(data) == 1
    assert data[0]["id"] == other_id
    assert data[0]["username"] == "otheruser"
    assert data[0]["isFriend"] is True


def test_add_friend(client):
    with app.app_context():
        # Create two users
        user1 = Users(fullname="User One", username="userone", password="pass1")
        user2 = Users(fullname="User Two", username="usertwo", password="pass2")
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        user1_id = user1.id
        user2_id = user2.id

    # Add user2 as a friend to user1
    response = client.post(f"/add_friend/{user1_id}/{user2_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert "added as a friend" in data["message"]

    # Verify the friendship in the database
    with app.app_context():
        user1 = Users.query.get(user1_id)
        user2 = Users.query.get(user2_id)
        assert user2 in user1.friends


def test_remove_friend(client):
    with app.app_context():
        # Create two users
        user1 = Users(fullname="User One", username="userone", password="pass1")
        user2 = Users(fullname="User Two", username="usertwo", password="pass2")
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        user1_id = user1.id
        user2_id = user2.id

        # Add user2 as a friend to user1
        user1.friends.append(user2)
        db.session.commit()

    # Remove user2 as a friend from user1
    response = client.post(f"/remove_friend/{user1_id}/{user2_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert "removed from friends" in data["message"]

    # Verify the friendship is removed in the database
    with app.app_context():
        user1 = Users.query.get(user1_id)
        user2 = Users.query.get(user2_id)
        assert user2 not in user1.friends


def test_get_friends(client):
    with app.app_context():
        # Create two users
        user1 = Users(fullname="User One", username="userone", password="pass1")
        user2 = Users(fullname="User Two", username="usertwo", password="pass2")
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        user1_id = user1.id
        user2_id = user2.id

        # Add user2 as a friend to user1
        user1.friends.append(user2)
        db.session.commit()

    # Call the endpoint to get friends of user1
    response = client.get(f"/get_friends/{user1_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert any(
        friend["id"] == user2_id and friend["username"] == "usertwo" for friend in data
    )


def test_get_liked_posts(client):
    with app.app_context():
        # Create a user and a post
        user = Users(fullname="Like Tester", username="liketester", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

        post = Posts(user_id=user_id, picture_link="http://example.com/photo.jpg")
        db.session.add(post)
        db.session.commit()
        post_id = post.post_id

        # Add a like
        like = Likes(user_id=user_id, post_id=post_id)
        db.session.add(like)
        db.session.commit()

    # Call the endpoint to get liked posts for the user
    response = client.get(f"/get_liked_posts/{user_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert post_id in data


def test_get_usernames(client):
    with app.app_context():
        user1 = Users(fullname="User One", username="userone", password="pass1")
        user2 = Users(fullname="User Two", username="usertwo", password="pass2")
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()

    response = client.get("/get_usernames")
    assert response.status_code == 200
    data = response.get_json()
    assert "userone" in data
    assert "usertwo" in data


def test_toggle_like(client):
    with app.app_context():
        # Create a user and a post
        user = Users(fullname="Like User", username="likeuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

        post = Posts(user_id=user_id, picture_link="http://example.com/photo.jpg")
        db.session.add(post)
        db.session.commit()
        post_id = post.post_id

    # Like the post
    response = client.post(f"/toggle_like/{post_id}/{user_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert str(data["post_id"]) == str(post_id)
    assert data["like_count"] == 1
    assert data["liked"] is True

    # Unlike the post
    response = client.post(f"/toggle_like/{post_id}/{user_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert str(data["post_id"]) == str(post_id)
    assert data["like_count"] == 0
    assert data["liked"] is False


def test_like_post(client):
    with app.app_context():
        # Create a user and a post
        user = Users(fullname="LikePost User", username="likepostuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

        post = Posts(user_id=user_id, picture_link="http://example.com/photo.jpg")
        db.session.add(post)
        db.session.commit()
        post_id = post.post_id

    # Like the post
    response = client.post(f"/like_post/{post_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert str(data["post_id"]) == str(post_id)
    assert data["like_count"] == 1


def test_unlike_post(client):
    with app.app_context():
        # Create a user and a post
        user = Users(
            fullname="UnlikePost User", username="unlikepostuser", password="pass"
        )
        db.session.add(user)
        db.session.commit()
        user_id = user.id

        post = Posts(user_id=user_id, picture_link="http://example.com/photo.jpg")
        db.session.add(post)
        db.session.commit()
        post_id = post.post_id

        # Like the post (increment like_count)
        post.like_count = 1
        db.session.commit()

    # Unlike the post
    response = client.post(f"/unlike_post/{post_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert str(data["post_id"]) == str(post_id)
    assert data["like_count"] == 0


def test_add_post_set(client):
    with app.app_context():
        # Create a user
        user = Users(fullname="Set User", username="setuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    picture_links = ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"]

    response = client.post(
        "/add_post_set", json={"user_id": user_id, "picture_links": picture_links}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2
    # All posts should have the same post_set_id and correct user_id
    post_set_ids = {post["post_set_id"] for post in data}
    assert len(post_set_ids) == 1
    for post in data:
        assert post["user_id"] == user_id
        assert post["picture_link"] in picture_links


def test_add_user(client):
    response = client.post(
        "/add", json={"fullname": "Alice", "username": "alice", "password": "alicepass"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["username"] == "alice"


def test_login_success(client):
    # User already added in fixture
    response = client.post(
        "/login", json={"username": "testuser", "password": "testpass"}
    )
    assert response.status_code == 200
    assert "user_id" in response.get_json()


def test_login_fail(client):
    response = client.post(
        "/login", json={"username": "testuser", "password": "wrongpass"}
    )
    assert response.status_code == 401


def test_get_user_profile(client):
    with app.app_context():
        # Create a user
        user = Users(fullname="Profile User", username="profileuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    response = client.get(f"/get/{user_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == user_id
    assert data["fullname"] == "Profile User"
    assert data["username"] == "profileuser"


def test_get_users(client):
    response = client.get("/get")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert any(u["username"] == "testuser" for u in data)


def test_add_post(client):
    # Add a post for the test user (id=1)
    response = client.post(
        "/add_post", json={"user_id": 1, "picture_link": "http://example.com/photo.jpg"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["picture_link"] == "http://example.com/photo.jpg"


def test_get_all_posts(client):
    with app.app_context():
        # Create a user
        user = Users(fullname="Posts User", username="postsuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

        # Create multiple posts
        post1 = Posts(user_id=user_id, picture_link="http://example.com/photo1.jpg")
        post2 = Posts(user_id=user_id, picture_link="http://example.com/photo2.jpg")
        db.session.add(post1)
        db.session.add(post2)
        db.session.commit()
        post1_id = post1.post_id
        post2_id = post2.post_id

    response = client.get("/get_posts")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    post_ids = [post["post_id"] for post in data]
    assert post1_id in post_ids
    assert post2_id in post_ids
    links = [post["picture_link"] for post in data]
    assert "http://example.com/photo1.jpg" in links
    assert "http://example.com/photo2.jpg" in links


def test_get_user_posts(client):
    # Add a post first
    client.post(
        "/add_post",
        json={"user_id": 1, "picture_link": "http://example.com/photo2.jpg"},
    )
    response = client.get("/get_posts/1/")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert any(post["picture_link"] == "http://example.com/photo2.jpg" for post in data)


def test_update_user_profile(client):
    with app.app_context():
        # Create a user
        user = Users(fullname="Old Name", username="oldusername", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    update_data = {
        "fullname": "New Name",
        "username": "newusername",
        "bio": "This is my new bio.",
        "profile_picture": "http://example.com/newpic.jpg",
    }

    response = client.post(f"/update/{user_id}/", json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == user_id
    assert data["fullname"] == "New Name"
    assert data["username"] == "newusername"
    assert data["bio"] == "This is my new bio."
    assert data["profile_picture"] == "http://example.com/newpic.jpg"


def test_delete_user(client):
    with app.app_context():
        # Create a user
        user = Users(fullname="Delete User", username="deleteuser", password="pass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    # Delete the user
    response = client.delete(f"/delete/{user_id}/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == user_id
    assert data["username"] == "deleteuser"

    # Ensure the user is deleted from the database
    with app.app_context():
        user = Users.query.get(user_id)
        assert user is None
