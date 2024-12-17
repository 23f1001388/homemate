from flask import Flask, render_template,request
import requests
from application.application import db,security,cache
from application.createdata import createData
from application.config import LocalDevelopmentConfig
from application.models import User,Role,ServiceRequest
from flask_security import SQLAlchemyUserDatastore
from application.views import createViews
from flask_cors import CORS
from api.serviceresource import api
from flask_mail import Message,Mail
from application.mailing import *
from flask_caching import Cache
from celeryApp.workers import celery_init_app
from celeryApp.tasks import daily_reminder,monthly_report,newReport
from celery.schedules import crontab
import flask_excel as excel
from random import randint

def createApp():
    app = Flask(__name__,template_folder='templates', static_folder='static', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)


     # configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['WTF_CSRF_CHECK_DEFAULT'] =False
    app.config['SECURITY_CSRF_PROTECT_MECHANISM'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True
    
    app.config["CACHE_TYPE"] = "RedisCache"
    # app.config['CACHE_REDIS_URL'] = "redis://localhost:6379/2"
    app.config["CACHE_REDIS_PORT"] = 6379
    app.config['CACHE_REDIS_DB']=2

    cache.init_app(app)
    db.init_app(app)
    mail=Mail(app)

    with app.app_context():
        user_datastore=SQLAlchemyUserDatastore(db,User,Role)
        security.init_app(app,db,user_datastore)

        db.create_all()

        createData(user_datastore)
        createViews(app,user_datastore,cache)
    # connect flask to flask_restful
    excel.init_excel(app)
    
    api.init_app(app)
    CORS(app)
    return app

app=createApp()
celery_app = celery_init_app(app)
# excel.init_excel(app)

@app.route('/setcache')
def set_cache():
    cache.set('my_key', randint(1, 100), timeout=60)  # Set a random key
    return "Cache set!"

@app.route('/getcache')
def get_cache():
    value = cache.get('my_key')  # Retrieve key from cache
    return f"Cached value: {value}"

@app.errorhandler(401)
def unauthorized_error_handler(e):
    return jsonify({"error": "Unauthorized"}), 401


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):

    # sender.add_periodic_task(20.0, daily_reminder.s('test@gmail', 'Testing', '<h2> content here </h2>'),name='add every 10')

    # sender.add_periodic_task(20.0, monthly_report.s('test@gmail', 'Testing', '<h2> content here </h2>'),name='add every 10')

    sender.add_periodic_task(
        crontab(hour=18, minute=30),
        daily_reminder.s('test2@gmail', 'from crontab', 'content'),
    )
    # Executes every Monday morning at 7:30 a.m.
    sender.add_periodic_task(
        crontab(hour=9, minute=5, day_of_month=1),
        monthly_report.s('test2@gmail', 'from crontab', 'content'),
    )   

@app.route('/dailyreminder')
def dailyRemnderProfesisonals():
    daily_reminder('to','sub','content')
    return "ok"

@app.route('/monthlyreportfinal')
def sendmonthlyreport():
    monthly_report('to','sub','content')
    return "ok"

if __name__ == '__main__':
    app.run()