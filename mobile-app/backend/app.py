import os
import mimetypes
import uuid
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_jwt_extended import JWTManager
from datetime import timedelta
from sqlalchemy import or_

# Inits
mimetypes.add_type("application/wasm", ".wasm")

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="/")

CORS(app, supports_credentials=True)

with open("dbpasswd.txt") as file: 
    DB_PASSWORD = file.read()

app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://nils:{DB_PASSWORD}@localhost/pluspointsdb"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

with open("jwtsecretkey.txt") as file: 
    JWT_KEY = file.read()

app.config["JWT_SECRET_KEY"] = JWT_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=14)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model): 
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    password = db.Column(db.String(255))

    def __repr__(self):
        return f"<{self.name}>"

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

# Helper functions
def spa_file(path): 
    file_path = os.path.join(DIST_DIR, path)

    if path and os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)

    return send_from_directory(DIST_DIR, "index.html")

# Routes
@app.route("/api/hello-world")
def hello_world():
    return jsonify({"msg" : "Hello World"})

@app.route("/api/register", methods=["POST"])
def register(): 
    usr_data = request.get_json()
    usr_name = usr_data.get("name")
    usr_passwd = usr_data.get("password")
    
    if (usr_name and usr_passwd): 
        if not User.query.filter_by(name=usr_name).first(): 
            usr_id = str(uuid.uuid4())
            new_user = User(id=usr_id, name=usr_name, password=generate_password_hash(usr_passwd))
            db.session.add(new_user)
            db.session.commit()
            print(f"DB: Added user {new_user}.")
            return {"success": True, "access_token": create_access_token(identity=usr_id)}
        else: 
            return {"success": False, "msg": "usrNameAlreadyTaken"}
    else: 
        print("WARNING: Invalid register data.")
        return {"success": False, "msg": "invalidInput"}
    
    
@app.route("/api/login", methods=["POST"])
def login(): 
    usr_data = request.get_json()
    usr_name = usr_data.get("name")
    usr_password = usr_data.get("password")

    if usr_name and usr_password: 
        with app.app_context(): 
            user = User.query.filter_by(name=usr_name).first()

            if user: 
                if check_password_hash(user.password, usr_password): 
                    print(f"WEB_APP: User {user} logged in.")
                    return {"success": True, "access_token": create_access_token(identity=user.id)} 
                else: 
                    return {"success": False, "msg": "noPasswordMatch"}
            else: 
                return {"success": False, "msg": "userNotFound"}
    else: 
        print("WARNING: Invalid login data.")
        return {"success": False, "msg": "invalidInput"}

@app.route("/api/me")
@jwt_required()
def me(): 
    usr_id = get_jwt_identity()
    user = User.query.filter_by(id=usr_id).first()

    if user: 
        return {"success": True, "user_id": user.id, "user_name": user.name}
    else: 
        print("WARNING: Invalid token.")
        return {"success": False, "msg": "userNotFound"}
    
@app.route("/api/years", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def years(): 
    usr_id = get_jwt_identity()
    
    if request.method == "GET": 
        years = Year.query.join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id == usr_id).all()
        
        return {"success": True, "data": [y.to_dict() for y in years]}
    
    elif request.method == "POST": 
        year_data = request.get_json()

        if not (year_data.get("id") and  year_data.get("title")): 
            return {"success": False, "msg": "invalidInput"}
        if Year.query.filter_by(id=year_data.get("id")).first(): 
            return {"success": False, "msg": "itemAlreadyExists"}
        
        db.session.add(YearMap(
            id=uuid.uuid4(), 
            user_id=usr_id, 
            year_id=year_data["id"]
        ))
        db.session.add(Year(
            id=year_data["id"], 
            title=year_data["title"]
        ))
        db.session.commit()

        return {"success": True}
    
    else: 
        years_data = request.get_json()
        year_ids = years_data.get("ids", [])

        if not year_ids: 
            return {"success": False, "msg": "invalidInput"}
        
        year_map_records = YearMap.query.filter(YearMap.year_id.in_(year_ids)).all()   

        if len(year_ids) != len(year_map_records) or not all([ym.user_id == usr_id for ym in year_map_records]): 
            return {"success": False, "msg": "permissionDenied"}

        if request.method == "PUT": 
            if len(year_ids) != 1 or not years_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}

            year = Year.query.filter(Year.id.in_(year_ids)).first()
            year.title = years_data.get("data").get("title", year.title)
            db.session.commit()

            return {"success": True} 
        
        else: 
            years = Year.query.filter(Year.id.in_(year_ids)).all()

            for y in years: 
                y.deleted = True
            db.session.commit() 

            return {"success": True}

@app.route("/api/subjects", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def subjects(): 
    usr_id = get_jwt_identity()

    if request.method == "GET": 
        subjects = Subject.query.join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter_by(user_id=usr_id).all()
        
        return {"success": True, "data": [s.to_dict() for s in subjects]}
    
    elif request.method == "POST": 
        subject_data = request.get_json()
        if not (subject_data.get("id") and subject_data.get("title") and subject_data.get("weight") and subject_data.get("year_id") and subject_data.get("has_sub_subjects", "") != ""): 
            return {"success": False, "msg": "invalidInput"}
        ym = YearMap.query.join(Year, Year.id == YearMap.year_id).filter(Year.id == subject_data.get("year_id")).first()
        if not ym or ym.user_id != usr_id: 
            return {"success": False, "msg": "permissionDenied"}
        if Subject.query.filter_by(id=subject_data.get("id")).first(): 
            return {"success": False, "msg": "itemAlreadyExists"}
        
        db.session.add(Subject(
            id=subject_data["id"], 
            title=subject_data["title"], 
            weight=subject_data["weight"], 
            year_id=subject_data["year_id"], 
            has_sub_subjects=subject_data["has_sub_subjects"]
        ))
        db.session.commit()

        return {"success": True}
    
    else: 
        subjects_data = request.get_json()
        subject_ids = subjects_data.get("ids", [])

        if not subject_ids: 
            return {"success": False, "msg": "invalidInput"}
        
        subject_records = Subject.query.filter(Subject.id.in_(subject_ids)).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).where(YearMap.user_id == usr_id).all()
        
        if request.method == "PUT": 
            if len(subject_ids) != 1 or not subject_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}
            
            subject = subject_records[0]
            subject.title = subjects_data.get("data").get("title", subject.title)
            subject.weight = subjects_data.get("data").get("weight", subject.weight)
            subject.has_sub_subject = subjects_data.get("data").get("has_sub_subject", subject.has_sub_subject)
            db.session.commit()
            
            return {"success": True}
        
        else:        
            for s in subject_records: 
                s.deleted = True
            db.session.commit()

            return {"success": True}
        
@app.route("/api/sub-subjects", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def sub_subjects(): 
    usr_id = get_jwt_identity()

    if request.method == "GET": 
        sub_subjects = SubSubject.query.join(Subject, Subject.id == SubSubject.subject_id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter_by(user_id=usr_id).all()

        return {"success": True, "data": [s.to_dict() for s in sub_subjects]}
    
    elif request.method == "POST": 
        sub_subject_data = request.get_json()

        if not (sub_subject_data.get("id") and sub_subject_data.get("title") and sub_subject_data.get("weight") and sub_subject_data.get("subject_id")): 
            return {"success": False, "msg": "invalidInput"}
        ym = YearMap.query.join(Year, Year.id == YearMap.year_id).join(Subject, Subject.year_id == Year.id).filter(Subject.id == sub_subject_data.get("subject_id")).first()
        if not ym or usr_id != ym.user_id: 
            return {"success": False, "msg": "permissionDenied"}
        if SubSubject.query.filter_by(id=sub_subject_data.get("id")).first(): 
            return {"success": False, "msg": "itemAlreadyExists"}
        
        db.session.add(SubSubject(
            id=sub_subject_data["id"], 
            title=sub_subject_data["title"], 
            weight=sub_subject_data["weight"], 
            subject_id=sub_subject_data["subject_id"]
        ))
        db.session.commit()

        return {"success": True}
    
    else: 
        sub_subjects_data = request.get_json()
        sub_subject_ids = sub_subjects_data.get("ids", [])

        if not sub_subject_ids: 
            return {"success": False, "msg": "invalidInput"}

        sub_subject_records = SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).join(Subject, Subject.id == SubSubject.subject_id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).all()

        if len(sub_subject_ids) != len(sub_subject_records) or not all([s.user_id == usr_id for s in sub_subject_records]): 
            return {"success": False, "msg": "permissionDenied"}
        
        if request.method == "PUT": 
            if len(sub_subject_ids) != 1 or not sub_subject_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}

            sub_subject = sub_subjects[0]
            sub_subject.title = sub_subject.get("data").get("title", sub_subject.title)
            sub_subject.weight = sub_subject.get("data").get("weight", sub_subject.weight)
            db.session.commit()

            return {"success": True}
        
        else: 
            for s in sub_subject_records: 
                s.deleted = True
            db.session.commit()

            return {"success": True}
        
@app.route("/api/grades", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def grades(): 
    usr_id = get_jwt_identity()

    if request.method == "GET": 
        q1 = db.session.query(Grade).join(Subject, Subject.id == Grade.subject_id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id == usr_id)
        q2 = db.session.query(Grade).join(SubSubject, SubSubject.id == Grade.subject_id).join(Subject, Subject.id == SubSubject.subject_id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id == usr_id)
        grades = q1.union(q2).all()

        return {"success": True, "data": [g.to_dict() for g in grades]}

    elif request.method == "POST": 
        grades_data = request.get_json() 

        if not (grades_data.get("id") and grades_data.get("title") and grades_data.get("mark") and grades_data.get("weight") and grades_data.get("date") and grades_data.get("subject_id")): 
            return {"success": False, "msg": "invalidInput"}
        ym = YearMap.query.join(Year, Year.id == YearMap.year_id).join(Subject, Subject.year_id == Year.id).filter(Subject.id == grades_data.get("subject_id")).first()
        if not ym or usr_id != ym.user_id: 
            return {"success": False, "msg": "permissionDenied"}
        if Grade.query.filter_by(id=grades_data.get("id")).first(): 
            return {"success": False, "msg": "itemAlreadyExists"}
        
        db.session.add(Grade(
            id=grades_data["id"],  
            title=grades_data["title"], 
            mark=grades_data["mark"], 
            weight=grades_data["weight"], 
            date=grades_data["date"], 
            subject_id=grades_data["subject_id"]
        )) 
        db.session.commit()

        return {"success": True}

    else: 
        grades_data = request.get_json()
        grade_ids = grades_data.get("ids", [])

        if not grade_ids: 
            return {"success": True, "msg": "invalidInput"}
        
        grade_records = Grade.query.filter(Grade.id.in_(grade_ids)).join(SubSubject, SubSubject.id == Grade.subject_id).join(Subject, Subject.id == Grade.subject_id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).all()

        if len(grade_ids) != len(grade_records) or not all([g.user_id == usr_id for g in grade_records]): 
            return {"success": False, "msg": "permissionDenied"}

        
        if request.method == "PUT": 
            if len(grade_ids) != 1 or not grades_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}

            grade = grades[0]
            grade.title = grades_data.get("data").get("title", grade.title)
            grade.mark = grades_data.get("data").get("mark", grade.mark)
            grade.weight = grades_data.get("data").get("weight", grade.weight)
            grade.date = grades_data.get("data").get("date", grade.date)
            db.session.commit()

            return {"success": True}

        else: 
            for g in grade_records: 
                g.deleted = True
            db.session.commit()

            return {"success": True} 
    

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return spa_file(path)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")