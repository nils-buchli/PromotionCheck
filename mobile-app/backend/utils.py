from flask import send_from_directory
from flask_jwt_extended import decode_token as jwt_decode_token

from extentions import socketio, redis_client
from config import Config

def trigger_sync(usr_id, exclusive_device_id): 
    all_devices = redis_client.smembers(f"user_devices:{usr_id}")

    for device_id in all_devices: 
        if device_id != exclusive_device_id: 
            room_name = f"{usr_id}:{device_id}"
            print(f"SOCKET: Trigger sync for room {room_name}.")
            
            socketio.emit("sync_required", {}, room=room_name)

def trigger_reload(usr_id, exclusive_device_id): 
    all_devices = redis_client.smembers(f"user_devices:{usr_id}")

    for device_id in all_devices: 
        if device_id != exclusive_device_id: 
            room_name = f"{usr_id}:{device_id}"
            print(f"SOCKET: Trigger reload for room {room_name}.") 

            socketio.emit("reload_required", {}, room=room_name)

def decode_token(token): 
    if token.startswith('Bearer '):
        token = token[7:]
    
    return jwt_decode_token(token)