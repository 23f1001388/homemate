from flask_mail import Mail
from flask_mail import Message
from flask import jsonify,request,current_app
# from app import mail


def send_email(to, subject, content_body):
  msg = Message(subject, recipients=[to])
  msg.body = content_body
  try:
    mail = current_app.extensions['mail']
    mail.send(msg)
    return jsonify({'message':'Email sent successfully!'}),200
  except Exception as e:
    return jsonify({'message':f'Failed to send email: {e}'}),404