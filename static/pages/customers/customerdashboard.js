import CustomerNavbar from "../../components/customernavbar.js";

const CustomerDashboard = {
    template: `
    <div>
        <CustomerNavbar/>
    </div>
    <div v-if="isWaiting" class="row justify-content-center p-5">
        <div class="col shadow-lg border p-3 rounded-5">
            <div class="alert alert-danger fs-6" v-if="isWaiting">Waiting....</div>
        </div>
    </div>
    <h4 class="text-center">Looking For ?</h4>
    <div class="row row-cols-5 justify-content-center">
            <div v-for="service in services" :key="service.id" class="col shadow-lg border p-3 rounded-5 m-2 d-flex flex-column justify-content-between">
                <h5 class="text-center"><span class="badge text-bg-danger">{{ service.name }}</span></h5>
                <p class="text-center"><strong>Service Description:</strong>{{ service.description }}</p>
                <p class="text-center"><strong>Service Price:</strong> Rs. {{ service.price }}</p>
                <p class="text-center"><strong>Time Required:</strong> {{ service.timerequired }}  Hours</p>           
                <router-link :to="'/customer/services/' + service.id" class="btn btn-dark mx-auto btn-sm"><i class="bi bi-binoculars"></i> Explore</router-link>
            </div>
    </div>

    <div class="row justify-content-center p-5">
           <div v-if="serviceRequests.length>0" class="col shadow-lg border p-3 rounded-5">
                <div class="d-flex justify-content-between">
                    <span class="fs-3">Service History</span>
                    <button class="btn btn-primary ms-auto" @click="exportServiceRequests">Export CSV</button>
                 </div> 
                <table class="table responsive">
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
                            <span v-if="servicerequest.status==='Rejected'" class="badge text-bg-danger">{{servicerequest.status}}</span>
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

    <div class="modal fade" id="messageModal" tabindex="-1" role="dialog" aria-labelledby="messageModalCenter" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header d-flex justify-content-center align-items-center">
                <h5 class="modal-title" id="messageModalCenter">
                    <i class="bi bi-envelope-arrow-down" style="font-size: 3rem;"></i> 
                </h5>
            </div>
            <div class="modal-body">
                    <h5 class="alert">{{errorMessage}}</h5>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
    </div>
    `,
    data() {
        return {
            services: [],
            serviceRequests:[],
            serviceProfessionals:[],
            customerId:'',
            isWaiting:false,
            errorMessage:'',
        }
    },
    components: {
        CustomerNavbar,
    },
    created(){
        const user=JSON.parse(sessionStorage.getItem('user'));
        this.customerId=user.user_id;
        console.log("User Id is: " ,user.id);
    },  
    mounted() {
        this.getServices();
        this.getServicesRequests();
        this.getServicesProfessionals();
    },
    methods: {
        showError(message) {
            this.errorMessage = message;  
            const modalElement = document.getElementById('messageModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();  
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
                    console.log(data);
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

        async getServicesProfessionals() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + "/getServices", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    this.serviceProfessionals = data;
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

        async exportServiceRequests(){
            this.isWaiting=true;
            const url=window.location.origin;
            const result=await fetch(url+ `/downloadfile/servicerequests/customrs/${this.customerId}`);
            const data=await result.json();
            if(result.ok){
                const taskId=await data['taskId'];
                const intv=setInterval(async ()=>{
                    const csvresult=await fetch(`/getcsv/${taskId}`);
                    if(csvresult.ok){
                        this.isWaiting=false;
                        clearInterval(intv);
                        window.location.href=`/getcsv/${taskId}`
                    }
                },1000)
            }
        },


    },
    computed: {
        current_user() {
            return this.$store.state.current_user;
        },

    },
}

export default CustomerDashboard;