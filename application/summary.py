from application.models import Service, Professional, Customer, ServiceRequest
from flask import jsonify
from sqlalchemy import func

def serviceRequestsData(professionalId=None,customerId=None):
  query = ServiceRequest.query.with_entities(
        ServiceRequest.status, 
        func.count(ServiceRequest.id).label('count')
    ).group_by(ServiceRequest.status)
  
  if professionalId:
    servicerequestsdata = query.filter(
        ServiceRequest.professional_id == professionalId
    ).all()
  if customerId:
      servicerequestsdata = query.filter(
        ServiceRequest.customer_id == customerId
    ).all()
  if not professionalId and not customerId:
     servicerequestsdata = query.all()   
  # print("Printed from Summary RequestData: ",servicerequestsdata)
  result = [{"status": status, "count": count} for status, count in servicerequestsdata]
  # print("Printed from Summary RequestData : ",result)
  return result

def customersRatingsData(professionalId=None,customerId=None):
  mydata = {}

    # Build the query
  query = ServiceRequest.query.filter(ServiceRequest.ratings > 0)

  # Add filters if professionalId or customerId is provided
  if professionalId:
      query = query.filter(ServiceRequest.professional_id == professionalId)
  if customerId:
      query = query.filter(ServiceRequest.customer_id == customerId)

  # Fetch all the service requests based on the query
  servicerequests = query.all()

  # Count the occurrences of each rating
  for servicerequest in servicerequests:
      if servicerequest.ratings in mydata:
          mydata[servicerequest.ratings] += 1
      else:
          mydata[servicerequest.ratings] = 1

  # Convert the dictionary into a list of dictionaries for easy JSON response
  result = [{"ratings": ratings, "count": count} for ratings, count in mydata.items()]
  return result


def RatingsData(professionalId=None,customerId=None):
  mydata={}
  servicerequests=ServiceRequest.query.filter(ServiceRequest.ratings>0).all()
  for servicerequest in servicerequests:
    if servicerequest.ratings in mydata:
      mydata[servicerequest.ratings]+=1
    else:
      mydata[servicerequest.ratings]=1
  result = [{
        "ratings": ratings,
        "count": count
    } for ratings, count in mydata]
  return jsonify(mydata)


    # servicerequestsdata = ServiceRequest.query.with_entities(
    #     ServiceRequest.ratings,
    #     func.count(ServiceRequest.id).label('count')).group_by(
    #         ServiceRequest.ratings).all()
    # print("Printed from Ratings: ", servicerequestsdata)
    # result = [{
    #     "ratings": ratings,
    #     "count": count
    # } for ratings, count in servicerequestsdata]
    # print("Printed from Ratings: ", result)
    # return result