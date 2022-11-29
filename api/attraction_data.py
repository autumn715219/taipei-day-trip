from flask import *
import api.connector as connector

attraction_data=Blueprint("attraction_data", __name__, template_folder="templates")
conn_pool=connector.connect()
			
@attraction_data.route("/api/attractions")
def getAttractionData():
	cnx=conn_pool.get_connection()
	cursor=cnx.cursor(buffered=True, dictionary=True)

	# get query
	page = int(request.args.get("page", 0)) # 預設0
	keyword = request.args.get("keyword", "") 
	pageSize=12 # 一頁12筆資料

    # 分頁 & 搜尋
	def attractionQueryData(page, keyword): 
        # 只用 page 搜尋 
		if len(keyword) == 0:
			sql="SELECT * FROM `attraction` LIMIT %s OFFSET %s"
			val=(pageSize, page*pageSize)
		else:
			sql="SELECT * FROM `attraction` WHERE name LIKE %s OR category = %s LIMIT %s OFFSET %s"
			val=("%"+keyword+"%", keyword, pageSize, page*pageSize)
		cursor.execute(sql, val)
		result = cursor.fetchall()

        # 圖片
		for i in range(len(result)):  
			imgArray=json.loads(result[i]['images'])
			result[i]['images']=imgArray
		return result


	def responseData(page, data):
		if len(data) < pageSize: #10 <12  #12 < 12
			response={"nextPage":None,"data":data}
		else:
			response={"nextPage":page+1,"data":data}
		return response

	def error(msg): # 錯誤
		return {"error":True,"message":msg}

	# 執行程式	
	result = attractionQueryData(page, keyword)

	try:
		# 搜尋不到資料即錯誤
		if result == []:  
			status=200
			dataResult=error("查無相關景點資料。")
		# 有資料
		else:
			status=200
			dataResult=responseData(page, result)

	except:
		status=500
		dataResult=error("伺服器內部錯誤")

	finally:
		cursor.close()
		cnx.close()
		response=make_response(dataResult, status, {"content-type":"application/json"})
		return response
			
