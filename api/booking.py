from flask import *
import api.connector as connector
# 登入會員驗證
import jwt
from datetime import datetime, timedelta
# key加密
import os
from dotenv import load_dotenv

booking=Blueprint("booking", __name__, template_folder="templates")
conn_pool=connector.connect()

load_dotenv()
key = os.getenv("key")

@booking.route('/api/booking')
def getBooking():
    # 檢查登入狀態
    token = request.cookies.get('token')
    if token == None :
        print('未登入系統，請先登入會員')
        return make_response(jsonify({'error': True, 'message': '未登入系統，請先登入會員'}), 403)
    payload = jwt.decode(token, key, algorithms="HS256")
    memberId = payload["id"]
    cnx = conn_pool.get_connection()
    cursor = cnx.cursor(dictionary=True, buffered=True)
    # 訂單資訊
    sql="SELECT * FROM booking WHERE member_id= %s;"
    cursor.execute(sql, (memberId,))
    result=cursor.fetchone()
    # 有資料
    if result == None:
        print('沒有訂單資料')
        return make_response(jsonify({'data': None}), 200)
    else:
        try:
            # 景點資料
            attractionId = result["attraction_id"]
            cursor.execute("SELECT id, name, address, images FROM attraction WHERE id = %s;", (attractionId,))
            att=cursor.fetchone()
            attraction = {
                'id': att["id"],
                'name': att["name"],
                'address':att["address"],
                'images':json.loads(att['images'])[0],
            }
            data = {
                'attraction': attraction,
                'date': result["date"].strftime('%Y-%m-%d'),
                'time': result["time"],
                'price':int(result["price"])
            }   
            return make_response(jsonify({'data': data}), 200)
        
        except Exception as e:
            print('Exception')
            return make_response({'error': True, "message": str(e)})
        
        finally:
            cursor.close()
            cnx.close()

@booking.route('/api/booking', methods=["POST"])
def createBooking():
    token = request.cookies.get('token')
    # 未登入
    if token == None:
        return make_response(jsonify({"error": True, "message": "未登入系統，請先登入會員"}), 403)
    
    payloads = jwt.decode(token, key, algorithms="HS256")
    memberId = payloads["id"]
    newBooking = request.get_json()
    attractionId = newBooking["attractionId"]
    attractionDate = newBooking["date"]
    attractionTime = newBooking["time"]
    attractionPrice = newBooking["price"]

    # 未選擇日期
    if len(attractionDate) == 0:
        return make_response(jsonify({"error": True, "message": "預訂失敗，請選擇日期"}), 400)

    # 可預訂的狀態
    try:
        cnx = conn_pool.get_connection()
        cursor = cnx.cursor()
        sql="SELECT * FROM booking WHERE member_id=%s;"
        cursor.execute(sql, (memberId,))
        bookingData = cursor.fetchone()
        if bookingData == None:
            sql="INSERT INTO booking (member_id, attraction_id, date, time, price) VALUES(%s, %s, %s, %s, %s);"
            val=(memberId, attractionId, attractionDate, attractionTime, attractionPrice)
        else:
            sql="UPDATE booking SET member_id=%s, attraction_id=%s, date=%s, time=%s, price=%s WHERE member_id=%s;"
            val=(memberId, attractionId, attractionDate, attractionTime, attractionPrice, memberId)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return make_response(jsonify({"ok": True}), 200)
    except Exception as e:
        return make_response({'error': True, "message": str(e)})




@booking.route('/api/booking', methods=["DELETE"])
def deleteBooking():
    token = request.cookies.get('token')
    if token == None:
        return make_response(jsonify({'error': True, 'message': '尚未登入系統，請先登入會員'}), 403)
    
    payloads = jwt.decode(token, key, algorithms="HS256")
    memberId = payloads["id"]
    # 刪除目前預定的行程
    try:
        cnx = conn_pool.get_connection()
        cursor = cnx.cursor()
        sql='DELETE FROM booking WHERE member_id= %s;'
        cursor.execute(sql,(memberId,))
        cnx.commit()
        return make_response(jsonify({'ok': True}), 200)
    except Exception as e:
        print(e)
        return make_response({'error': True, 'message': str(e)})
    finally:
        cursor.close()
        cnx.close()