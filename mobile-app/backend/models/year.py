from extentions import db

class YearMap(db.Model): 
    __tablename__ = "years_map"

    id = db.Column(db.String(255), primary_key=True)
    user_id = db.Column(db.String(255))
    year_id = db.Column(db.String(255))

    def __repr__(self): 
        return f"<{self.user_id}<=>{self.year_id}>"

class Year(db.Model): 
    __tablename__ = "years"

    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(255))
    deleted = db.Column(db.Boolean)

    def to_dict(self):
        return {
            "id": self.id, 
            "title": self.title, 
            "deleted": self.deleted
        } 

    def __repr__(self): 
        return f"<{self.title}>"