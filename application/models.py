from datetime import datetime
from flask_security import RoleMixin, UserMixin
from flask_security.models import fsqla_v3 as fsqla
from application.application import db, security


fsqla.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='users_roles', backref='user')
    active = db.Column(db.Boolean,default=True)
    professional=db.relationship('Professional',backref='user',uselist=False)
    customer=db.relationship('Customer',backref='user',uselist=False)
    timestamp = db.Column(db.DateTime, default=datetime.now())


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(50), nullable=False)

# roles_users = db.Table('roles_users',
#     db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
#     db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
# )

class UserRole(db.Model):
    __tablename__ = 'users_roles'
    extend_existing=True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50),unique=True, nullable=False)
    description = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    timerequired = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean,default=True)
    servicerequests = db.relationship(
        'ServiceRequest', backref='services',
        lazy=True)  # One to Many Relationship with ServiceRequests
    timestamp = db.Column(db.DateTime, default=datetime.now())

class Professional(db.Model):
    __tablename__ = 'professionals'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    creationdate = db.Column(db.DateTime, default=datetime.now())
    experience = db.Column(db.Integer, nullable=False)
    filepath=db.Column(db.String,nullable=False)
    services = db.relationship('Service', secondary='service_professionals',backref='professionals')
    # Many to Many Relationship with Service
    servicerequests = db.relationship(
        'ServiceRequest', backref='professionals',
        lazy=True)  # One to Many Relationship with ServiceRequests
    ratings=db.Column(db.Integer,default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)
    active = db.Column(db.Boolean,default=True)
    timestamp = db.Column(db.DateTime, default=datetime.now())


# service_professionals= db.Table('service_professionals',
#     db.Column('id',db.Integer, primary_key=True, autoincrement=True),
#     db.Column('professional_id',db.Integer, db.ForeignKey('professionals.id')),
#     db.Column('service_id',db.Integer, db.ForeignKey('services.id'))
#     )

class ServiceProfessional(db.Model):
    __tablename__ = 'service_professionals'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))


class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(10), unique=True, nullable=False)
    address = db.Column(db.String(500), nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    servicerequests = db.relationship(
        'ServiceRequest', backref='customers',
        lazy=True)  # One to Many Relationship with ServiceRequests
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)
    active = db.Column(db.Boolean,default=True)
    timestamp = db.Column(db.DateTime, default=datetime.now())


class ServiceRequest(db.Model):
    __tablename__ = 'servicerequests'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer,
                           db.ForeignKey('services.id'),
                           nullable=False)
    customer_id = db.Column(db.Integer,
                            db.ForeignKey('customers.id'),
                            nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'))
    requestdate = db.Column(db.String, nullable=False)
    requesttime=db.Column(db.String,nullable=False)
    instructions=db.Column(db.String(50))
    completiondate = db.Column(db.String)
    status = db.Column(db.String(10),
                       nullable=False)  #Requested/Assigned/Accepted/Closed
    ratings = db.Column(db.Integer)  #1 to 5 Stars
    remarks = db.Column(db.String(200))  #Feedback of Customer
    timestamp = db.Column(db.DateTime, default=datetime.now())

