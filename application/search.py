from application.models import Service, Professional, Customer, ServiceRequest
from enum import Enum
from application.common import format_date,format_datetime,getDate
from sqlalchemy import func

class SearchType(Enum):
    BY_NAME = "By Name"
    BY_ADDRESS = "By Address"
    BY_PINCODE = "By Pincode"
    BY_CONTACT = "By Contact"
    BY_STATUS = "By Status"
    BY_DESCRIPTION = "By Description"
    BY_EXPERIENCE = "By Experience"
    BY_PRICE="By Price"
    BY_TIMEREQUIRED="By TimeRequired"
    BY_RATINGS="By Ratings"
    BY_REMARKS="By Remarks"
    BY_REQUESTDATE = "By Request Date"
    BY_SERVICEID = "By Service"
    BY_PROFESSIONALID = "By Professional"
    BY_CUSTOMERID = "By Customer"
    

def searchProfessionals(subtype, search):
  professionals=[]
  objData=None
  
  subtype = SearchType(subtype)
  if subtype == SearchType.BY_NAME:
    objData = Professional.query.filter(Professional.name.like('%' + search + '%')).all()
  if subtype == SearchType.BY_DESCRIPTION:
    objData = Professional.query.filter(Professional.description.like('%' + search + '%')).all()
  if subtype == SearchType.BY_EXPERIENCE:
    objData = Professional.query.filter(Professional.experience>= search).all()
  if subtype == SearchType.BY_ADDRESS:
    objData = Professional.query.filter(Professional.address.like('%' + search + '%')).all()
  if subtype == SearchType.BY_PINCODE:
    objData = Professional.query.filter(Professional.pincode==search).all()
  if subtype == SearchType.BY_STATUS:
    objData = Professional.query.filter(Professional.active==search).all()
  
  if objData:
    for obj in objData:
      userdata = {"id": obj.id, "email": obj.email,"name": obj.name,"experience":obj.experience,"services":[service.name for service in obj.services],"active":int(obj.active)}
      professionals.append(userdata)
  return professionals


def searchCustomers(subtype, search):
  customers=[]
  objData=None
  subtype = SearchType(subtype)
  if subtype == SearchType.BY_NAME:
    objData = Customer.query.filter(Customer.name.ilike('%' + search + '%')).all()
  if subtype == SearchType.BY_ADDRESS:
    objData = Customer.query.filter(Customer.address.like('%' + search + '%')).all()
  if subtype == SearchType.BY_PINCODE:
    objData = Customer.query.filter(Customer.pincode==search).all()
  if subtype == SearchType.BY_CONTACT:
    objData = Customer.query.filter(Customer.contact==search).all()
  if subtype == SearchType.BY_STATUS:
    objData = Customer.query.filter(Customer.active==search).all()
  
  if objData:
    for obj in objData:
      userdata = {"id": obj.id, "email": obj.email,"name": obj.name,"address":obj.address,"contact":obj.contact,"pincode":obj.pincode,"active":int(obj.active)}
      customers.append(userdata)

  return customers


def searchServices(subtype, search):
  services=[]
  objData=None
  subtype = SearchType(subtype)

  if subtype == SearchType.BY_NAME:
    objData = Service.query.filter(Service.name.like('%' + search + '%')).all()
  elif subtype == SearchType.BY_DESCRIPTION:
    objData = Service.query.filter(Service.description.like('%' + search + '%')).all()
  elif subtype == SearchType.BY_PRICE:
    objData = Service.query.filter(Service.start_date == search).all()
  elif subtype == SearchType.BY_TIMEREQUIRED:
    objData = Service.query.filter(Service.end_date == search).all()
  
  if objData:
    for obj in objData:
      userdata = {"id": obj.id, "name": obj.name,"description":obj.description,"price":obj.price,"timerequired":obj.timerequired}
      services.append(userdata)

  return services


def searchServiceRequests(subtype, search):
  servicerequests=[]
  servicerequest=None
  subtype = SearchType(subtype)

  print(subtype,search)
  if subtype == SearchType.BY_SERVICEID:
    objData = ServiceRequest.query.filter(ServiceRequest.service_id==search).all()
  elif subtype == SearchType.BY_PROFESSIONALID:
    objData = ServiceRequest.query.filter(ServiceRequest.professional_id==search).all()
  elif subtype == SearchType.BY_CUSTOMERID:
    objData = ServiceRequest.query.filter(ServiceRequest.customer_id==search).all()
  elif subtype == SearchType.BY_RATINGS:
    objData = ServiceRequest.query.filter(ServiceRequest.ratings==search).all()
  elif subtype == SearchType.BY_REQUESTDATE:
    objData = ServiceRequest.query.filter(func.date(ServiceRequest.requestdate) == getDate(search)).all()
  elif subtype == SearchType.BY_REMARKS:
    objData = ServiceRequest.query.filter(ServiceRequest.remarks.like('%' + search + '%')).all()
  elif subtype == SearchType.BY_STATUS:
    objData = ServiceRequest.query.filter(ServiceRequest.status.like('%' + search + '%')).all()

    
  if objData:
    for servicerequest in objData:
      service=Service.query.filter(Service.id==servicerequest.service_id).first()
      professionalId=servicerequest.professional_id
      professional=Professional.query.filter(Professional.id==professionalId).first()
      customerId=servicerequest.customer_id
      customer=Customer.query.filter(Customer.id==customerId).first()
      
      data={
      "id":servicerequest.id,
      "requestdate":format_datetime(servicerequest.requestdate),
      "completiondate":format_datetime(servicerequest.completiondate),
      "status":servicerequest.status,
      "rating":servicerequest.ratings,
      "remarks":servicerequest.remarks,
      "service_id":service.id,
      "service_name":service.name,
      "service_description":service.description,
      "professional_id":professional.id,
      "professional_name":professional.name,
      "professional_contact":professional.contact,
      "customer_name":customer.name,
      "customer_contact":customer.contact,
      "customer_address":customer.address,
      "customer_pincode":customer.pincode  
      } 
      servicerequests.append(data)
  return servicerequests
