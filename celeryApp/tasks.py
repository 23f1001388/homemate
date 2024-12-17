from celery import shared_task
import time
from flask_excel import make_response_from_query_sets
from application.models import Service,ServiceRequest,Professional,Customer
from application.mailservice import send_email
from datetime import datetime,timedelta
from application.models import db
# from application.mailing import send_email


@shared_task()
def add(x,y):
    time.sleep(15)
    return x+y

@shared_task(ignore_result = False)
def export_job(reportType):
    print(reportType)
    objdata=None
    column_names=[]
    filename=''
    if reportType=='Services':
        objdata=Service.query.with_entities(Service.id,
        Service.name,Service.description,Service.price,Service.timerequired).all()
        column_names=["id","name","description","price","timerequired"]
    elif reportType=='Professionals':
        objdata=Professional.query.with_entities(Professional.id,
        Professional.name,Professional.experience,
        Professional.address,Professional.contact).all()
        column_names=["id","name","experience","address","contact"]
    elif reportType=='Customers':
        objdata=Customer.query.with_entities(Customer.id,
        Customer.name,Customer.address,Customer.contact).all()
        column_names=["id","name","address","contact"]
    elif reportType=='ServiceRequests':
        objdata=ServiceRequest.query.with_entities(ServiceRequest.service_id,
        ServiceRequest.professional_id,ServiceRequest.customer_id,
        ServiceRequest.requestdate,ServiceRequest.remarks).all()
        print(objdata)
        column_names=["service_id","professional_id","customer_id","requestdate","remarks"]
    csv_out = make_response_from_query_sets(objdata, column_names, 'csv', filename='file.csv')
    filename='file.csv'
   
    with open(f'./downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result = False)
def export_job_customer(customerId):
    dataObject = db.session.query(
        ServiceRequest.id,
        ServiceRequest.requestdate,
        ServiceRequest.requesttime,
        ServiceRequest.instructions,
        ServiceRequest.completiondate,
        ServiceRequest.status,
        ServiceRequest.ratings,
        ServiceRequest.remarks,
        Service.name.label('service_name'),
        Professional.name.label('professional_name'),
        Professional.contact.label('professional_contact')
    ).join(Service, Service.id == ServiceRequest.service_id) \
     .join(Professional, Professional.id == ServiceRequest.professional_id) \
     .filter(ServiceRequest.customer_id == customerId).all()
        
        # Append the dictionary to the dataObject list

    column_names=["service_name","professional_name","professional_contact","requestdate","status"]

    csv_out = make_response_from_query_sets(dataObject, column_names, 'csv', filename='file.csv')
    filename='file.csv'
   
    with open(f'./downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result = False)
def export_job_professional(professionalId):
    dataObject = db.session.query(
        ServiceRequest.id,
        ServiceRequest.requestdate,
        ServiceRequest.requesttime,
        ServiceRequest.instructions,
        ServiceRequest.completiondate,
        ServiceRequest.status,
        ServiceRequest.ratings,
        ServiceRequest.remarks,
        Service.name.label('service_name'),
        Customer.name.label('customer_name'),
        Customer.contact.label('customer_contact')
    ).join(Service, Service.id == ServiceRequest.service_id) \
     .join(Customer, Customer.id == ServiceRequest.customer_id) \
     .filter(ServiceRequest.professional_id == professionalId).all()
        
        # Append the dictionary to the dataObject list

    column_names=["service_name","customer_name","customer_contact","requestdate","status"]

    csv_out = make_response_from_query_sets(dataObject, column_names, 'csv', filename='file.csv')
    filename='file.csv'
   
    with open(f'./downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    
    return filename


@shared_task(ignore_result = False)
def daily_reminder(to,sub,msg):
    servicerequests = ServiceRequest.query.filter(ServiceRequest.status == 'Requested').all()

    # Dictionary to store requests grouped by professional
    professional_requests = {}

    subject = "Pending Service Requests"

    # Group service requests by professional
    for servicerequest in servicerequests:
        professional = Professional.query.get(servicerequest.professional_id)

        if professional.id not in professional_requests:
            professional_requests[professional.id] = {
                'professional': professional,
                'requests': []  # Initialize a list of requests for this professional
            }

        # Add service request to the professional's list
        service = Service.query.get(servicerequest.service_id)
        customer = Customer.query.get(servicerequest.customer_id)
        professional_requests[professional.id]['requests'].append({
            'service': service,
            'customer': customer,
            'servicerequest': servicerequest
        })

    # Now send an email for each professional with their pending requests
    for professional_id, data in professional_requests.items():
        professional = data['professional']
        requests = data['requests']

        # Construct the email body for the professional
        newmessage = f'''
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }}
                    h3 {{
                        color: #4CAF50;
                        font-size: 24px;
                    }}
                    .table-wrapper {{
                        margin-top: 20px;
                        width: 100%;
                        border-collapse: collapse;
                    }}
                    .table-wrapper th, .table-wrapper td {{
                        padding: 12px 15px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }}
                    .table-wrapper th {{
                        background-color: #4CAF50;
                        color: white;
                    }}
                    .table-wrapper tr:nth-child(even) {{
                        background-color: #f2f2f2;
                    }}
                    .footer {{
                        margin-top: 30px;
                        text-align: center;
                        color: #777;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Dear {professional.name},</h3>
                    <p>You have pending service requests that need your attention:</p>

                    <h3>Pending Service Requests</h3>
                    <table class="table-wrapper">
                        <tr>
                            <th>Customer</th>
                            <th>Location</th>
                            <th>Contact</th>
                            <th>Service</th>
                            <th>Request Date</th>
                        </tr>
        '''

        # Add each service request for this professional to the table
        for request in requests:
            customer = request['customer']
            servicerequest = request['servicerequest']
            service = request['service']

            newmessage += f'''
            <tr>
                <td>{customer.name}</td>
                <td>{customer.address}</td>
                <td>{customer.contact}</td>
                <td>{service.name}</td>
                <td>{servicerequest.requestdate}</td>
            </tr>
            '''

        # End the table and the email content
        newmessage += f'''
                    </table>
                    <div class="footer">
                        <p>This is an automated reminder. Please take necessary actions.</p>
                    </div>
                </div>
            </body>
        </html>
        '''

        # Send email to the professional with all pending requests
        send_email(professional.email, subject, newmessage)

    return "Daily report emails sent successfully."


@shared_task(ignore_result=False)
def monthly_report(to, sub, msg):
    # Get the start and end of the previous month
    today = datetime.today()
    first_day_of_this_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_this_month - timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)

    # Query all service requests from the previous month
    servicerequests = ServiceRequest.query.filter(
        ServiceRequest.requestdate >= first_day_of_last_month,
        ServiceRequest.requestdate <= last_day_of_last_month
    ).all()

    # Create dictionaries to group service requests by customer and professional
    customer_requests = {}
    professional_requests = {}

    # Group service requests by customer and by professional
    for servicerequest in servicerequests:
        service = Service.query.get(servicerequest.service_id)
        professional = Professional.query.get(servicerequest.professional_id)
        customer = Customer.query.get(servicerequest.customer_id)

        # Group by Customer
        if customer.id not in customer_requests:
            customer_requests[customer.id] = {
                'customer': customer,
                'requests': []
            }
        customer_requests[customer.id]['requests'].append({
            'service': service,
            'servicerequest': servicerequest
        })

        # Group by Professional
        if professional.id not in professional_requests:
            professional_requests[professional.id] = {
                'professional': professional,
                'requests': []
            }
        professional_requests[professional.id]['requests'].append({
            'service': service,
            'servicerequest': servicerequest,
            'customer': customer
        })

    # Send report to each customer
    for customer_id, data in customer_requests.items():
        customer = data['customer']
        requests = data['requests']

        # Construct email for the customer
        newmessage = f'''
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }}
                    h3 {{
                        color: #4CAF50;
                        font-size: 24px;
                    }}
                    .table-wrapper {{
                        margin-top: 20px;
                        width: 100%;
                        border-collapse: collapse;
                    }}
                    .table-wrapper th, .table-wrapper td {{
                        padding: 12px 15px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }}
                    .table-wrapper th {{
                        background-color: #4CAF50;
                        color: white;
                    }}
                    .table-wrapper tr:nth-child(even) {{
                        background-color: #f2f2f2;
                    }}
                    .footer {{
                        margin-top: 30px;
                        text-align: center;
                        color: #777;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Dear {customer.name},</h3>
                    <p>Here is a summary of your service requests for the month of {last_day_of_last_month.strftime('%B %Y')}:</p>

                    <h3>Service Requests</h3>
                    <table class="table-wrapper">
                        <tr>
                            <th>Service</th>
                            <th>Professional</th>
                            <th>Request Date</th>
                        </tr>
        '''

        # Add each request for this customer to the table
        for request in requests:
            service = request['service']
            servicerequest = request['servicerequest']
            professional = Professional.query.get(servicerequest.professional_id)

            newmessage += f'''
            <tr>
                <td>{service.name}</td>
                <td>{professional.name}</td>
                <td>{servicerequest.requestdate}</td>
            </tr>
            '''

        # End the table and the email content
        newmessage += f'''
                    </table>
                    <div class="footer">
                        <p>This is an automated report. Please contact us for further inquiries.</p>
                    </div>
                </div>
            </body>
        </html>
        '''

        # Send email to the customer with their service requests
        send_email(customer.email, f"Monthly Service Report - {last_day_of_last_month.strftime('%B %Y')}", newmessage)

    # Send report to each professional
    for professional_id, data in professional_requests.items():
        professional = data['professional']
        requests = data['requests']

        # Construct email for the professional
        newmessage = f'''
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }}
                    h3 {{
                        color: #4CAF50;
                        font-size: 24px;
                    }}
                    .table-wrapper {{
                        margin-top: 20px;
                        width: 100%;
                        border-collapse: collapse;
                    }}
                    .table-wrapper th, .table-wrapper td {{
                        padding: 12px 15px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }}
                    .table-wrapper th {{
                        background-color: #4CAF50;
                        color: white;
                    }}
                    .table-wrapper tr:nth-child(even) {{
                        background-color: #f2f2f2;
                    }}
                    .footer {{
                        margin-top: 30px;
                        text-align: center;
                        color: #777;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Dear {professional.name},</h3>
                    <p>Here is a summary of the service requests you handled in the month of {last_day_of_last_month.strftime('%B %Y')}:</p>

                    <h3>Service Requests</h3>
                    <table class="table-wrapper">
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Request Date</th>
                            <th>Status<
                        </tr>
        '''

        # Add each request for this professional to the table
        for request in requests:
            service = request['service']
            servicerequest = request['servicerequest']
            customer = request['customer']

            newmessage += f'''
            <tr>
                <td>{customer.name}</td>
                <td>{service.name}</td>
                <td>{servicerequest.requestdate}</td>
                <td>{servicerequest.status}</td>
            </tr>
            '''

        # End the table and the email content
        newmessage += f'''
                    </table>
                    <div class="footer">
                        <p>This is an automated report. Please contact us for further inquiries.</p>
                    </div>
                </div>
            </body>
        </html>
        '''

        # Send email to the professional with their service requests
        send_email(professional.email, f"Monthly Service Report - {last_day_of_last_month.strftime('%B %Y')}", newmessage)

    return "Monthly report emails sent successfully."

@shared_task(ignore_result=False)
def approval_rejection_mail(to,sub, message,name,person):
    newmessage=f'''
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }}
                    h3 {{
                        color: #4CAF50;
                        font-size: 24px;
                    }}
                    h4{{
                        color:red;
                        font-size: 20px;
                    }}
                    .table-wrapper {{
                        margin-top: 20px;
                        width: 100%;
                        border-collapse: collapse;
                    }}
                    .table-wrapper th, .table-wrapper td {{
                        padding: 12px 15px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }}
                    .table-wrapper th {{
                        background-color: #4CAF50;
                        color: white;
                    }}
                    .table-wrapper tr:nth-child(even) {{
                        background-color: #f2f2f2;
                    }}
                    .footer {{
                        margin-top: 30px;
                        text-align: center;
                        color: #777;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Dear {person} Sh. {name},</h3>
                    
                    <h4 class="danger">{message}</h4>
            <div class="footer">
                        <p>This is an automated report. Please contact us for further inquiries.</p>
                    </div>
                </div>
            </body>
        </html>
        '''
    send_email(to, sub, newmessage)
    return "OK"

@shared_task(ignore_result=False)
def newReport(to,sub, prevmessage):
    # Fetch all service requests from the previous month
    message=prevmessage
    servicerequests = ServiceRequest.query.all()
    customer_requests = {}
    customers=Customer.query.all()
    for customer in customers:
        for servicerequest in servicerequests:
            if(servicerequest.customer_id==customer.id):
            # customer = Customer.query.get(servicerequest.customer_id)
            # professional = Professional.query.get(servicerequest.professional_id)   
            # service = Service.query.get(servicerequest.service_id)
                to=customer.email
                sub="New Customer Mail"
                message += f'<ul>'
                message += f'<li><strong>Service:</strong> {servicerequest.id}</li>'
                message += f'<li><strong>Requested By:</strong> {servicerequest.requestdate}</li>'
                message += f'<li><strong>Status:</strong> {servicerequest.status}</li>'
                message += f'</ul>'

        send_email(to, sub, message)
    return "OK"