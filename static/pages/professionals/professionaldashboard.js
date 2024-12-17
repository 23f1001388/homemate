import ProfessionalNavbar from "../../components/professionalnavbar.js";

const ProfessionalDashboard = {
    template: `
    <div>
        <ProfessionalNavbar/>
    </div>
     <div v-if="isWaiting" class="row justify-content-center p-5">
        <div class="col shadow-lg border p-3 rounded-5">
            <div class="alert alert-danger fs-6" v-if="isWaiting">Waiting....</div>
        </div>
    </div>
    <div class="row justify-content-center p-5">
           <div v-if="serviceRequestsActive.length>0" class="col shadow-lg border p-3 rounded-5">
                <div class="d-flex justify-content-between">
                    <h4>Service Requests</h4>
                    <button class="btn btn-primary ms-auto" @click="exportServiceRequests">Export CSV</button>
                 </div> 
                <table class="table responsive mt-3" v-if="serviceRequestsActive.length>0">
                    <thead>
                        <th>ID</th>
                        <th>Request Date</th>
                        <th>Time</th>
                        <th>Instructions</th>
                        <th>Service Name</th>
                        <th>Customer Name</th>
                        <th>Contact No</th>
                        <th>Location</th>
                        <th>Pin Code</th>
                        <th>Completion Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                    <tr v-for="servicerequest in serviceRequestsActive" :key="servicerequest.id">
                        <td>{{ servicerequest.id }}</td>
                        <td>{{ servicerequest.requestdate }}</td>
                        <td>{{ servicerequest.requesttime }}</td>
                        <td>{{ servicerequest.instructions }}</td>
                        <td>{{ servicerequest.service_name }}</td>
                        <td>{{ servicerequest.customer_name }}</td>
                        <td>{{ servicerequest.customer_contact }}</td>
                        <td>{{ servicerequest.customer_address }}</td>
                        <td>{{ servicerequest.customer_pincode }}</td>
                        <td>{{servicerequest.completiondate}}</td>
                        <td>
                            <span v-if="servicerequest.status==='Requested'" class="badge text-bg-warning">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Accepted'" class="badge text-bg-success">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Closed'" class="badge text-bg-danger">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Rejected'" class="badge text-bg-danger">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Completed'" class="badge text-bg-success">{{servicerequest.status}}</span>
                        </td>
                        <td>
                            <button v-if="servicerequest.status==='Requested'" class="btn btn-success rounded-3 ms-3 btn-sm" @click="approveServiceRequest(servicerequest.id)"><i class="bi bi-check-circle"></i> Approve </button>
                            <button v-if="servicerequest.status==='Requested'" class="btn btn-danger rounded-3 ms-3 btn-sm" @click="rejectServiceRequest(servicerequest.id)"><i class="bi bi-x-circle"></i> Reject</button>
                            <button v-if="servicerequest.status==='Accepted'" class="btn btn-primary rounded-3 ms-3 btn-sm" @click="completeServiceRequest(servicerequest.id)"><i class="bi bi-check-circle"></i> Complete It </button>
                            <button v-if="servicerequest.status==='Completed'" class="btn btn-primary rounded-3 ms-3 btn-sm" @click="openServiceRequest(servicerequest.id)"><i class="bi bi-check-circle"></i> ReOpen It </button>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
             <div v-else class="col shadow-lg border p-3 rounded-5">
                <div class="d-flex justify-content-between">
                    <h5>No Active Services Requests</h5>
                </div>
            </div>
    </div>

    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 rounded-5" >
                <div v-if="serviceRequestsClosed.length > 0 ">
                <h4>Closed Service</h4>
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Service Name</th>
                        <th>Professional Name</th>
                        <th>Phone No</th>
                        <th>Location</th>
                        <th>Pin Code</th>
                        <th>Ratings</th>
                        <th>Feedback</th>
                        <th>Status</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                    <tr v-for="servicerequest in serviceRequestsClosed" :key="servicerequest.id">
                        <td>{{servicerequest.id}}</td>
                        <td>{{servicerequest.service_name}}</td>
                        <td>{{servicerequest.customer_name}}</td>
                        <td>{{ servicerequest.customer_contact }}</td>
                        <td>{{ servicerequest.customer_address }}</td>
                        <td>{{ servicerequest.customer_pincode }}</td>
                        <td><span v-for="n in servicerequest.ratings" :key="n" class="fs-4">★</span></td>
                        <td>{{ servicerequest.remarks }}</td>
                        <td><span v-if="servicerequest.status==='Closed'" class="badge text-bg-danger">{{servicerequest.status}}</span></td>
                    </tr>
                    </tbody>

                </table>
                </div>
                <div v-else>
                    <h5>No Closed Requests</h5>
                </div>
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
            serviceRequestsActive:[],
            serviceRequestsClosed:[],
            serviceProfessionals:[],
            professionalId:'',
            isWaiting:false,
            errorMessage:'',
        }
    },
    components: {
        ProfessionalNavbar,
    },
    created(){
        const user=JSON.parse(sessionStorage.getItem('user'));
        this.professionalId=user.user_id;
    },  
    mounted() {
        this.getServiceRequestsActive();
        this.getServiceRequestsClosed();
    },
    methods: {
        showError(message) {
            this.errorMessage = message;  
            const modalElement = document.getElementById('messageModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();  
        },
        async getServiceRequestsActive() {
            const url = window.location.origin;

            try {
                const result = await fetch(url + `/servicerequests/active/byprofessionals/${this.professionalId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log("Service Request Data: ",data);
                    this.serviceRequestsActive = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getServiceRequestsClosed() {
            const url = window.location.origin;

            try {
                const result = await fetch(url + `/servicerequests/closed/byprofessionals/${this.professionalId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log("Service Request Data: ",data);
                    this.serviceRequestsClosed= data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async approveServiceRequest(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/professional/servicerequest/approve/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " and mail sent accordingly");
                    const updatedServiceRequest = this.serviceRequests.find(request => request.id === id);
                    if (updatedServiceRequest) {
                        updatedServiceRequest.status = 'Accepted';  // Update to active status
                    }
                    this.serviceRequestsActive=[];
                    this.serviceRequestsClosed=[];
                    this.getServiceRequestsActive();
                    this.getServiceRequestsClosed();
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },

        async rejectServiceRequest(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/professional/servicerequest/reject/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " and mail sent accordingly");
                    const updatedServiceRequest = this.serviceRequests.find(request => request.id === id);
                    if (updatedServiceRequest) {
                        updatedServiceRequest.status = 'Rejected';  // Update to active status
                    }
                    this.serviceRequestsActive=[];
                    this.serviceRequestsClosed=[];
                    this.getServiceRequestsActive();
                    this.getServiceRequestsClosed();
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async completeServiceRequest(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/professional/servicerequest/complete/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " and mail sent accordingly");
                    this.serviceRequestsActive=[];
                    this.serviceRequestsClosed=[];
                    this.getServiceRequestsActive();
                    this.getServiceRequestsClosed();
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async openServiceRequest(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/professional/servicerequest/open/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.errorMessage = data;
                    this.serviceRequestsActive=[];
                    this.serviceRequestsClosed=[];
                    this.getServiceRequestsActive();
                    this.getServiceRequestsClosed();
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
            const result=await fetch(url+ `/downloadfile/servicerequests/professionals/${this.professionalId}`);
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
    }
}
export default ProfessionalDashboard;