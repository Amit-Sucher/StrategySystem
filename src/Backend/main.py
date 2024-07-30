from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize the Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

# Initialize the database
db = SQLAlchemy(app)

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)

# Create the database and tables
with app.app_context():
    db.create_all()
    # Prepopulate the database with users
    if not User.query.first():
        users = [
            User(username='admin', password=generate_password_hash('adminpass', method='pbkdf2:sha256'), role='Admin'),
            User(username='scout_leader', password=generate_password_hash('leaderpass', method='pbkdf2:sha256'), role='Semi Admin'),
            User(username='scouter1', password=generate_password_hash('scouterpass1', method='pbkdf2:sha256'), role='Normal Scouter'),
            User(username='scouter2', password=generate_password_hash('scouterpass2', method='pbkdf2:sha256'), role='Super Scouter'),
            User(username='scouter3', password=generate_password_hash('scouterpass3', method='pbkdf2:sha256'), role='Pit Scouter')
        ]
        db.session.bulk_save_objects(users)
        db.session.commit()

# User login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['role'] = user.role
            return redirect(url_for('dashboard'))
        return 'Invalid credentials'
    users = User.query.all()
    return render_template('login.html', users=users)

# Dashboard route
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return f"Welcome {session['role']}"

# Logout route
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('role', None)
    return redirect(url_for('login'))

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)