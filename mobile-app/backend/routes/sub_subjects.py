from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import Year, YearMap, Subject, SubSubject, Grade 
from extentions import db 
from utils import trigger_sync

sub_subjects_bp = Blueprint("sub_subjects", __name__)

@sub_subjects_bp.route("/api/sub-subjects", methods=["GET", "POST", "PUT", "DELETE"])
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