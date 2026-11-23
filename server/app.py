from flask import Flask, jsonify, request
from flask_cors import CORS
from db_connections import init_app
import config

# Import Blueprints
from routes.auth import auth_bp
from routes.user import user_bp
from routes.elections import elections_bp
from routes.candidates import candidates_bp
from routes.votes import votes_bp
from routes.address import address_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = config.SECRET_KEY

# Enable CORS for frontend clients
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# Initialize DB connection teardown
init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(elections_bp, url_prefix="")
app.register_blueprint(candidates_bp, url_prefix="")
app.register_blueprint(votes_bp, url_prefix="")
app.register_blueprint(address_bp, url_prefix="")

# Health check & API root
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "system": "Electronic Voting Machine (EVM) Core API",
        "version": "2.0.0",
        "timestamp": config.datetime.now().isoformat() if hasattr(config, 'datetime') else None
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

# Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": f"Endpoint not found: {request.path}"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": f"Method {request.method} not allowed on {request.path}"}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error. Please try again later."}), 500

# ------------------ Run Server ------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
