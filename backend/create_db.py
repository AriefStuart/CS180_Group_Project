import pymysql
pymysql.install_as_MySQLdb()

from app import app, db

# Ensure this runs within the Flask app context
with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
