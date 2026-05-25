#!/usr/bin/python 

import mimetypes
import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from config import Config
from extentions import db, jwt, socketio, redis_client
from models import *

def spa_file(path): 
    file_path = os.path.join(Config.DIST_DIR, path)

    if path and os.path.isfile(file_path):
        return send_from_directory(Config.DIST_DIR, path)

    return send_from_directory(Config.DIST_DIR, "index.html")

# Inits
mimetypes.add_type("application/wasm", ".wasm")

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

def create_app(): 
    app = Flask(__name__, static_folder=DIST_DIR , static_url_path="/")
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    allowed_origins = ["https://456-optiplex.ddns.net", "capacitor://localhost", "http://localhost", "https://localhost"]
    socketio.init_app(app, path="/socket.io", cors_allowed_origins=allowed_origins)

    CORS(app, origins=allowed_origins, supports_credentials=True)

    from routes.auth import auth_bp
    from routes.years import years_bp
    from routes.subjects import subjects_bp
    from routes.sub_subjects import sub_subjects_bp
    from routes.grades import grades_bp
    from routes.announcements import announcements_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(years_bp)
    app.register_blueprint(subjects_bp)
    app.register_blueprint(sub_subjects_bp)
    app.register_blueprint(grades_bp)
    app.register_blueprint(announcements_bp)

    from app_socket import events

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        file_path = os.path.join(DIST_DIR, path)
        if path and os.path.isfile(file_path):
            return send_from_directory(DIST_DIR, path)
        return send_from_directory(DIST_DIR, "index.html")
    
    return app 

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=False, host="0.0.0.0", port=5000)