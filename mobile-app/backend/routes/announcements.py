from flask import Blueprint, request
from models import Announcement, UserSeenAnnouncement 

announcements_bp = Blueprint("announcements", __name__)

import uuid
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Announcement, UserSeenAnnouncement
from extentions import db

announcements_bp = Blueprint("announcements", __name__)

@announcements_bp.route("/api/announcements", methods=["GET", "POST"])
@jwt_required()
def announcements():
    usr_id = get_jwt_identity()

    if request.method == "GET":
        seen_ids = db.session.query(UserSeenAnnouncement.announcement_id).filter(UserSeenAnnouncement.user_id == usr_id).subquery()

        pending = Announcement.query.filter(Announcement.active == True).filter(Announcement.id.not_in(seen_ids)).order_by(Announcement.created_at.asc()).all()

        return {"success": True, "data": [a.to_dict() for a in pending]}

    elif request.method == "POST":
        data            = request.get_json()
        announcement_id = data.get("id")

        if not announcement_id:
            return {"success": False, "msg": "invalidInput"}
        if not Announcement.query.filter_by(id=announcement_id, active=True).first():
            return {"success": False, "msg": "announcementNotFound"}

        already_seen = UserSeenAnnouncement.query.filter_by(
            user_id=usr_id, announcement_id=announcement_id
        ).first()

        if not already_seen:
            db.session.add(UserSeenAnnouncement(
                id=str(uuid.uuid4()),
                user_id=usr_id,
                announcement_id=announcement_id
            ))
            db.session.commit()

        return {"success": True}