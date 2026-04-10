from extentions import db

class Subject(db.Model): 
    __tablename__ = "subjects"

    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(255))
    weight = db.Column(db.Float)
    year_id = db.Column(db.String(255))
    has_sub_subjects = db.Column(db.Boolean)
    deleted = db.Column(db.Boolean)

    def to_dict(self): 
        return {
            "id": self.id, 
            "title": self.title, 
            "weight": self.weight, 
            "year_id": self.year_id, 
            "has_sub_subjects": self.has_sub_subjects, 
            "deleted": self.deleted
        }

    def __repr__(self):
        return f"<{self.title}>"