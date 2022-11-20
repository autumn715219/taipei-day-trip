from flask import *
import api.connector as connector

attraction_id=Blueprint("attraction_id", __name__, template_folder="templates")
conn_pool=connector.connect()

@attraction_id.route('/api/attraction/<id>')
def getAttractionId(id):
    cnx=conn_pool.get_connection()
    cursor=cnx.cursor(buffered=True, dictionary=True)
    cursor.execute("SELECT * FROM `attraction` WHERE id=%s", (id,))
    result=cursor.fetchone()
    # print(result)
    try:
        if result:
            temp_images_val=json.loads(result['images']) # 把 images 的 value 從 字串 轉回 list
            result['images']=temp_images_val
            dataResult={
                "data":result
            }
            status=200
        else:
            dataResult={
                "error": True,
                "message": "景點編號不正確"
            }
            status=400
    except: 
        dataResult={
			"error":True,
			"message":"伺服器內部錯誤"
		}
        status=500
    finally:
        cursor.close()
        cnx.close()
        response=make_response(dataResult, status, {"content-type":"application/json"})
        return response