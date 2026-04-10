from flask import request
from flask_socketio import SocketIO, emit, join_room, rooms, disconnect

from models import User
from extentions import socketio, redis_client
from utils import decode_token

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