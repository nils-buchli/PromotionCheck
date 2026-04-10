import uuid
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

from extentions import db
from models import User, Year, YearMap, Subject, SubSubject, Grade
from utils import trigger_reload

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/register", methods=["POST"])
def register(): 
    usr_data   = request.get_json()
    usr_name   = usr_data.get("name")
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
    
    
@auth_bp.route("/api/login", methods=["POST"])
def login(): 
    usr_data     = request.get_json()
    usr_name     = usr_data.get("name")
    usr_password = usr_data.get("password")

    if usr_name and usr_password: 
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

@auth_bp.route("/api/me")
@jwt_required()
def me(): 
    usr_id = get_jwt_identity()
    user = User.query.filter_by(id=usr_id).first()

    if user: 
        return {"success": True, "user_id": user.id, "user_name": user.name}
    else: 
        print("WARNING: Invalid token.")
        return {"success": False, "msg": "userNotFound"}

    
    
@auth_bp.route("/api/delete-user", methods=["DELETE"])
@jwt_required()
def delete_user():   
    usr_id = get_jwt_identity()
    user = User.query.filter_by(id=usr_id)

    if user.first(): 
       year_maps = YearMap.query.filter_by(user_id=usr_id)
       
       year_ids = [ym.year_id for ym in year_maps.all()]
       years    = Year.query.filter(Year.id.in_(year_ids))

       subjects    = Subject.query.filter(Subject.year_id.in_(year_ids))
       subject_ids = [s.id for s in subjects.all()]

       sub_subjects    = SubSubject.query.filter(SubSubject.subject_id.in_(subject_ids))
       sub_subject_ids = [s.id for s in sub_subjects.all()]

       grades = Grade.query.filter(Grade.subject_id.in_(subject_ids + sub_subject_ids))

       grades.delete()
       sub_subjects.delete()
       subjects.delete()
       year_maps.delete()
       years.delete()
       user.delete()

       db.session.commit()

       trigger_reload(usr_id, exclusive_device_id=get_jwt().get("device_id"))

       print(f"AUTH: Deleted user <{usr_id}>")

       return {"success": True}
       
    else: 
         return {"success": False, "msg": "userNotFound"}
    
@auth_bp.route("/api/edit-user", methods=["PUT"])
@jwt_required()
def edit_user(): 
    usr_id      = get_jwt_identity()
    user        = User.query.filter_by(id=usr_id)
    user_object = user.first()

    if not user_object: 
        return {"success": False, "msg": "userNotFound"}

    usr_data     = request.get_json()
    new_username = usr_data.get("username")
    new_password = usr_data.get("password")

    to_update = {}

    if new_username: 
        if User.query.filter_by(name=new_username).first(): 
            return {"success": False, "msg": "usrNameAlreadyTaken"}
        to_update["name"] = new_username
    
    if new_password: 
        to_update["password"] = generate_password_hash(new_password)
        
    user.update(to_update)
    db.session.commit()

    trigger_reload(usr_id, get_jwt().get("device_id"))

    return {"success": True}

