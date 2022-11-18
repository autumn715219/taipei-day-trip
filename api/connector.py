import mysql.connector
from mysql.connector import pooling

# 0.設定連線資料
def connect():
	return pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=1,
		pool_reset_session=True,
		host='127.0.0.1',
		user='root',
		password='MhWVpN$%Fd2u)FK',
		database='taipei_day_trip'
	)
