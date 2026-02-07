from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/hello-world")
def hello_world():
    data = {
        "message" : "Hello World",  
    }
    
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")