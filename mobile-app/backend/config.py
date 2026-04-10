import os
from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI        = f"postgresql://nils:{os.environ.get('DB_PASSWORD')}@localhost/pluspointsdb"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY                 = os.environ.get("JWT_KEY")
    SECRET_KEY                     = os.environ.get("JWT_KEY")
    JWT_ACCESS_TOKEN_EXPIRES       = timedelta(days=14)
    BASE_DIR                       = os.path.abspath(os.path.dirname(__file__))
    DIST_DIR                       = os.path.join(BASE_DIR, "..", "frontend", "dist")