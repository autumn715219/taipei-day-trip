import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
# 0.設定連線資料
def connect():
	load_dotenv()
	return pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=10,
		pool_reset_session=True,
		host='127.0.0.1',
		user='root',
		password=os.getenv("password"),
		database='taipei_day_trip'
	)
