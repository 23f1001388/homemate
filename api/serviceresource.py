from flask_restful import Resource,Api,fields,marshal_with,reqparse
from flask_security import auth_required,roles_required
from flask import jsonify,make_response,request
from application.models import Service
from application.application import db,cache


api=Api(prefix='/api')

create_service_parser=reqparse.RequestParser()

create_service_parser.add_argument('name',type=str)
create_service_parser.add_argument('description',type=str)
create_service_parser.add_argument('price',type=float)
create_service_parser.add_argument('timerequired',type=int)


edit_service_parser=reqparse.RequestParser()

edit_service_parser.add_argument('id',type=int)
edit_service_parser.add_argument('name',type=str)
edit_service_parser.add_argument('description',type=str)
edit_service_parser.add_argument('price',type=float)
edit_service_parser.add_argument('timerequired',type=int)

delete_service_parser=reqparse.RequestParser()

service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'price': fields.Float,
    'timerequired': fields.Integer
}

class ServiceAPI(Resource):
    @marshal_with(service_fields)
    @cache.cached(timeout=60,key_prefix="userData")
    def get(self,id=None):
        subType = request.args.get('subType')
        searchText = request.args.get('searchText')
        
        if subType and searchText:
            if subType == 'By Name':
                services = Service.query.filter(
                    Service.name.like('%' + searchText + '%')).all()
            if subType == 'By Description':
                services = Service.query.filter(
                    Service.description.like('%' + searchText + '%')).all()
            if subType == 'By Price':
                services = Service.query.filter(
                    Service.price >= searchText).all()
        elif id:
            services = Service.query.get(id)
        else:
            services = Service.query.all()

        if services is None:
            return jsonify({"message": "No Service Found"}), 404
        return services, 200
        
    def post(self):
        # args=create_service_parser.parse_args()
        args = request.get_json()
        name=args.get("name")
        description=args.get("description")
        price=args.get("price")
        timerequired=args.get("timerequired")
        
        print(name,description)
        if not name or not description or not price or not timerequired:
            return jsonify({"message":"Required Paramters are missing"}),404
        
        exists=Service.query.filter_by(name=name).first()
        
        if exists:
            return jsonify({"message":"Service alreday exists"}),404
        
        newService=Service(name=name,description=description,price=price,timerequired=timerequired)
        db.session.add(newService)
        db.session.commit()
        response = make_response(jsonify({"message": "Service successfully Created"}),200)
        return response
    
    def put(self):
        args=edit_service_parser.parse_args()
        id=args.get("serviceId")
        name=args.get("name")
        description=args.get("description")
        price=args.get("price")
        timerequired=args.get("timerequired")
        
        if not name or not description or not price or not timerequired:
            return jsonify({"message": "Required Paramters are missing"}),404
        
        service=Service.query.filter_by(name=name).first()
        service.name=name
        service.description=description
        service.price=price
        service.timerequired=timerequired
        db.session.commit()
        response = make_response(jsonify({"message": "Service successfully updated"}), 200)
        return response
    
    def delete(self):
        data = request.get_json()
        serviceId = data.get("serviceId")
      
        print("Service Id:",serviceId)
        
        service = Service.query.filter(Service.id == serviceId).first()
        
        if not service:
            return make_response(jsonify({"message": "Service not found"}), 404)
        Service.query.filter(Service.id==serviceId).delete()
        db.session.commit()
        response = make_response(jsonify({"message": "Service successfully Deleted"}), 200)
        return response
        

api.add_resource(ServiceAPI, '/serviceapi', endpoint='services')# For fetching all services
# api.add_resource(ServiceAPI, '/serviceapi', endpoint='services',)
api.add_resource(ServiceAPI, '/serviceapi/<int:id>', endpoint='service') 

