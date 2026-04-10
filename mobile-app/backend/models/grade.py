from extentions import db

class Grade(db.Model): 
    __tablename__ = "grades"

    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(255))
    mark = db.Column(db.Float)
    weight = db.Column(db.Float)
    date = db.Column(db.String(255))
    subject_id = db.Column(db.String(255))
    deleted = db.Column(db.Boolean)

    def to_dict(self): 
        return {
            "id": self.id, 
            "title": self.title, 
            "mark": self.mark, 
            "weight": self.weight, 
            "date": self.date, 
            "subject_id": self.subject_id, 
            "deleted": self.deleted
        }

    def __repr__(self):
        return f"<{self.title}>"