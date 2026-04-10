from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import or_

from models import Year, YearMap, Subject, SubSubject, Grade 
from extentions import db 
from utils import trigger_sync

grades_bp = Blueprint("grades", __name__)

@grades_bp.route("/api/grades", methods=["GET", "POST", "PUT", "DELETE"])
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
        ym1 = YearMap.query.join(Year, Year.id == YearMap.year_id).join(Subject, Subject.year_id == Year.id).filter(Subject.id == grades_data.get("subject_id")).first()
        ym2 = YearMap.query.join(Year, Year.id == YearMap.year_id).join(Subject, Subject.year_id == Year.id).join(SubSubject, SubSubject.subject_id == Subject.id).filter(SubSubject.id == grades_data.get("subject_id")).first()
        if (ym1 and usr_id != ym1.user_id) and (ym2 and usr_id != ym2.user_id): 
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