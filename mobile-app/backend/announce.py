# scripts/announce.py
from dotenv import load_dotenv
load_dotenv('/etc/pluspoints.env')

import sys
import uuid
from datetime import datetime

sys.path.append('.') 

from extentions import db
from models import Announcement
from app import app

def create(title, message, type_='info'):
    with app.app_context():
        db.session.add(Announcement(
            id=str(uuid.uuid4()),
            title=title,
            type=type_,
            message=message,
            active=True,
            created_at=datetime.utcnow()
        ))
        db.session.commit()
        print(f"Announcement '{title}' created.")

def deactivate(announcement_id):
    with app.app_context():
        a = Announcement.query.filter_by(title=announcement_id).first()
        if not a:
            print("Not found.")
            return
        a.active = False
        db.session.commit()
        print(f"Announcement '{a.title}' deactivated.")

def list_all():
    with app.app_context():
        for a in Announcement.query.order_by(Announcement.created_at.desc()).all():
            status = "active" if a.active else "not active"
            print(f"[{status}] {a.id[:8]}…  {a.type:<8}  {a.title}")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else None

    if cmd == "create":
        # [file] create "title" "msg" [update|legal|info]
        create(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else 'info')
    elif cmd == "deactivate":
        # [file] deactivate id
        deactivate(sys.argv[2])
    elif cmd == "list":
        list_all()
    else:
        print("Usage: announce.py [create|deactivate|list]")