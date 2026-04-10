from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import or_

from models import Year, YearMap, Subject, SubSubject, Grade
from extentions import db
from utils import trigger_sync

subjects_bp = Blueprint("subjects", __name__)

@subjects_bp.route("/api/subjects", methods=["GET", "POST", "PUT", "DELETE"])
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
            if len(subject_ids) != 1 or not subjects_data.get("data"): 
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