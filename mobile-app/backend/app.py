import os
import mimetypes
import uuid
from flask import Flask, jsonify, send_from_directory, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, decode_token as jwt_decode_token, get_jwt
from datetime import timedelta
from sqlalchemy import or_
from flask_socketio import SocketIO, emit, join_room, rooms, disconnect
import redis

# Inits
mimetypes.add_type("application/wasm", ".wasm")

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="/")

CORS(app, supports_credentials=True)

socketio = SocketIO(app, path='/socket.io', cors_allowed_origins="*")

redis_client = redis.Redis(
    host="127.0.0.1", 
    port=6379, 
    db=0, 
    decode_responses=True
)

if redis_client.ping(): 
    print("REDIS: Client online.")
else : 
    print("REDIS: Client offline.")

with open("dbpasswd.txt") as file: 
    DB_PASSWORD = file.read()

app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://nils:{DB_PASSWORD}@localhost/pluspointsdb"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

with open("jwtsecretkey.txt") as file: 
    JWT_KEY = file.read()

app.config["JWT_SECRET_KEY"] = JWT_KEY
app.config["SECRET_KEY"] = JWT_KEY
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

def trigger_sync(usr_id, exclusive_device_id): 
    all_devices = redis_client.smembers(f"user_devices:{usr_id}")

    for device_id in all_devices: 
        if device_id != exclusive_device_id: 
            room_name = f"{usr_id}:{device_id}"
            print(f"SOCKET: Trigger sync for room {room_name}.")
            
            socketio.emit("sync_required", {}, room=room_name)

def decode_token(token): 
    if token.startswith('Bearer '):
        token = token[7:]
    
    return jwt_decode_token(token)

#socket
@socketio.on("connect")
def handle_connect(auth): 
    if not auth: 
        print(f"SOCKET: Missing auth.")
        return False
    
    token = auth.get("token")
    if not token:   
        print(f"SOCKET: Missing token.")
        return False 
    
    decoded = decode_token(token)
    usr_id = decoded["sub"]
    device_id = decoded.get("device_id")

    redis_client.sadd(f"user_devices:{usr_id}", device_id)

    if not User.query.filter_by(id=usr_id).first(): 
        print(f"SOCKET: User {usr_id} does not exist.")
    
    join_room(f"{usr_id}:{device_id}")
    join_room(f"{usr_id}")

    print(f"SOCKET: User {usr_id} connected.")
    return True

@socketio.on("disconnect")
def handel_disconnect(): 
    token = request.args.get('token')
    if token:
        decoded = decode_token(token)
        usr_id = decoded["sub"]
        device_id = decoded.get("device_id")
        
        redis_client.srem(f"user_devices:{usr_id}", device_id)

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
            
            device_id = str(uuid.uuid4())
            return {"success": True, "access_token": create_access_token(identity=usr_id, additional_claims={"device_id": device_id}), "device_id": device_id}
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
                    
                    device_id = uuid.uuid4()
                    return {
                        "success": True, 
                        "access_token": create_access_token(
                            identity=user.id, 
                            additional_claims={"device_id": device_id}
                        ), 
                        "device_id": device_id
                    } 
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

# year route    
@app.route("/api/years", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def years(): 
    usr_id = get_jwt_identity()
    device_id = get_jwt().get("device_id")
    
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

        trigger_sync(usr_id, exclusive_device_id=device_id)
        return {"success": True}
    
    else: 
        years_data = request.get_json()
        year_ids = years_data.get("ids", [])

        if not year_ids: 
            return {"success": False, "msg": "invalidInput"}
        
        invalid_year_maps = YearMap.query.filter(YearMap.year_id.in_(year_ids)).filter(YearMap.user_id != usr_id).all()

        if invalid_year_maps: 
            return {"success": False, "msg": "permissionDenied"}

        if request.method == "PUT": 
            if len(year_ids) != 1 or not years_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}
        
            u_data = years_data.get("data")
            Year.query.filter(Year.id.in_(year_ids)).update({'title': u_data.get("title")}, synchronize_session=False)
            
            db.session.commit()
            
            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True} 
        
        else: 
            subject_ids = [s[0] for s in db.session.query(Subject.id).filter(Subject.year_id.in_(year_ids)).all()]
            sub_subject_ids = [s[0] for s in db.session.query(SubSubject.id).filter(SubSubject.subject_id.in_(subject_ids)).all()]
            
            Year.query.filter(Year.id.in_(year_ids)).update({"deleted": True}, synchronize_session=False)
            Subject.query.filter(Subject.id.in_(subject_ids)).update({"deleted": True}, synchronize_session=False)
            SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).update({"deleted": True}, synchronize_session=False)
            Grade.query.filter(or_(Grade.id.in_(subject_ids), Grade.id.in_(sub_subject_ids))).update({"deleted": True}, synchronize_session=False)

            db.session.commit() 

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}

@app.route("/api/subjects", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def subjects(): 
    usr_id = get_jwt_identity()
    device_id = get_jwt().get("device_id")

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

        trigger_sync(usr_id, exclusive_device_id=device_id)
        return {"success": True}
    
    else: 
        subjects_data = request.get_json()
        subject_ids = subjects_data.get("ids", [])

        if not subject_ids: 
            return {"success": False, "msg": "invalidInput"}
        
        invalid_subjects = Subject.query.filter(Subject.id.in_(subject_ids)).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id != usr_id).all()
        
        if invalid_subjects: 
            return {"success": False, "msg": "permissionDenied"}
        
        if request.method == "PUT": 
            if len(subject_ids) != 1 or not subject_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}
            
            u_data = subjects_data.get("data")
            Subject.query.filter(Subject.id.in_(subject_ids)).update({
                "title": u_data.get("title"), 
                "weight": u_data.get("weight"), 
                "has_sub_subjects": u_data.get("has_sub_subject")
            }, synchronize_session=False)

            db.session.commit()
            
            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}
        
        else:        
            sub_subject_ids = db.session.query(SubSubject.id).filter(SubSubject.id.in_(subject_ids)).all()

            Subject.query.filter(Subject.id.in_(subject_ids)).update({"deleted": True}, synchronize_session=False)
            SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).update({"deleted": True}, synchronize_session=False)
            Grade.query.filter(or_(Grade.subject_id.in_(subject_ids), Grade.subject_id.in_(sub_subject_ids))).update({"deleted": True}, synchronize_session=False)

            db.session.commit()

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}
        
@app.route("/api/sub-subjects", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def sub_subjects(): 
    usr_id = get_jwt_identity()
    device_id = get_jwt().get("device_id")

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

        trigger_sync(usr_id, exclusive_device_id=device_id)
        return {"success": True}
    
    else: 
        sub_subjects_data = request.get_json()
        sub_subject_ids = sub_subjects_data.get("ids", [])

        if not sub_subject_ids: 
            return {"success": False, "msg": "invalidInput"}

        invalid_sub_subjects = SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).join(Subject, Subject.id == SubSubject.id).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id != usr_id).all()

        if invalid_sub_subjects: 
            return {"success": False, "msg": "permissionDenied"}
        
        if request.method == "PUT": 
            if len(sub_subject_ids) != 1 or not sub_subject_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}

            u_data = sub_subjects_data.get("data")
            SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).update({
                "title": u_data.get("title"), 
                "weight": u_data.get("weight") 
            }, synchronize_session=False)
            
            db.session.commit()

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}
        
        else: 
            SubSubject.query.filter(SubSubject.id.in_(sub_subject_ids)).update({"deleted": True}, synchronize_session=False)
            Grade.query.filter(Grade.subject_id.in_(sub_subject_ids)).update({"deleted": True}, synchronize_session=False)

            db.session.commit()

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}
        
@app.route("/api/grades", methods=["GET", "POST", "PUT", "DELETE"])
@jwt_required()
def grades(): 
    usr_id = get_jwt_identity()
    device_id = get_jwt().get("device_id")

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

        trigger_sync(usr_id, exclusive_device_id=device_id)
        return {"success": True}

    else: 
        grades_data = request.get_json()
        grade_ids = grades_data.get("ids", [])

        if not grade_ids: 
            return {"success": True, "msg": "invalidInput"}
        
        invalid_grades = Grade.query.filter(Grade.id.in_(grade_ids)).join(SubSubject, SubSubject.id == Grade.subject_id).join(Subject, or_(Subject.id == SubSubject.subject_id, Subject.id == Grade.subject_id)).join(Year, Year.id == Subject.year_id).join(YearMap, Year.id == YearMap.year_id).filter(YearMap.user_id != usr_id).all()

        if invalid_grades: 
            return {"success": False, "msg": "permissionDenied"}

        
        if request.method == "PUT": 
            if len(grade_ids) != 1 or not grades_data.get("data"): 
                return {"success": False, "msg": "invalidInput"}

            u_data = grades_data.get("data")
            Grade.query.filter(Grade.id.in_(grade_ids)).update({
                "title": u_data.get("title"),
                "mark": u_data.get("mark"), 
                "weight": u_data.get("weight"),
                "date": u_data.get("date"),
            }, synchronize_session=False)

            db.session.commit()

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True}

        else: 
            Grade.query.filter(Grade.id.in_(grade_ids)).update({"deleted": True}, synchronize_session=False)
            
            db.session.commit()

            trigger_sync(usr_id, exclusive_device_id=device_id)
            return {"success": True} 
    

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return spa_file(path)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)