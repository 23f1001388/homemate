from flask import request, render_template_string, render_template, jsonify, send_from_directory,send_file
from flask_security import SQLAlchemyUserDatastore, auth_required, roles_required, roles_accepted, current_user, verify_password, logout_user
from application.models import User, Professional, Customer, Service, ServiceProfessional, ServiceRequest
import requests
import application.mailing as mailing
# from createdata import createUser
from application.application import db
from flask_security.utils import hash_password
import mimetypes, os
from werkzeug.utils import secure_filename
from datetime import datetime,timedelta
from application.search import searchProfessionals, searchCustomers, searchServices, searchServiceRequests
from application.summary import serviceRequestsData,customersRatingsData,RatingsData
from application.common import format_date, format_datetime
# from app import app
from celeryApp.tasks import approval_rejection_mail,export_job,add,export_job_customer,export_job_professional
from celery.result import AsyncResult
# import flask_excel as excel
from flask_excel import make_response_from_query_sets
from flask import current_app
from sqlalchemy import func,case
from random import randint
from time import perf_counter





basedir = os.path.abspath(os.path.dirname(__file__))

def createViews(app, user_datastore: SQLAlchemyUserDatastore,cache):

  # @app.route('/static/<path:path>')
  # def static_proxy(path):
  #   return send_from_directory(app.static_folder, path)
  
  @app.route('/celerydemo')
  def celeryDemo():
    add.delay(10,20)
    return "Celery Test"

  @app.route('/cachingdemo')
  @cache.cached(timeout=20)
  def cachingDemo():
    randnum=randint(1,100)
    return f'The Numer is {randnum}'


  #******************Index Login Registeration adn Logout*********************

  @app.route('/', defaults={'path': ''})
  @app.route('/<path:path>')
  def index(path):
    return render_template('index.html')

  @app.route('/getlocation')
  def get_location():
    ip = request.remote_addr
    response = requests.get(f'http://ipinfo.io/{ip}/json')
    location_data = response.json()
    return location_data

  @app.route('/logout')
  @auth_required()
  def logout():
    logout_user()
    return render_template('index.html')

  @app.route('/userlogin', methods=['POST'])
  def userLogin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
      return jsonify({"message": "Valid email and Password required"}), 404

    user = user_datastore.find_user(email=email)

    if not user:
      return jsonify({"message": "User not Registered. Please register."}), 404

    if verify_password(password, user.password):
      token = user.get_auth_token()
      role = user.roles[0].name
      if role == 'customer':
        user_id = user.customer.id
      if role == "professional":
        user_id = user.professional.id
      if role == "admin":
        user_id = user.id

      userData = {
          "id": user.id,
          "email": user.email,
          "token": token,
          "role": role,
          "user_id": user_id,
          "status":int(user.active)
      }
      if int(user.active)>0:
        return jsonify(userData), 200
      else:
        return jsonify({"message": "Your Account is not Approved as Documents are under verification. You patience is appreciable."}), 404
      # return jsonify({"token":user.get_auth_token(),"role":user.roles[0].name,"id" : user.id, "email" : user.email }), 200
    else:
      return jsonify({"message": "Wrong password"}), 404

  
  @app.route('/admin/users', methods=['GET'])
  @cache.cached(timeout=60,key_prefix="userData") 
  @auth_required('token') # Cache for 60 seconds
  def get_users():
    start=perf_counter()
    users = User.query.all()  # Get all users
    stop=perf_counter()
    print("Time Taken " ,stop-start)

    users_data = []
    
    for user in users:
      user_info = {
          'id': user.id,
          'email': user.email,
          'roles':
          [role.name
           for role in user.roles]  # Get roles associated with the user
      }
      users_data.append(user_info)

    return jsonify(users_data)
  
  @app.route('/sendemail', methods=['POST'])
  @auth_required('token')
  def sendEmail():
    data = request.get_json()
   
    to = data.get('to')
    subject = data.get('subject')
    content_body = data.get('body')

    if not to or not subject or not content_body:
      return jsonify({"error": "Missing required fields"}), 400
    try:
      mailing.send_email(to, subject, content_body)
      return jsonify({"message": "Email sent sucessfully"}), 200
    except Exception as e:
      return jsonify({"error": str(e)}), 500
  
  def sendEmail_byParams(to,subject,content_body):
    if not to or not subject or not content_body:
      return jsonify({"error": "Missing required fields"}), 400
    try:
      mailing.send_email(to, subject, content_body)
      return jsonify({"message": "Email sent sucessfully"}), 200
    except Exception as e:
      return jsonify({"error": str(e)}), 500


  @app.route('/upload', methods=['POST'])
  def uploadFile():
    if 'file' not in request.files:
      return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
      return jsonify({"error": "No selected file"}), 400

    # Check if the file is a PDF
    mime_type, _ = mimetypes.guess_type(file.filename)
    if mime_type != 'application/pdf':
      return jsonify({"error": "Only PDF files are allowed"}), 400

    # Save the file
    file_path = os.path.join(basedir, '/uploads/', file.filename)
    file.save(file_path)

    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename
    }), 200

  @app.route('/uploads/<filename>')
  def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

  @app.route('/register/professional', methods=['POST'])
  def registerProfessional():
    # return jsonify({'message':'Route Ok'}),200
    email = request.form.get('email')
    password = request.form.get('password')
    name = request.form.get('name')
    description = request.form.get('description')
    service_id = int(request.form.get('service'))
    # service_names = service_name.split(',')
    experience = request.form.get('experience')
    address = request.form.get('address')
    pincode = request.form.get('pincode')
    contact = request.form.get('contact')
    fileupload = request.files.get('file')
  

    if not email or not password or not name or not description:
      return jsonify(
          {"message":
           "Some fields email/password/name/description are blank"}), 404
    elif not address or not pincode or not contact or not experience or not fileupload:
      return jsonify({
          "message":
          "Some fields address/pincode/contact/experience/fileupload are blank"
      }), 404
    elif not service_id:
      return jsonify({"message": "Service Not Selected"}), 404
    else:
      if not user_datastore.find_user(email=email):
        if fileupload and fileupload.filename != '':
          upload_directory = os.path.join(os.path.dirname(__file__), '..',
                                          'uploads')
          # Create the uploads directory if it doesn't exist
          os.makedirs(upload_directory, exist_ok=True)
          filename = secure_filename(fileupload.filename)
          file_name, file_extension = os.path.splitext(filename)
          new_filename = f"{email}{file_extension}"
          file_path = os.path.join(upload_directory, new_filename)
          fileupload.save(file_path)
          try:
            user = user_datastore.create_user(email=email,
                                              password=hash_password(password),
                                              active=False,
                                              roles=['professional'])
            db.session.commit()

            newProfessional = Professional(email=email,
                                           name=name,
                                           description=description,
                                           address=address,
                                           pincode=pincode,
                                           contact=contact,
                                           experience=experience,
                                           filepath=file_path,
                                           active=False,
                                           user_id=user.id)
            service = Service.query.get(
                service_id)  # Get the Service object by ID
            if not service:
              return jsonify({"message": "Invalid service selected"
                              }), 404  # Handle invalid service ID
            newProfessional.services.append(service)

            db.session.add(newProfessional)
            db.session.commit()
            return jsonify({"message":
                            "Professional Registered Successfully"}), 200
          except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error: " + str(e)}), 404
      else:
        return jsonify({"message": "Professional aleady Exists"}), 404

  @app.route('/register/customer', methods=['POST'])
  def registerCustomer():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    address = data.get('address')
    pincode = data.get('pincode')
    contact = data.get('contact')
  
    # print(data)
    if not email or not password or not name or not address or not pincode or not contact:
      return jsonify({"message": "Some fields are blank"}), 404
    else:
      if not user_datastore.find_user(email=email):
        try:
          user = user_datastore.create_user(email=email,
                                            password=hash_password(password),
                                            active=True,
                                            roles=['customer'])
          db.session.commit()
          newCustomer = Customer(email=email,
                                 name=name,
                                 address=address,
                                 pincode=pincode,
                                 contact=contact,
                                 active=True,
                                 user_id=user.id)
          db.session.add(newCustomer)
          db.session.commit()
          return jsonify({"message": "Customer Registered Successfully"}), 200
        except Exception as e:
          db.session.rollback()
          return jsonify({"message": {e}}), 404
      else:
        return jsonify({"message": "Customer aleady Exists"}), 404

  #******************Admin Functions*********************************

  
  
  @app.route('/admin/professionals', methods=['GET'])
  @cache.cached(timeout=60)  # Cache for 60 seconds
  def get_professionals():
    users = Professional.query.all()
    professionals = []
    for user in users:
      userdata = {
          "id": user.id,
          "email": user.email,
          "name": user.name,
          "description": user.description,
          "experience": user.experience,
          "address":user.address,
          "pincode":user.pincode,
          "contact":user.contact,
          "ratings":user.ratings,
          "services": [service.name for service in user.services],
          "active": int(user.active),
          "filepath":user.filepath
      }
      professionals.append(userdata)
    return jsonify(professionals), 200
  
  
  @app.route('/admin/professional/<int:id>', methods=['GET'])
  @auth_required('token')
  def get_professional(id):
   user = Professional.query.get(id)
  
   userdata = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "experience": user.experience,
        "address":user.address,
        "pincode":user.pincode,
        "contact":user.contact,
        "ratings":user.ratings,
        "services": [service.name for service in user.services],
        "active": int(user.active),
        "filepath":user.filepath
    }
   
   return jsonify(userdata), 200

  @app.route('/admin/customer/<int:id>', methods=['GET'])
  def get_customer(id):
    obj = Customer.query.get(id)
    
    userdata = {
        "id": obj.id,
        "email": obj.email,
        "name": obj.name,
        "address": obj.address,
        "contact": obj.contact,
        "pincode": obj.pincode,
        "active": int(obj.active)
    }
    return jsonify(userdata), 200
  
 
  @app.route('/admin/customers', methods=['GET'])
  @cache.cached(timeout=60)
  def get_customers():
    users = Customer.query.all()
    customers = []
    for obj in users:
      userdata = {
          "id": obj.id,
          "email": obj.email,
          "name": obj.name,
          "address": obj.address,
          "contact": obj.contact,
          "pincode": obj.pincode,
          "active": int(obj.active)
      }
      customers.append(userdata)
    return customers, 200

  @app.route('/admin/profile', methods=['POST'])
  def adminProfile_Update():
    data = request.get_json()
    userId = data.get("userId")
    password = data.get("password")
    newpassword = data.get("newpassword")
    confirmpassword = data.get("confirmpassword")

    user = user_datastore.find_user(id=userId)

    if not user:
      return jsonify({"message": "User not found"}), 404

    if verify_password(password,
                       user.password) and newpassword == confirmpassword:
      user.password = hash_password(newpassword)
      db.session.commit()
    else:
      return jsonify({"message": "Password Not Matched"}), 404
    return jsonify({"message": "User Updated successfully"}), 200

  @app.route('/admin/approveprofessional/<int:id>', methods=['PUT'])
  def approve_professional(id):
    professional=Professional.query.get(id)
    userId=professional.user_id
    user = User.query.get(userId)
    if not user:
      return jsonify({"message": "User not found"}), 404
    user.active = True
    professional.active=True
    db.session.commit()
    approval_rejection_mail(professional.email,"Approval Status","Your Profile has been approved",professional.name,"Professional")
    return jsonify({"message": "User Updated successfully"}), 200

  @app.route('/admin/rejectprofessional/<int:id>', methods=['PUT'])
  def reject_professional(id):
    professional=Professional.query.get(id)
    userId=professional.user_id
    user = User.query.get(userId)
    if not user:
      return jsonify({"message": "User not found"}), 404
    user.active = False
    professional.active=False
    db.session.commit()
    approval_rejection_mail(professional.email,"Profile Blocked","Your Profile has been blocked",professional.name,"Professional")
    return jsonify({"message": "User Updated successfully"}), 200

  @app.route('/admin/approvecustomer/<int:id>', methods=['PUT'])
  def approve_customer(id):
    customer=Customer.query.get(id)
    userId=customer.user_id
    user = User.query.get(userId)
    if not user:
      return jsonify({"message": "User not found"}), 404
    user.active = True
    customer.active=True
    db.session.commit()
    approval_rejection_mail(customer.email,"Approval Status","Your Profile has been approved",customer.name,"Customer")
    return jsonify({"message": "User Updated successfully"}), 200

  @app.route('/admin/rejectcustomer/<int:id>', methods=['PUT'])
  def reject_customer(id):
    customer=Customer.query.get(id)
    userId=customer.user_id
    user = User.query.get(userId)
    if not user:
      return jsonify({"message": "User not found"}), 404
    user.active = False
    customer.active=False
    db.session.commit()
    approval_rejection_mail(customer.email,"Profile Blocked","Your Profile has been blocked",customer.name,"Customer")
    return jsonify({"message": "User Updated successfully"}), 200

  #***********************Admin Funcitons End**************************

  #***********************Service Related Functions********************
  @app.route('/getServices')
  # @cache.cached(timeout=60)
  def getServices():
    objectData = []
    count = 1

    services = db.session.query(
    Service.id.label('service_id'),
    Service.name.label('service_name'),
    Service.price.label('service_price'),
    Service.timerequired.label('service_timerequired'),
    Service.description.label('service_description'),
    Professional.id.label('professional_id'),
    Professional.name.label('professional_name'),
    Professional.contact.label('professional_contact')
    ).join(
        ServiceProfessional, ServiceProfessional.service_id == Service.id
    ).join(
        Professional, Professional.id == ServiceProfessional.professional_id
    ).filter(
        Professional.active == 1  
    ).all()

    for service in services:
      obj = {
          "id": count,
          "service_id": service.service_id,
          "name": service.service_name,
          "price": service.service_price,
          "timerequired": service.service_timerequired,
          "description": service.service_description,
          "professional_id": service.professional_id,
          "professional_name": service.professional_name,
          "professional_contact": service.professional_contact
      }
      objectData.append(obj)
      count += 1  
    return objectData, 200


  @app.route('/service/professionals')
  @cache.cached(timeout=60)
  def getServiceProfessionals():
    serviceProfessionals = ServiceProfessional.query.all()
    objectData = []
    count = 1
    for data in serviceProfessionals:
      service_id = data.service_id
      service = Service.query.filter(Service.id == service_id).first()
      professional=Professional.query.get(data.professional_id)
      obj = {
          "id": count,
          "service_id": service.id,
          "service_name": service.name,
          "service_price": service.price,
          "service_timerequired": service.timerequired,
          "professional_id": professional.id,
          "professional_name": professional.name,
          "professional_description":professional.description,
          "professional_ratings":professional.ratings
      }
      objectData.append(obj)
      count += 1
    return objectData, 200

  @app.route('/service/professionals/<int:service_id>')
  @cache.cached(timeout=60)
  def getServiceProfessionalsbyService(service_id):
    customerId = request.args.get('customerId')
    serviceProfessionals = ServiceProfessional.query.filter(ServiceProfessional.service_id==service_id).all()
    objectData = []
    count = 1
    for data in serviceProfessionals:
      service_id = data.service_id
      service = Service.query.filter(Service.id == service_id).first()
      professional=Professional.query.get(data.professional_id)
      servicerequest = ServiceRequest.query.filter(
          ServiceRequest.service_id == service_id,
          ServiceRequest.professional_id == professional.id,
          ServiceRequest.customer_id == customerId).first()
      status = servicerequest.status if servicerequest else ''
      obj = {
          "id": count,
          "service_id": service.id,
          "service_name": service.name,
          "service_price": service.price,
          "service_timerequired": service.timerequired,
          "professional_id": professional.id,
          "professional_name": professional.name,
          "professional_description":professional.description,
          "professional_experience":professional.experience,
          "professional_ratings":professional.ratings,
          "request_status": status
      }
      objectData.append(obj)
      count += 1
    objectData.sort(key=lambda x: x['professional_ratings'], reverse=True)
    return objectData, 200
 

  #*******************Service Funcitons End****************************

  #*******************Service Requests Function Start******************
  @app.route('/servicerequest/create/<int:professional_id>', methods=['POST'])
  def serviceRequest_creation(professional_id):
    data = request.get_json()

    service_id = data.get('serviceId')
    customer_id = getCustomerId(data.get('userId'))
    professional_id = professional_id
    requestdate = data.get('requestdate')
    requesttime=data.get('requesttime')
    instructions=data.get('instructions')
    status = "Requested"  #requested/assigned/closed

    if not service_id or not customer_id or not professional_id:
      return jsonify({"message": "Some fields are blank"}), 404
    else:
      try:
        newServiceRequest = ServiceRequest(service_id=service_id,
                                           customer_id=customer_id,
                                           professional_id=professional_id,
                                           requestdate=requestdate,
                                           requesttime=requesttime,
                                           instructions=instructions,
                                           status=status)

        db.session.add(newServiceRequest)
        db.session.commit()
        return jsonify({"message": "ServiceRequest created Successfully"}), 200
      except Exception as e:
        db.session.rollback()
        return jsonify({"message": {e}}), 404
      
  @app.route('/servicerequest/edit', methods=['PUT'])
  def serviceRequest_edit():
    try:
      data = request.get_json()

      serviceRequestId = data.get('serviceRequestId')
      requestdate = data.get('requestdate')
      requesttime=data.get('requesttime')
      instructions=data.get('instructions')

      servicerequest=ServiceRequest.query.get(serviceRequestId)

      servicerequest.requestdate=requestdate
      servicerequest.requesttime=requesttime
      servicerequest.instructions=instructions
    
      db.session.commit()
      return jsonify({"message": "ServiceRequest Updated Successfully"}), 200
    except Exception as e:
      db.session.rollback()
      return jsonify({"message": {e}}), 404

  @app.route('/servicerequests/bycustomers/<int:customerId>')
  def servicerequests_bycustomers(customerId):
    servicerequests = ServiceRequest.query.filter(
        ServiceRequest.customer_id == customerId).all()
    dataObject = []
    for servicerequest in servicerequests:
      service = Service.query.filter(
          Service.id == servicerequest.service_id).first()
      professionalId = servicerequest.professional_id
      professional = Professional.query.filter(
          Professional.id == professionalId).first()
      data = {
          "id": servicerequest.id,
          "requestdate": format_datetime(servicerequest.requestdate),
          "requesttime": servicerequest.requesttime,
          "instructions": servicerequest.instructions,
          "completiondate": format_datetime(servicerequest.completiondate),
          "status": servicerequest.status,
          "ratings": servicerequest.ratings,
          "remarks": servicerequest.remarks,
          "service_id": service.id,
          "service_name": service.name,
          "professional_name": professional.name,
          "professional_contact": professional.contact,
          "professional_address": professional.address,
          "professional_pincode": professional.pincode,
          "professional_experience": professional.experience
      }
      dataObject.append(data)
    return dataObject, 200

  @app.route('/servicerequests/byprofessionals/<int:professionalId>')
  def servicerequests_byprofessional(professionalId):
    # professionalId=getProfessionalId(userId)
    print(professionalId)
    servicerequests = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professionalId).all()
    dataObject = []
    for servicerequest in servicerequests:
      service = Service.query.filter(
          Service.id == servicerequest.service_id).first()
      customerId = servicerequest.customer_id
      customer = Customer.query.filter(Customer.id == customerId).first()
      data = {
          "id": servicerequest.id,
          "service_id": service.id,
          "requestdate": format_datetime(servicerequest.requestdate),
          "requesttime": servicerequest.requesttime,
          "instructions": servicerequest.instructions,
          "completiondate": format_datetime(servicerequest.completiondate),
          "service_name": service.name,
          "customer_name": customer.name,
          "customer_contact": customer.contact,
          "customer_address": customer.address,
          "customer_pincode": customer.pincode,
          "status": servicerequest.status,
          "rating": servicerequest.ratings,
          "remarks": servicerequest.remarks
      }
      dataObject.append(data)
    return dataObject, 200
  
  @app.route('/servicerequests/active/byprofessionals/<int:professionalId>')
  def servicerequests_byprofessional_active(professionalId):
    # professionalId=getProfessionalId(userId)
    print(professionalId)
    servicerequests = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professionalId,ServiceRequest.status!='Closed').all()
    dataObject = []
    for servicerequest in servicerequests:
      service = Service.query.filter(
          Service.id == servicerequest.service_id).first()
      customerId = servicerequest.customer_id
      customer = Customer.query.filter(Customer.id == customerId).first()
      data = {
          "id": servicerequest.id,
          "service_id": service.id,
          "requestdate": format_datetime(servicerequest.requestdate),
          "requesttime": servicerequest.requesttime,
          "instructions": servicerequest.instructions,
          "completiondate": format_datetime(servicerequest.completiondate),
          "service_name": service.name,
          "customer_name": customer.name,
          "customer_contact": customer.contact,
          "customer_address": customer.address,
          "customer_pincode": customer.pincode,
          "status": servicerequest.status,
          "rating": servicerequest.ratings,
          "remarks": servicerequest.remarks
      }
      dataObject.append(data)
    return dataObject, 200

  @app.route('/servicerequests/closed/byprofessionals/<int:professionalId>')
  def servicerequests_byprofessional_closed(professionalId):
    # professionalId=getProfessionalId(userId)
    print(professionalId)
    servicerequests = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professionalId, ServiceRequest.status=='Closed').all()
    dataObject = []
    for servicerequest in servicerequests:
      service = Service.query.filter(
          Service.id == servicerequest.service_id).first()
      customerId = servicerequest.customer_id
      customer = Customer.query.filter(Customer.id == customerId).first()
      data = {
          "id": servicerequest.id,
          "service_id": service.id,
          "requestdate": format_datetime(servicerequest.requestdate),
          "requesttime": servicerequest.requesttime,
          "instructions": servicerequest.instructions,
          "completiondate": format_datetime(servicerequest.completiondate),
          "service_name": service.name,
          "customer_name": customer.name,
          "customer_contact": customer.contact,
          "customer_address": customer.address,
          "customer_pincode": customer.pincode,
          "status": servicerequest.status,
          "ratings": servicerequest.ratings,
          "remarks": servicerequest.remarks
      }
      dataObject.append(data)
    return dataObject, 200

  @app.route('/servicerequest/byservicerequestid/<int:serviceRequestId>')
  def servicerequests_byrequestid(serviceRequestId):
    servicerequest = ServiceRequest.query.get(serviceRequestId)

    service = Service.query.filter(
        Service.id == servicerequest.service_id).first()
    professionalId = servicerequest.professional_id
    professional = Professional.query.filter(
        Professional.id == professionalId).first()
    customerId = servicerequest.customer_id
    customer = Customer.query.filter(Customer.id == customerId).first()
    data = {
        "id": servicerequest.id,
        "service_id": service.id,
        "service_name": service.name,
        "requestdate": format_datetime(servicerequest.requestdate),
        "requesttime": servicerequest.requesttime,
        "instructions": servicerequest.instructions,
        "completiondate": format_datetime(servicerequest.completiondate),
        "status": servicerequest.status,
        "rating": servicerequest.ratings,
        "remarks": servicerequest.remarks,
        "service_id": service.id,
        "service_name": service.name,
        "service_description": service.description,
        "professional_id": professional.id,
        "professional_name": professional.name,
        "professional_contact": professional.contact,
        "customer_name": customer.name,
        "customer_contact": customer.contact,
        "customer_address": customer.address,
        "customer_pincode": customer.pincode,
        "status": servicerequest.status,
        "rating": servicerequest.ratings,
        "remarks": servicerequest.remarks
    }

    return jsonify(data), 200
  
  @app.route('/servicerequest/viewall')
  def servicerequests_viewall():
    servicerequests = ServiceRequest.query.all()
    dataObject = []
    for servicerequest in servicerequests:
      service = Service.query.filter(
          Service.id == servicerequest.service_id).first()
      customerId = servicerequest.customer_id
      customer = Customer.query.filter(Customer.id == customerId).first()
      professionalId = servicerequest.professional_id
      professional = Professional.query.filter(
        Professional.id == professionalId).first()
      data = {
          "id": servicerequest.id,
          "service_id": service.id,
          "requestdate": servicerequest.requestdate,
          "requesttime": servicerequest.requesttime,
          "instructions": servicerequest.instructions,
          "completiondate": servicerequest.completiondate,
          "service_name": service.name,
          "professional_id": professional.id,
          "professional_name": professional.name,
          "customer_name": customer.name,
          "customer_contact": customer.contact,
          "customer_address": customer.address,
          "customer_pincode": customer.pincode,
          "status": servicerequest.status,
          "rating": servicerequest.ratings,
          "remarks": servicerequest.remarks
      }
      dataObject.append(data)
    return dataObject, 200

#*******************ServiceRequest Function End***********************

#*******************Search Fucntions Start****************************

  @app.route('/search/professionals', methods=['GET'])
  def search_professionals(id=None):
    subType = request.args.get('subType')
    searchText = request.args.get('searchText')
    print("From Professional ", subType, searchText)
    professionals = searchProfessionals(subType, searchText)

    if professionals is None:
      return jsonify({"message": "No Data Found"}), 404
    print(professionals)
    return professionals, 200

  @app.route('/search/customers', methods=['GET'])
  def search_customers(id=None):
    subType = request.args.get('subType')
    searchText = request.args.get('searchText')
    print("From Customer ", subType, searchText)
    customers = searchCustomers(subType, searchText)

    if customers is None:
      return jsonify({"message": "No Data Found"}), 404
    print(customers)
    return customers, 200

  @app.route('/search/servicerequests', methods=['GET'])
  def search_servicerequests(id=None):
    subType = request.args.get('subType')
    searchText = request.args.get('searchText')
    print(subType, searchText)
    servicerequests = searchServiceRequests(subType, searchText)

    if servicerequests is None:
      return jsonify({"message": "No Data Found"}), 404
    print(servicerequests)
    return servicerequests, 200

#********************Serach Functions End******************************

#***************************Sumamry Functions Start********************

  @app.route('/summary/servicerequestsdata', methods=['GET'])
  def summary_requestData():
    requestsData = serviceRequestsData()
    if requestsData is None:
      return jsonify({"message": "No Data Found"}), 404
    print("Printed from View Route: ", requestsData)
    return requestsData, 200
  
  @app.route('/summary/servicerequestsdata/professional/<int:professionalId>', methods=['GET'])
  def summary_requestData_professionalId(professionalId):
    requestsData = serviceRequestsData(professionalId)
    if requestsData is None:
      return jsonify({"message": "No Data Found"}), 404
    # print("Printed from View Route Professional: ", requestsData)
    return requestsData, 200
  
  @app.route('/summary/servicerequestsdata/customer/<int:customerId>', methods=['GET'])
  def summary_requestData_customerId(customerId):
    requestsData = serviceRequestsData(customerId)
    if requestsData is None:
      return jsonify({"message": "No Data Found"}), 404
    # print("Printed from View Route: ", requestsData)
    return requestsData, 200
  
  @app.route('/summary/ratingschartdata', methods=['GET'])
  def summary_ratingsData():
    ratingsData = customersRatingsData()
    print("ratingdata",ratingsData)
    if ratingsData is None:
      return jsonify({"message": "No Data Found"}), 404
    return ratingsData, 200
  
  @app.route('/summary/ratingschartdata/professional/<int:professionalId>', methods=['GET'])
  def summary_ratingsData_professional(professionalId):
    ratingsData = customersRatingsData(professionalId)
    print("ratingdata",ratingsData)
    if ratingsData is None:
      return jsonify({"message": "No Data Found"}), 404
    return ratingsData, 200
  
  @app.route('/summary/ratingschartdata/customer/<int:customerId>', methods=['GET'])
  def summary_ratingsData_customer(customerId):
    ratingsData = customersRatingsData(customerId)
    print("ratingdata",ratingsData)
    if ratingsData is None:
      return jsonify({"message": "No Data Found"}), 404
    return ratingsData, 200

#***************************Sumamry Functions End********************

#***************************Professional Functions Start********************

  @app.route('/professional/servicerequest/approve/<int:id>', methods=['PUT'])
  def servicerequest_approve(id):
    servicerequest = ServiceRequest.query.get(id)
    customer=Customer.query.get(servicerequest.customer_id)
    service=Service.query.get(servicerequest.service_id)
    professional=Professional.query.get(servicerequest.professional_id)
    if not servicerequest:
      return jsonify({"message": "Service Request not found"}), 404
    servicerequest.status = "Accepted"
    db.session.commit()
    msg=f'Your service request for {service.name} service has been approved by Professional {professional.name}'
    approval_rejection_mail(customer.email,"Service Request Approval",msg,customer.name,"Customer")
    return jsonify({"message": "Service Request Updated successfully"}), 200

  @app.route('/professional/servicerequest/reject/<int:id>', methods=['PUT'])
  def servicerequest_reject(id):
    servicerequest = ServiceRequest.query.get(id)
    customer=Customer.query.get(servicerequest.customer_id)
    service=Service.query.get(servicerequest.service_id)
    professional=Professional.query.get(servicerequest.professional_id)
    if not servicerequest:
      return jsonify({"message": "Service Request not found"}), 404
    servicerequest.status = "Rejected"
    db.session.commit()
    msg=f'Your service request for {service.name} service has been rejected by Professional {professional.name}'
    approval_rejection_mail(customer.email,"Service Request Rejection",msg,customer.name,"Customer")
    return jsonify({"message": "Service Request Updated successfully"}), 200
  
  @app.route('/professional/servicerequest/complete/<int:id>', methods=['PUT'])
  def servicerequest_update(id):
    servicerequest = ServiceRequest.query.get(id)
    customer=Customer.query.get(servicerequest.customer_id)
    service=Service.query.get(servicerequest.service_id)
    professional=Professional.query.get(servicerequest.professional_id)
    if not servicerequest:
      return jsonify({"message": "Service Request not found"}), 404
    servicerequest.status = "Completed"
    servicerequest.completiondate=datetime.now()
    db.session.commit()
    msg=f'Your service request for {service.name} service has been completed by Professional {professional.name}'
    approval_rejection_mail(customer.email,"Service Request Completion",msg,customer.name,"Customer")
    return jsonify({"message": "Service Request Updated successfully"}), 200
  
  @app.route('/professional/servicerequest/open/<int:id>', methods=['PUT'])
  def servicerequest_open(id):
    servicerequest = ServiceRequest.query.get(id)
    if not servicerequest:
      return jsonify({"message": "Service Request not found"}), 404
    servicerequest.status = "Accepted"
    servicerequest.completiondate=' '
    db.session.commit()
    return jsonify({"message": "Service Request Updated successfully"}), 200

  @app.route('/professional/profile', methods=['POST'])
  def updateProfile():
    data = request.get_json()
    userId = data.get('userId')
    description=data.get('description')
    experience=data.get('experience')
    address = data.get('address')
    pincode = data.get('pincode')
    contact = data.get('contact')
    

    user = User.query.get(userId)
    if user:
        try:
          professionalId = user.professional.id
          professional = Professional.query.get(professionalId)
          professional.description=description
          professional.experience=experience
          professional.address = address
          professional.pincode = pincode
          professional.contact = contact          
          db.session.commit()
          return jsonify({"message": "Professional Updated Successfully"}), 200
        except Exception as e:
          db.session.rollback()
          return jsonify({"message": {e}}), 404
     

#***************************Professional Functions Start********************

  @app.route('/customer/profile', methods=['POST'])
  def updateCustomer():
    data = request.get_json()
    userId = data.get('userId')

    name = data.get('name')
    address = data.get('address')
    pincode = data.get('pincode')
    contact = data.get('contact')

    user = User.query.get(userId)
    if user:
        try:
          customerId = user.customer.id
          customer = Customer.query.get(customerId)
          customer.name = name
          customer.address = address
          customer.pincode = pincode
          customer.contact = contact
          db.session.commit()
          return jsonify({"message": "Customer Updated Successfully"}), 200
        except Exception as e:
          db.session.rollback()
          return jsonify({"message": {e}}), 404

  def updateAvgRatingProfessional(professionalId):
    service_requests = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professionalId,
        ServiceRequest.status == 'Closed'
    ).all()

    if service_requests:
        avg_rating = sum(rating.ratings for rating in service_requests if rating.ratings is not None) / len(service_requests)
    else:
        avg_rating = 0  

    professional = Professional.query.get(professionalId)
    if professional:
        professional.ratings = avg_rating
        db.session.commit()
        return "OK"

  @app.route('/customer/feedback/', methods=['POST'])
  def servicerequest_feedback():
    data = request.get_json()
    serviceRequestId = data.get('serviceRequestId')
    ratings = data.get('rating')
    feedback = data.get('feedback')
   
    servicerequest = ServiceRequest.query.get(serviceRequestId)
    
    if not servicerequest:
      return jsonify({"message": "Service Request not found"}), 404
    if servicerequest.status=="Completed":
      servicerequest.ratings = ratings
      servicerequest.remarks = feedback
      servicerequest.status="Closed"
      db.session.commit()
      updateAvgRatingProfessional(servicerequest.professional_id)
      return jsonify({"message": "Ratings/feedback Updated successfully"}), 200
    else:
      return jsonify({"message": "Service Request not Complete Yet"}), 404


#******************Other Utility Functions Start***********************

  @app.route('/changepassword', methods=['POST'])
  def changePassword():
    data = request.get_json()
    userId = data.get("userId")
    password = data.get("password")
    newpassword = data.get("newpassword")
    confirmpassword = data.get("confirmpassword")

    user = user_datastore.find_user(id=userId)

    if not user:
      return jsonify({"message": "User not found"}), 404

    if verify_password(password,
                       user.password) and newpassword == confirmpassword:
      user.password = hash_password(newpassword)
      db.session.commit()
    else:
      return jsonify({"message": "Password Not Matched"}), 404
    return jsonify({"message": "User Updated successfully"}), 200

  @app.route('/getprofessional/<int:id>', methods=['GET'])
  def getprofessional(id):
    user = Professional.query.get(id)
    professional = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "address": user.address,
        "contact": user.contact,
        "pincode": user.pincode,
        "description":user.description,
        "experience": user.experience,
        "services": [service.name for service in user.services],
        "active": int(user.active)
    }
    return jsonify(professional), 200

  @app.route('/getcustomer/<int:id>', methods=['GET'])
  def getcustomer(id):
    obj = Customer.query.get(id)
    customer = {
        "id": obj.id,
        "email": obj.email,
        "name": obj.name,
        "address": obj.address,
        "contact": obj.contact,
        "pincode": obj.pincode,
        "active": int(obj.active)
    }
    return customer, 200

  def getProfessionalId(userId):
    user = User.query.get(userId)
    return user.professional.id

  @app.route('/getprofessionalid/<int:userId>', methods=['GET'])
  def returnProfessionalId(userId):
    professionalId = getProfessionalId(userId)
    return jsonify(professionalId), 200

  def getCustomerId(userId):
    user = User.query.get(userId)
    return user.customer.id

  @app.route('/getcustomerid/<int:userId>', methods=['GET'])
  def returnCustomerId(userId):
    customerId = getCustomerId(userId)
    return jsonify(customerId), 200
  
  @app.route('/getprofessionaluserid/<int:prfoessionalId>', methods=['GET'])
  def getProfessional_UserId(prfoessionalId):
    professional=Professional.query.get(prfoessionalId)
    return professional.user_id
  
  @app.route('/getcustomeruserid/<int:customerId>', methods=['GET'])
  def getCustomer_UserId(customerId):
    customer=Customer.query.get(customerId)
    return customer.user_id

  @app.route('/createUser')
  def createUser(user_datastore: SQLAlchemyUserDatastore, useremail,
                 userpassword, userrole):
    if not user_datastore.find_user(email=useremail):
      user_datastore.create_user(email=useremail,
                                 password=hash_password(userpassword),
                                 active=True,
                                 roles=[userrole])
      db.session.commit()
      return True
    else:
      return False
    
  @app.route('/downloadfile/services')
  def download_csv_services():
    task = export_job.delay("Services")
    return jsonify({"taskId":task.id}),200 
  
  @app.route('/downloadfile/professionals')
  def download_csv_professionals():
    task = export_job.delay("Professionals")
    return jsonify({"taskId":task.id}),200 
  
  @app.route('/downloadfile/customers')
  def download_csv_customers():
    task = export_job.delay("Customers")
    return jsonify({"taskId":task.id}),200 
  
  @app.route('/downloadfile/servicerequests')
  def download_csv_servicerequests():
    task = export_job.delay("ServiceRequests")
    return jsonify({"taskId":task.id}),200  
  
  @app.route('/downloadfile/servicerequests/customrs/<int:customerId>')
  def download_csv_servicerequests_bycustomer(customerId):  
    task = export_job_customer.delay(customerId)
    return jsonify({"taskId":task.id}),200  
  
  @app.route('/downloadfile/servicerequests/professionals/<int:professionalId>')
  def download_csv_servicerequests_byprofessional(professionalId):  
    task = export_job_professional.delay(professionalId)
    return jsonify({"taskId":task.id}),200  
  
  @app.route('/getcsv/<task_id>')
  def getCsv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        return send_file('downloads/file.csv'),200
        # filename=res.result
        # return send_file(filename,as_attachement=True)
    else:
        return "task not ready", 405

  
  