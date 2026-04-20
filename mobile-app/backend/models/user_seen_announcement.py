from extentions import db

class UserSeenAnnouncement(db.Model):
    __tablename__ = "user_seen_announcements"

    id              = db.Column(db.String(255), primary_key=True)
    user_id         = db.Column(db.String(255), db.ForeignKey("users.id"), nullable=False)
    announcement_id = db.Column(db.String(255), db.ForeignKey("announcements.id"), nullable=False)

    def __repr__(self):
        return f"<Seen {self.announcement_id} by {self.user_id}>"