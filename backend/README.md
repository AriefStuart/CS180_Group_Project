# CS180_Group_Project Backend

This is the backend for the CS180_Group_Project, built using Flask and SQLite. The backend handles user operations and serves data to the frontend application.

## Project Structure

- **app.py**: The main entry point for the backend application. Initializes the Flask app and sets up routes.
- **database/**: Contains the database models and the SQLite database file.
  - **models.py**: Defines the database models using SQLAlchemy.
  - **db.sqlite3**: The SQLite database file that stores the application data.
- **routes/**: Contains the route definitions for the application.
  - **user_routes.py**: Handles user-related operations such as creating and updating user profiles.
- **requirements.txt**: Lists the Python dependencies required for the backend application.

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd CS180_Group_Project/backend
   ```

2. **Create a virtual environment** (optional but recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the required dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```
   python
   The backend will start running on `http://127.0.0.1:5000/` by default.

## Usage

- The backend provides RESTful APIs for user operations. You can access the endpoints defined in `user_routes.py` to create, retrieve, and update user profiles.
