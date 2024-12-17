import CustomerNavbar from "../../components/customernavbar.js";

const CustomerServices = {
    template: `
    <div>
        <CustomerNavbar/>
    </div>
    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 rounded-5">
                <h4 class="text-center">Best Services in <span class="badge text-bg-primary">{{service.name}}</span></h4>
                <div class="alert alert-danger" v-if="errorMessage">{{erroMessage}}</div>>
                <table class="table responsive border table-sm">
                    <thead>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Time(in Hrs.)</th>
                        <th>Prof Name</th>
                        <th>Description</th>
                        <th>Experience</th>
                        <th>Rating</th>
                        <th>Actions/Status</th>
                    </thead>
                    <tbody>
                    <tr v-for="service in serviceProfessionals">
                        <td>{{service.service_name}}</td>
                        <td>{{service.service_price}}</td>
                        <td>{{service.service_timerequired }}</td>
                        <td>{{service.professional_name }}</td>
                        <td>{{service.professional_description }}</td>
                        <td>{{service.professional_experience }}</td>
                        <td><span v-for="n in service.professional_ratings" :key="n" class="fs-4">★</span></td>
                        <td>
                            <div class="row">
                                <div class="col">
                                    <input v-model="requestdate" type="date" id="requestdate" class="form-control" placeholder="Select Date">
                                </div>
                                <div class="col">
                                    <input v-model="requesttime"  id="requesttime" type="time" class="form-control" placeholder="Time">
                                </div>
                                <div class="col">
                                    <div class="form-floating">            
                                    <textarea v-model="instructions" id="instructions" class="form-control" placeholder="Special Instructions"></textarea>
                                    <label for="instructions">Special Instructions</label>         
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <button v-if="service.request_status == ''" class="btn btn-primary btn-sm" @click="createServiceRequest(service.professional_id)">
                                <i class="bi bi-bag-plus"></i> Book Service
                            </button>
                            <span class="badge text-bg-warning" v-else>{{ service.request_status }}</span>
                        </td>

                    </tr>
                    </tbody>
                </table>
            </div>
    </div>
    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 rounded-5">
                <h4>Service History</h4>
                <table class="table responsive table-sm border">
                    <thead>
                        <th>ID</th>
                        <th>Service Name</th>
                        <th>Professional Name</th>
                        <th>Phone No</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Instructions</th>
                        <th>Ratings</th>
                        <th>Feedback</th>
                        <th>Status</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                    <tr v-for="servicerequest in serviceRequests" :key="servicerequest.id">
                        <td>{{servicerequest.id}}</td>
                        <td>{{servicerequest.service_name}}</td>
                        <td>{{servicerequest.professional_name}}</td>
                        <td>{{ servicerequest.professional_contact }}</td>
                        <td>{{ servicerequest.requestdate }}</td>
                        <td>{{ servicerequest.requesttime }}</td>
                        <td>{{ servicerequest.instructions }}</td>                        
                        <td><span v-for="n in servicerequest.ratings" :key="n" class="fs-4">★</span></td>
                        <td>{{ servicerequest.remarks }}</td>
                        <td>
                            <span v-if="servicerequest.status==='Requested'" class="badge text-bg-warning">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Accepted'" class="badge text-bg-success">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Completed'" class="badge text-bg-success">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Closed'" class="badge text-bg-danger">{{servicerequest.status}}</span>
                        </td>
                        <td>
                            <router-link v-if="servicerequest.status==='Requested'" :to="'/servicerequest/edit/' + servicerequest.id" class="btn btn-warning rounded-3 ms-3 btn-sm"><i class="bi bi-pencil"></i> Edit </router-link>
                            <router-link v-if="servicerequest.status==='Completed'" :to="'/customer/feedback/' + servicerequest.id" class="btn btn-danger rounded-3 ms-3 btn-sm"><i class="bi bi-trash3"></i> Close It ? </router-link>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>
    `,
    data() {
        return {
            serviceProfessionals: [],
            serviceRequests:[],
            service:'',
            serviceId:null,
            professionalId:'',
            userId:'',
            customerId:'',
            requestdate:'',
            requesttime:'',
            instructions:'',
            errorMessage:''
        }
    },
    components: {
        CustomerNavbar,
    },
    created(){
        this.serviceId = this.$route.params.id;
        const user=JSON.parse(sessionStorage.getItem('user'));
        this.userId=user.id;
        this.customerId=user.user_id;
      },
    mounted(){
        this.getService();
        this.getServicesRequests();
        this.getServiceProfessional();
    },
    methods: {
        async getService() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/api/serviceapi/${this.serviceId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    this.service=data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async getServices() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + "/api/serviceapi", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    this.services = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async getCustomerId() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/getcustomerid/${this.userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log("getCustomer Id is :" + data);
                    this.customerId=data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async getServiceProfessional() {
            const url = window.location.origin;
            console.log("this.CustomerId" + this.customerId);
            try {
                const result = await fetch(url + `/service/professionals/${this.serviceId}?customerId=${this.customerId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    this.serviceProfessionals=data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async getServiceProfessionals() {
            const url = window.location.origin;
            console.log("this.CustomerId" + this.customerId);
            try {
                const result = await fetch(url + `/service/professionals/${this.serviceId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    this.serviceProfessionals=data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async getServicesRequests() {
            const url = window.location.origin;

            try {
                const result = await fetch(url + `/servicerequests/bycustomers/${this.customerId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log("Service Request Data: ",data);
                    this.serviceRequests = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },


        async createServiceRequest(professional_id){
            try{
                const url=window.location.origin;
                if(this.requestdate=='' || this.requesttime){
                    this.errorMessage="Enter Request Date"
                }
                const result=await fetch(url + `/servicerequest/create/${professional_id}`,{
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        serviceId:this.serviceId,
                        userId: this.userId,
                        requestdate:this.requestdate,
                        requesttime:this.requesttime,
                        instructions:this.instructions

                    }),
                    credentials: 'same-origin',
                });
    
                if(result.ok){
                    const data=await result.json();
                    console.log(data);
                    this.errorMessage=data.message;
                }else {
                    const errorMsg = await result.json();
                    console.log("Failed to create Service request : ", errorMsg);
                    this.errorMessage="Failed to create Service request";
                  }
            }catch (error) {
                console.log("Fetch error:", error);
                this.errormessage="Fetch error:", error;
              }
        },


    },
    
}

export default CustomerServices;