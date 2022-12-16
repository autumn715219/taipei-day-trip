from flask import *
import api.connector as connector
# 登入會員驗證
import jwt
import time
from datetime import datetime, timedelta
# key加密
import os
from dotenv import load_dotenv

member=Blueprint("member", __name__, template_folder="templates")
conn_pool=connector.connect()

load_dotenv()
key = os.getenv("key")

# POST 註冊
@member.route('/api/user', methods=['POST'])
def signup():
    cnx = conn_pool.get_connection()
    cursor = cnx.cursor()
    user = request.get_json()
    inputName = user["name"]
    inputEmail = user["email"]
    inputPassword = user["password"]
    cursor.execute("SELECT name,email,password FROM member WHERE email= %s", (inputEmail,))
    result=cursor.fetchone()
    # print(result)
    try:
        if result is not None:
            print('註冊失敗，信箱已被註冊')
            return jsonify( {"error":True, "message":"註冊失敗，信箱已被註冊"}, 400 )
        else:
            print('註冊成功')
            cursor.execute("INSERT INTO member(name,email,password) VALUES(%s, %s , %s)", (inputName,inputEmail,inputPassword))
            cnx.commit()
            return jsonify({ "ok":True }, 200 )
    except Exception as e:
        return {"error": True, "message": str(e)}
    finally:
        # print('finally')
        cursor.close()
        cnx.close()

# GET 取得登入資訊
@member.route('/api/user/auth', methods=['GET'])
def getUserData():
    # 取得目前在瀏覽器的token
    token = request.cookies.get('token')
    try:
        data=jwt.decode(token, key, algorithms="HS256")
        return jsonify({"data": data}), 200
    except Exception as e:
        return {"error": True, "message": str(e)}


# PUT 登入會員
@member.route('/api/user/auth', methods=['PUT'])
def userLogin():
    cnx = conn_pool.get_connection()
    cursor = cnx.cursor()
    user = request.get_json()
    inputEmail = user["email"]
    inputPassword = user["password"]
    # 登入僅需email和密碼
    cursor.execute("SELECT id,name,email,password FROM member WHERE  email=%s and password=%s;", (inputEmail, inputPassword))
    result = cursor.fetchone()
    try:
        if result is not None:
            exptime = datetime.now() + timedelta(days=7)
            exp_timestemp = exptime.timestamp()
            current_time = int(time.time())
            payload = {
                'id': result[0],
                'name': result[1],
                'email': result[2],
                'iat': current_time,
                'exp': exp_timestemp,
            }
            encoded_jwt = jwt.encode(payload=payload, key=key, algorithm="HS256")
            response = make_response(jsonify({"ok": True}), 200)
            response.set_cookie(key='token', value=encoded_jwt, expires=exp_timestemp, httponly=True)
            # print(encoded_jwt)
            return response
        else:
            print("登入失敗")
            return jsonify({"error": True, "message": "帳號或密碼輸入錯誤"}), 400
    except Exception as e:
        return {"error": True, "message": str(e)}
    finally:
        cursor.close()
        cnx.close()

# DELETE 登出會員帳戶
@member.route('/api/user/auth', methods=['DELETE'])
def userLogout():
    try:
        # 先取得token
        token = request.cookies.get('token')
        response = make_response(jsonify({"ok": True}), 200)
        response.set_cookie(key='token', value=token, expires=0, httponly=True)
        return response
    except Exception as e:
        return {"error": True, "message": str(e)}




