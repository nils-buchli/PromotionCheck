from extentions import db

class User(db.Model): 
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255))
    password = db.Column(db.String(255))

    def __repr__(self):
        return f"<{self.name}>"