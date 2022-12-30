from flask import *
import api.connector as connector
from flask import request
import requests
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime

orders=Blueprint("orders", __name__, template_folder="templates")
conn_pool=connector.connect()

load_dotenv()
key = os.getenv("key")
partner_key = os.getenv("partner_key")
merchant_id = os.getenv("merchant_id")


# 訂單付款api
@orders.route("/api/orders", methods=["POST"])
def getorders():
        # 取得使用者資訊
        token = request.cookies.get("token")
        # 若未登入
        if token == None:
            print('未登入系統，請先登入會員')
            return make_response(jsonify({'error': True, 'message': '未登入系統，請先登入會員'}), 403)
        
        # 已登入
        else:
            print('已登入')
            try:
                cnx = conn_pool.get_connection()
                cursor = cnx.cursor(dictionary=True, buffered=True)
                payload = jwt.decode(token, key, algorithms="HS256")
                memberId = payload["id"]
                memberName = payload["name"]
                # 取得前台資料
                newOrder = request.get_json()
                print(newOrder)
                prime = newOrder["prime"]
                name = newOrder["order"]["contact"]["name"]
                email = newOrder["order"]["contact"]["email"]
                phone = newOrder["order"]["contact"]["phone"]
                attraction_id = newOrder["order"]["trip"]["attraction"]["id"]
                attraction_name = newOrder["order"]["trip"]["attraction"]["name"]
                attraction_address = newOrder["order"]["trip"]["attraction"]["address"]
                attraction_image = newOrder["order"]["trip"]["attraction"]["image"]
                date = newOrder["order"]["trip"]["date"]
                time = newOrder["order"]["trip"]["time"]
                price = newOrder["order"]["price"]
                
                # 建立訂單編號
                now = datetime.now()
                order_number = now.strftime("%Y%m%d%H%M%S")

                # INSERT 到結帳資料表
                sql ="""
                    INSERT INTO orders (
                        order_number, member_id, attraction_id,  date, time, price,
                        contact_name, contact_email, contact_phone, status) 
                    VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """
                content = (order_number, memberId, attraction_id, date, time, price, name, email, phone, "未付款")
                cursor.execute(sql,content)
                cnx.commit()
                # print(cursor.rowcount, "已經建立.")
                
                # 串接 TapPay後端
                postData = 	{
                    "prime": prime,
                    "partner_key": partner_key,
                    "merchant_id": merchant_id,
                    "details": "Taipei day trip Test",
                    "amount": price,
                    "cardholder": {
                        "phone_number": phone,
                        "name": name,
                        "email": email,
                    },
                    "remember": False
                }
                url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
                headers = {
                    "Content-Type": "application/json",
                    "x-api-key": partner_key
                    }
                response = requests.post(url, headers=headers, json=postData)
                print("tappay回傳結果")
                print(response)
                print("Status Code", response.status_code)
                print("JSON Response ", response.json())

                if (response.json())["status"] == 0:
                    # 付款成功，紀錄付款資訊；將訂單付款狀態改為【已付款】，將訂單編號傳回前端。
                    status = "付款成功"
                    cursor.execute(
                        "UPDATE orders SET status='已付款' WHERE order_number = %s;", (order_number,))
                    cnx.commit()
                    #print(cursor.rowcount, "已經更新.")
                    payment = {
                         "status":0,
                         "message":status
                    }
                    data = {
                        "number" : order_number,
                        "payment" : payment
                    }
                    cursor.execute(
                        "DELETE FROM booking;")

                    cnx.commit()
                    return make_response(jsonify({'data': data}), 200)
                 
                else:
                    # 5. 付款失敗，紀錄付款資訊；不更動訂單付款狀態，將訂單編號傳遞回前端。
                    status = "付款失敗"
                    payment = {
                         "status":0,
                         "message":status
                    }
                    data = {
                        "number" : order_number,
                        "payment" : payment
                    }
                    cursor.execute(
                        "DELETE FROM booking;")
                    cursor.execute(
                        "DELETE FROM orders;")
                    cnx.commit()
                return make_response(jsonify({'data': data}), 200)
                
            except Exception as e:
                return make_response({'error': True, "message": str(e)})
            
            finally:
                cursor.close()
                cnx.close()



@orders.route("/api/order/<orderNumber>")
def orderNumver(orderNumber):
    token = request.cookies.get("token")
    if token == None:
        return redirect("/")
    try:
        payloads = jwt.decode(token, key, algorithms="HS256")
        memberId = payloads["id"]
        cnx = conn_pool.get_connection()
        cursor = cnx.cursor(dictionary=True, buffered=True)
        if token:
            # 查詢訂單資訊
            cursor.execute('SELECT * FROM orders WHERE order_number = %s', (orderNumber,))
            orderResult = cursor.fetchone()
            attractionId = orderResult["attraction_id"]

            # 查詢景點資訊
            cursor.execute('SELECT name,address,images FROM attraction WHERE id = %s', (attractionId,))
            attractionResult = cursor.fetchone()

            return make_response(jsonify({"data": {
								"number": orderNumber,
								"price": orderResult["price"],
								"trip": {
									"attraction": {
										"id": orderResult["attraction_id"],
										"name": attractionResult["name"],
										"address": attractionResult ["address"],
										"image": attractionResult ["images"][0]
									},
									"date": orderResult["date"],
									"time": orderResult["time"]
								},
								"contact": {
									"name": orderResult["contact_name"],
									"email": orderResult["contact_email"],
									"phone": orderResult["contact_phone"]
								},
								"status": 0
							}
							}))
        else:
            return	({
                        "error": True,
                        "message": "未登入系統，拒絕存取"
                        }) , 403
    except:
        # 失敗
        return ({"error" : True ,"message": "伺服器出錯啦"}), 500
    
    finally:
        cursor.close()
        cnx.close()


@orders.route("/thankyou")
def thankyou():
    try:
        cnx = conn_pool.get_connection()
        cursor = cnx.cursor(dictionary = True)
        token = request.cookies.get("token")
        if token:
            payload = jwt.decode(token, key, algorithms = "HS256")	
            memberId = payload["id"]		
            cursor.execute('SELECT order_number FROM orders WHERE member_id = %s ORDER BY id DESC' , (memberId ,))
            result = cursor.fetchall()
            print(result[0]["order_number"])
            return render_template("thankyou.html" ,order_number = result[0]["order_number"]) 
        else:
            return redirect("/")

    except Exception as e:
        print(e)
        return make_response({'error': True, 'message': str(e)})

    finally:
        cursor.close()
        cnx.close()