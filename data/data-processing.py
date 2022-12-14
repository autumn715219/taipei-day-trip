import json
import mysql.connector
from mysql.connector import errorcode
import os
from dotenv import load_dotenv

class DBManager:
    # 建立連線
    def __init__(self,dbconfig):
        try:
            self.mysql_conn = mysql.connector.connect(**dbconfig)
            print("連線完成")
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("連線失敗")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("資料庫不存在")
            else:
                print("不明問題:",err)
        else:
            self.cursor = self.mysql_conn.cursor()
            print("開始執行任務")

    # 刪除已存在的景點資料表
    def drop_table(self):
        self.cursor.execute(f"DROP TABLE IF EXISTS attraction")
        print("已刪除舊的資料表")

    # 關閉資料庫
    def close(self):
        self.cursor.close()
        self.mysql_conn.close()
        print("關閉資料庫")

    # 新增景點資料表
    def create_table(self):
        sql = 'CREATE TABLE attraction(\
            id BIGINT PRIMARY KEY AUTO_INCREMENT, \
            name VARCHAR(20) NOT NULL,\
            category VARCHAR(20) NOT NULL,\
            description TEXT NOT NULL,\
            address VARCHAR(50) NOT NULL,\
            transport text ,\
            mrt VARCHAR(20) ,\
            lat FLOAT UNSIGNED ,\
            lng FLOAT UNSIGNED ,\
            images TEXT NOT NULL\
            );'
        self.cursor.execute(sql)
        self.mysql_conn.commit()
        print("已新增資料表.")

    # 新增會員資料表
    def create_member(self):
        sql = 'CREATE TABLE member(\
            id BIGINT PRIMARY KEY AUTO_INCREMENT, \
            name VARCHAR(30) NOT NULL,\
            email VARCHAR(50) NOT NULL,\
            password VARCHAR(30) NOT NULL,\
            time datetime NOT NULL DEFAULT NOW()\
            );'
        self.cursor.execute(sql)
        self.mysql_conn.commit()
        print("已新增會員資料表.")

    # 新增訂單資料表
    def create_booking(self):
        sql = """
        CREATE TABLE booking(
            id BIGINT PRIMARY KEY AUTO_INCREMENT, 
            member_id BIGINT NOT NULL,
            attraction_id BIGINT NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(10) NOT NULL,
            price INT NOT NULL DEFAULT 2000,
            FOREIGN KEY(member_id) REFERENCES member(id) ON DELETE CASCADE ON UPDATE CASCADE, 
            FOREIGN KEY(attraction_id) REFERENCES attraction(id) ON DELETE CASCADE ON UPDATE CASCADE 
        );
        """
        self.cursor.execute(sql)
        self.mysql_conn.commit()
        print("已新增訂單資料表.")

    # 新增結帳資料表
    def create_order(self):
        sql = """
        CREATE TABLE orders(
            id BIGINT PRIMARY KEY AUTO_INCREMENT, 
            order_number VARCHAR(255) NOT NULL,
            member_id BIGINT NOT NULL,
            attraction_id BIGINT NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(10) NOT NULL,
            price INT NOT NULL DEFAULT 2000,
            contact_name VARCHAR(30) NOT NULL,
            contact_email VARCHAR(50) NOT NULL,
            contact_phone VARCHAR(10) NOT NULL,
            status VARCHAR(30) NOT NULL,
            FOREIGN KEY(member_id) REFERENCES member(id) ON DELETE CASCADE ON UPDATE CASCADE, 
            FOREIGN KEY(attraction_id) REFERENCES attraction(id) ON DELETE CASCADE ON UPDATE CASCADE 
        );
        """
        self.cursor.execute(sql)
        self.mysql_conn.commit()
        print("已新增結帳資料表.")

    # 新增付款資料表
    def create_payment(self):
        sql = """
        CREATE TABLE payment(
            id BIGINT PRIMARY KEY AUTO_INCREMENT, 
            order_id BIGINT NOT NULL,
            paid_time DATETIME NOT NULL,
            message VARCHAR(500) NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        );
        """
        self.cursor.execute(sql)
        self.mysql_conn.commit()
        print("已新增付款資料表.")

    # 寫入資料
    def insert_data(self, data):
        sql = 'INSERT INTO attraction (name, category, description, address, transport, mrt , lat, lng, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'
        self.cursor.execute(sql, data)
        self.mysql_conn.commit()
        print("資料匯入完成.")

# 0.設定連線資料
load_dotenv()
dbconfig = {
    'host':'127.0.0.1',
    'user':'root',
    'password':os.getenv("password"),
    'database':'taipei_day_trip',
}

db_manager = DBManager(dbconfig)

# # 1.刪除已存在的資料表
# db_manager.drop_table()

# # 2.新增資料表
# db_manager.create_table()

# # 3.調整圖片副檔名功能
# def isImg(img):
#     if img[-3:] == "jpg" or img[-3:] == "png":
#         return img and img.strip()

# # 4.json檔案資料處理
# with open("taipei-attractions.json", "r", encoding="utf-8") as file:
#     data=json.load(file) 
#     dataList=data["result"]["results"]
#     for item in dataList:
#         itemFile = item["file"].replace('.JPG','.jpg,').replace('.jpg','.jpg,').split(',',len(item))
#         outputImgList = list(filter(isImg, itemFile))
#         # 迴圈取出圖片檔名
#         imgs = []
#         for img in outputImgList:
#             # img = img.split("/")[-1:][0] 
#             imgs.append(img)
#         images=json.dumps(imgs)
#         address = item["address"].replace(" ", "")

#         data = (item["name"],
#                 item["CAT"],
#                 item["description"],
#                 address,
#                 item["direction"],
#                 item["MRT"],
#                 item["latitude"],
#                 item["longitude"],
#                 images
#         )
#         db_manager.insert_data(data)
#     db_manager.close()

# 5.下載圖片的程式(註解不要刪)
# # 需要載入os套件，可處理文件和目錄
# import os
# import requests
# # 創建目錄
# os.makedirs('./data/images/',exist_ok=True)
# def download_img(url):
#     img=requests.get(url)
#     name= url.split("/")[-1:][0]
#     with open('./data/images/'+name,'wb') as f:
#         f.write(img.content)
# with open("data/taipei-attractions.json", "r", encoding="utf-8") as file:
#     data=json.load(file) 
#     dataList=data["result"]["results"]
#     # 整理並篩選所有圖片放入 list
#     itemFileS = []
#     for item in dataList:
#         itemFile=item["file"].replace('.JPG','.jpg,').replace('.jpg','.jpg,').split(',',len(item))
#         itemFileS = itemFileS + itemFile
#         outputImgList = list(filter(isImg, itemFileS))
#     for img in outputImgList:
#         download_img(img)
#     print("下載完成")


# API 範例
# {
#   "nextPage": 1,
#   "data": [
#     {
#       "id": 10,
#       "name": "平安鐘",
#       "category": "公共藝術",
#       "description": "平安鐘祈求大家的平安，這是為了紀念 921 地震週年的設計",
#       "address": "臺北市大安區忠孝東路 4 段 1 號",
#       "transport": "公車：204、212、212直",
#       "mrt": "忠孝復興",
#       "lat": 25.04181,
#       "lng": 121.544814,
#       "images": [
#         "http://140.112.3.4/images/92-0.jpg"
#       ]
#     }
#   ]
# }

# 6.新增會員資料表
# db_manager.create_member()

# 7.新增訂單資料表
# db_manager.create_booking()

# 8.新增結帳資料表
db_manager.create_order()

# 9.新增付款資訊資料表
# db_manager.create_payment()


db_manager.close()