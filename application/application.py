from flask_sqlalchemy import SQLAlchemy
from flask_security import Security
from flask_caching import Cache


security=Security()
db = SQLAlchemy()
cache=Cache()