from extentions import db

class SubSubject(db.Model): 
    __tablename__ = "sub_subjects"

    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(255))
    weight = db.Column(db.Float)
    subject_id = db.Column(db.String(255)) 
    deleted = db.Column(db.Boolean)

    def to_dict(self): 
        return {
            "id": self.id, 
            "title": self.title, 
            "weight": self.weight, 
            "subject_id": self.subject_id, 
            "deleted": self.deleted
        }

    def __repr__(self):
        return f"<{self.title}>"