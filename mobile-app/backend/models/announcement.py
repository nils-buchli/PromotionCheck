from extentions import db

class Announcement(db.Model): 
    __tablename__ = "announcements"

    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(255))
    type = db.Column(db.String(255))
    message = db.Column(db.String(255))
    active = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id, 
            "title": self.title, 
            "type": self.type, 
            "message": self.message,
            "active": self.active, 
            "created_at": self.created_at
        } 

    def __repr__(self): 
        return f"<{self.title}>"