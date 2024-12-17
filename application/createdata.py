from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from application.application import db
from flask import jsonify

def createData(user_datastore:SQLAlchemyUserDatastore):
    user_datastore.find_or_create_role(name='admin',
                                        description='Admininstration')
    user_datastore.find_or_create_role(name='customer',
                                      description='Customer')
    user_datastore.find_or_create_role(name='professional',
                                        description='Professional')
    if not user_datastore.find_user(email='admin@iitm.ac.in'):
      user_datastore.create_user(email='admin@iitm.ac.in',
                                 password=hash_password('admin'),
                                 active=True,
                                 roles=['admin'])
    db.session.commit()

      