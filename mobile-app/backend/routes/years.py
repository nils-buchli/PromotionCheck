import uuid
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import or_

from models import Year, YearMap, Subject, SubSubject, Grade
from extentions import db
from utils import trigger_sync

years_bp = Blueprint("years", __name__)

@years_bp.route("/api/years", methods=["GET", "POST", "PUT", "DELETE"])
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