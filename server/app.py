from flask import Flask
from flask_cors import CORS
from db_connections import init_app

# Import blueprints
from routes.auth import auth_bp
from routes.user import user_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/user")

# ------------------ Run Server ------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
