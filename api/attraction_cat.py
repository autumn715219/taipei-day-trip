from flask import *
import api.connector as connector

attraction_cat=Blueprint("attraction_cat", __name__, template_folder="templates")
conn_pool=connector.connect()

@attraction_cat.route('/api/categories')
def getAttractionCat():
    print("hello")
    cnx=conn_pool.get_connection()
    cursor=cnx.cursor(buffered=True, dictionary=True)

    def catQueryData(): 
        cursor.execute("SELECT category FROM `attraction`")
        result = cursor.fetchall()
        # 處理
        catArray = []
        for i in range(len(result)):  
            cat = result[i]['category']
            if cat not in catArray:
                catArray.append(cat)
        result = catArray
        #print(result)
        return result

    def responseData(result):
        response={"data":result}
        return response

    def error(msg): # 錯誤
        return {"error":True,"message":msg}

    # 執行程式	
    result = catQueryData()
    try:
        # 搜尋不到資料即錯誤
        if result == []:  
            status=200
            dataResult=error("查無相關景點資料。")
        # 有資料
        else:
            status=200
            dataResult=responseData(result)

    except:
        status=500
        dataResult=error("伺服器內部錯誤")

    finally:
        cursor.close()
        cnx.close()
        response=make_response(dataResult, status, {"content-type":"application/json"})
        return response