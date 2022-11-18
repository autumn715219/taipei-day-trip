from flask import *
from api.attraction_data import attraction_data
from api.attraction_id import attraction_id

app=Flask(__name__, static_folder="data", static_url_path="/")
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS']=False

app.register_blueprint(attraction_data)
app.register_blueprint(attraction_id)

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")



app.run(port=3000)