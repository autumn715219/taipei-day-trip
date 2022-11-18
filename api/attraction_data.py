from flask import *
import api.connector as connector

attraction_data=Blueprint("attraction_data", __name__, template_folder="templates")
conn_pool=connector.connect()

@attraction_data.route("/api/attractions")
def getAttractionData():
    # 連線
	cnx=conn_pool.get_connection()
	cursor=cnx.cursor(buffered=True, dictionary=True)
	# get query
	page = int(request.args.get("page", 0)) # 預設0
	keyword = request.args.get("keyword", "") 
	# print(page,keyword)
	def query(page, keyword): # 查詢資料 
		if len(keyword) == 0:   # 只用 page 搜尋
			sql="SELECT * FROM `attraction` LIMIT %s, %s"
			val=(page*12, 12)
		else:
			sql="SELECT * FROM `attraction` WHERE name LIKE %s LIMIT %s, %s"
			val=("%"+keyword+"%", page*12, 12)
		cursor.execute(sql, val)
		result = cursor.fetchall()
		for i in range(len(result)):  # 把 images 的 value 從 字串 轉回 list
			temp_images_val=json.loads(result[i]['images'])
			result[i]['images']=temp_images_val
		return result

	def responseData(page, data_lst, last_page): # response 資料格式
		if page > last_page-1:
			response={
				"nextPage":None,
				"data":data_lst
			}
		else:
			response={
				"nextPage":page+1,
				"data":data_lst
			}
		return response

	def error(msg): # 錯誤
		return {
			"error":True,
			"message":msg
		}

	result=query(page, keyword)

	try:
		if result == []:  # 搜尋不到資料即錯誤
			status=400
			data_result=error("查無相關景點資料。")
		else:
			if page is not None and keyword == "":  # 只用 page 搜尋的資料取得邏輯
				status=200
				cursor.execute("SELECT COUNT(*) FROM `attraction`")
				last_id=cursor.fetchone()
				print("符合條件的資料總數", last_id['COUNT(*)'])
				last_page=last_id['COUNT(*)']/12			
			else:  # 用 keyword 搜尋的資料取得邏輯 page 會變成對應的頁數
				status=200
				cursor.execute("SELECT COUNT(*) FROM `attraction` WHERE name LIKE %s", (f"%{keyword}%", ))
				last_id = cursor.fetchone()
				print("符合的資料數", last_id['COUNT(*)'])
				last_page=last_id['COUNT(*)']/12

			data_result=responseData(page, result, last_page)

	except:
		status=500
		data_result=error("伺服器內部錯誤")
	finally:
		cursor.close()
		cnx.close()
		response=make_response(data_result, status, {"content-type":"application/json"})
		return response
