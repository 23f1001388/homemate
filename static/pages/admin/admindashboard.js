import AdminNavbar from "../../components/adminnavbar.js";

const AdminDashboard = {
    template: `
    <div>
        <AdminNavbar/>
    </div>
    <div v-if="isWaiting" class="row justify-content-center p-5">
        <div class="col shadow-lg border p-3 rounded-5">
            <div class="alert alert-danger fs-6" v-if="isWaiting">Waiting....</div>
        </div>
    </div>
    <div class="row justify-content-center p-5">
           <div v-if="allServices.length>0" class="col shadow-lg border p-3 rounded-5">
                <div class="d-flex justify-content-between">
                        <h4>Services</h4>
                        <router-link to="/admin/service/create" class="btn btn-dark btn-sm"><i class="bi bi-plus-circle"></i> Add New Service</router-link>
                        <button class="btn btn-primary" @click="exportCsvServices">Export CSV</button>    
                </div>    
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Time(in Hrs.)</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                    <tr v-for="service in allServices" :key="service.id">
                        <td><router-link to='' @click="getService(service.id)">{{service.id}}</router-link></td>
                        <td>{{service.name}}</td>
                         <td>{{service.description}}</td>
                        <td>{{service.price}}</td>
                        <td>{{ service.timerequired }}</td>
                        <td>
                            <router-link :to="'/admin/service/edit/' + service.id" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i> Edit</router-link>
                            <button class="btn btn-danger btn-sm ms-3" @click="deleteService(service.id)"><i class="bi bi-trash3"></i> Delete</button>
                        </td>
                    </tr>
                    </tbody>

                </table>
               

            </div>
            <div v-else shadow-lg border p-3 rounded-5>
                <div class="d-flex justify-content-between">
                    <h5>No Services yet</h5>
                    <router-link to="/admin/service/create" class="btn btn-dark btn-sm">
                    <i class="bi bi-plus-circle"></i>Add New Service</router-link>
                </div>
            </div>
    </div>

    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 border rounded-5">
                <div class="d-flex justify-content-between">
                    <h3>Professionals</h3>
                    <button class="btn btn-primary btn-sm" @click="exportCsvProfessionals">Export CSV</button> 
                </div>
                    <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Experience</th>
                        <th>Service Name</th>
                        <th>Location</th>
                        <th>Ratings</th>
                        <th>Status</th>
                        <th>Documents</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                    <tr v-for="professional in professionals" :key="professional.id">
                        <td><router-link to='' @click="getProfessional(professional.id)">{{professional.id}}</router-link></td>
                        <td>{{professional.email}}</td>
                        <td>{{professional.name}}</td>
                        <td>{{professional.description}}</td>
                        <td>{{professional.experience}} Years</td>
                        <td>{{professional.services.join(', ') }}</td>
                        <td>{{professional.address}}</td>
                        <td><span v-for="n in professional.ratings" :key="n" class="fs-4">★</span></td>
                        <td><span v-if="professional.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span>
                        </td>
                        <td><button @click="viewDocument(professional.email)" class="btn btn-primary btn-sm">View Documents</button></td>
                        <td>
                            <button v-if="professional.active!=1" class="btn btn-success btn-sm" @click="approveProfessional(professional.id)"><i class="bi bi-check-circle"></i> Approve</button>
                            <button v-if="professional.active==1" class="btn btn-danger btn-sm ms-3" @click="rejectProfessional(professional.id)"><i class="bi bi-x-circle"></i> Block</button>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>

    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 border rounded-5">
                <div class="d-flex justify-content-between">
                    <h3>Customers</h3>
                    <button class="btn btn-primary btn-sm" @click="exportCsvCustomers">Export CSV</button>
                </div> 
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Contact</th>
                         <th>Status</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                    <tr v-for="customer in customers" :key="customer.id">
                        <td><router-link to='' @click="getCustomer(customer.id)">{{customer.id}}</router-link></td>
                        <td>{{customer.email}}</td>
                        <td>{{customer.name}}</td>
                         <td>{{customer.address}}</td>
                        <td>{{customer.contact}} </td>                       
                        <td><span v-if="customer.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span>
                        </td>
                        <td>
                            <button v-if="customer.active!=1" class="btn btn-success btn-sm" @click="approveCustomer(customer.id)"><i class="bi bi-check-circle"></i> Approve</button>
                            <button v-if="customer.active==1" class="btn btn-danger btn-sm ms-3" @click="rejectCustomer(customer.id)"><i class="bi bi-x-circle"></i> Block</button>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>

    <div class="row justify-content-center p-5">
           <div class="col shadow-lg border p-3 rounded-5">
            <div class="d-flex justify-content-between">
                <h4>Service Requests</h4>
                <button class="btn btn-primary btn-sm" @click="exportCsvServiceRequests">Export CSV</button>
            </div>
            <table class="table responsive mt-3" v-if="serviceRequests.length>0">
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
                    </thead>
                    <tbody>
                    <tr v-for="servicerequest in serviceRequests" :key="servicerequest.id">
                        <td><router-link to='' @click="getServiceRequest(servicerequest.id)">{{ servicerequest.id }}</router-link></td>
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
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>

    <div class="modal fade" id="pdfModal" tabindex="-1" role="dialog" aria-labelledby="pdfModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="pdfModalLabel">Document Viewer</h5>
                <button type="button" class="btn btn-danger close ms-auto" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">Close &times;</span>
                </button>
            </div>
            <div class="modal-body">
                <iframe :src="pdfUrl" width="100%" height="500px" frameborder="0"></iframe>
            </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="serviceModal" tabindex="-1" role="dialog" aria-labelledby="serviceModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="serviceModalLabel">Service View</h5>
                <button type="button" class="btn btn-danger close ms-auto" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">Close &times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row row-cols-3 justify-content-center">
                    <div class="col shadow-lg border p-3 rounded-5 m-2 d-flex flex-column justify-content-between">
                        <h5 class="text-center"><span class="badge text-bg-danger">{{ service.name }}</span></h5>
                        <p class="text-center"><strong>Service Description:</strong>{{ service.description }}</p>
                        <p class="text-center"><strong>Service Price:</strong> Rs. {{ service.price }}</p>
                        <p class="text-center"><strong>Time Required:</strong> {{ service.timerequired }}  Hours</p>          
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="professionalModal" tabindex="-1" role="dialog" aria-labelledby="professionalModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="professionalModalLabel">Professional Details</h5>
                <button type="button" class="btn btn-danger close ms-auto" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">Close &times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row row-cols-3 justify-content-center">
                    <div class="col shadow-lg border p-3 rounded-5 m-2 d-flex flex-column justify-content-between">
                        <h5 class="text-center"><span class="badge text-bg-danger">Name : {{ professional.name }}</span></h5>
                        <p class="text-center"><strong>Email :</strong>{{ professional.email }}</p>
                        <p class="text-center"><strong>Location : </strong>{{ professional.address }}</p>
                        <p class="text-center"><strong>PIN Code : </strong>{{ professional.pincode }}</p>
                        <p class="text-center"><strong>Contact : </strong> {{ professional.contact }}</p>
                        <p class="text-center"><strong>Experience : </strong> {{ professional.experience }} Years</p>
                        <p class="text-center"><strong>Service : </strong>
                            <span><ul v-if="professional.services && professional.services.length" class="list-unstyled">
                                    <li v-for="service in professional.services" :key="service">{{ service }}</li>
                            </ul></span>
                        </p>
                        <p class="text-center"><strong>Status : </strong><span v-if="professional.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span>
                        </p>
                        
                                  
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>


     <div class="modal fade" id="customerModal" tabindex="-1" role="dialog" aria-labelledby="customerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="customerModalLabel">Customer Details</h5>
                <button type="button" class="btn btn-danger close ms-auto" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">Close &times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row row-cols-3 justify-content-center">
                    <div class="col shadow-lg border p-3 rounded-5 m-2 d-flex flex-column justify-content-between">
                        <h5 class="text-center"><span class="badge text-bg-danger">Name : {{ customer.name }}</span></h5>
                        <p class="text-center"><strong>Email :</strong>{{ customer.email }}</p>
                        <p class="text-center"><strong>Location : </strong>{{ customer.address }}</p>
                        <p class="text-center"><strong>PIN Code : </strong>{{ customer.pincode }}</p>
                        <p class="text-center"><strong>Contact : </strong> {{ customer.contact }}</p>
                         <p class="text-center"><strong>Status : </strong><span v-if="customer.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span>
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="serviceRequestModal" tabindex="-1" role="dialog" aria-labelledby="serviceRequestModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="serviceRequestModalLabel">Service Request Details</h5>
                <button type="button" class="btn btn-danger close ms-auto" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">Close &times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row row-cols-3 justify-content-center">
                    <div class="col shadow-lg border p-3 rounded-5 m-2 d-flex flex-column justify-content-between">
                        <h5 class="text-center"><span class="badge text-bg-danger">Service : {{ serviceRequest.service_name }}</span></h5>
                        <p class="text-center"><strong>Request Date :</strong>{{ serviceRequest.requestdate }}</p>
                        <p class="text-center"><strong>Professional : </strong>{{ serviceRequest.professional_name }}</p>
                        <p class="text-center"><strong>Prof Contact : </strong>{{ serviceRequest.professional_contact }}</p>
                        <p class="text-center"><strong>Customer : </strong>{{ serviceRequest.customer_name }}</p>
                        <p class="text-center"><strong>Status : </strong> {{ serviceRequest.status }}</p>
                    </div>
                </div>
            </div>
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
                    <h5 class="alert text-center">{{errorMessage}}</h5>
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
            serviceId:null,
            allServices: [],
            professionals:[],
            customers:[],
            serviceRequests:[],
            professionalId:'',
            serviceRequestId:'',
            errorMessage:'',
            pdfUrl:null,
            service:'',
            professional:'',
            customer:'',
            serviceRequest:'',
            isWaiting:false,
        }
    },
    components: {
        AdminNavbar,
    },
    mounted() {
        this.getServices();
        this.getProfessionals();
        this.getCustomers();
        this.getServiceRequests();
    },
    methods: {
        showError(message) {
            this.errorMessage = message;  
            const modalElement = document.getElementById('messageModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();  
        },
        showErrorTimed(message) {
            this.errorMessage = message;  
            setTimeout(() => {
                this.errorMessage = null;
                const modalElement = document.getElementById('messageModal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show(); 
            }, 3000); 
        },
        async exportCsvServices(){
            this.isWaiting=true;
            const url=window.location.origin;
            const result=await fetch('/downloadfile/services');
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
        async exportCsvProfessionals(){
            this.isWaiting=true;
            const url=window.location.origin;
            const result=await fetch('/downloadfile/professionals');
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
        async exportCsvCustomers(){
            this.isWaiting=true;
            const url=window.location.origin;
            const result=await fetch('/downloadfile/customers');
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
        async exportCsvServiceRequests(){
            this.isWaiting=true;
            const url=window.location.origin;
            const result=await fetch('/downloadfile/servicerequests');
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
        async getService(id) {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/api/serviceapi/${id}`);
                if (result.ok) {
                    const data = await result.json();
                    this.service = data;
                    const modalElement = document.getElementById('serviceModal');
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();  // Show the modal programmatically
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
                    this.allServices = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getProfessional(id) {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/professional/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    this.professional = data;
                    const modalElement = document.getElementById('professionalModal');
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();  // Show the modal programmatically

                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getProfessionals() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + "/admin/professionals", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    this.professionals = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async approveProfessional(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/approveprofessional/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " mail sent accordingly");
                    const updatedProfessional = this.professionals.find(prof => prof.id === id);
                    if (updatedProfessional) {
                        updatedProfessional.active = 1;  // Update to active status
                    }
                }
                else {
                    const error = await result.json();
                    console.log(error);
                    this.showError(error.message + " mail sent accordingly")
                }
            } catch (e) {
                console.log(e);
            }
        },
        async rejectProfessional(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/rejectprofessional/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    // this.errorMessage = data;
                    this.showError(data.message + " mail sent accordingly")
                    const updatedProfessional = this.professionals.find(prof => prof.id === id);
                    if (updatedProfessional) {
                        updatedProfessional.active = 0;  // Update to active status
                    }
                }
                else {
                    const error = await result.json();
                    console.log(error);
                    this.showError(error.message + " mail sent accordingly")
                }
            } catch (e) {
                console.log(e);
            }
        },        
        async getCustomer(id) {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/customer/${id}`);
                if (result.ok) {
                    const data = await result.json();
                    this.customer = data;
                    const modalElement = document.getElementById('customerModal');
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();  // Show the modal programmatically

                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getCustomers() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + "/admin/customers", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    this.customers = data;
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async approveCustomer(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/approvecustomer/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " mail sent accordingly");
                    const updatedCustomer= this.customers.find(cust => cust.id === id);
                    if (updatedCustomer) {
                        updatedCustomer.active = 1;  // Update to active status
                    }
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async rejectCustomer(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/rejectcustomer/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.showError(data.message + " mail sent accordingly");
                    const updatedCustomer= this.customers.find(cust => cust.id === id);
                    if (updatedCustomer) {
                        updatedCustomer.active =0;  // Update to active status
                    }
                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getServiceRequest(id) {
            const url = window.location.origin;

            try {
                const result = await fetch(url + `/servicerequest/byservicerequestid/${id}`);
                if (result.ok) {
                    const data = await result.json();
                    console.log("Service Request Data: ",data);
                    this.serviceRequest = data;
                    const modalElement = document.getElementById('serviceRequestModal');
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();  // Show the modal programmatically

                }
                else {
                    const error = await result.json();
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getServiceRequests() {
            const url = window.location.origin;

            try {
                const result = await fetch(url + `/servicerequest/viewall`, {
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
        async viewDocument(filepath){
            console.log(filepath+'.pdf');
            const url=window.location.origin;
            // this.pdfUrl = `http://localhost:5000/uploads/${filename}`;
            console.log(`${url}/uploads/${filepath}.pdf`);
            this.pdfUrl=`${url}/uploads/${filepath}.pdf`;
            // Show the modal using Bootstrap 5 JavaScript API (without jQuery)
            const modalElement = document.getElementById('pdfModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();  // Show the modal programmatically
        },
        async deleteService(id){
            const url=window.location.origin;
           
            console.log(this.serviceId);
            const result=await fetch(url + "/api/serviceapi",{
                method: "DELETE",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({
                    serviceId: id,
                }),
                credentials: "same-origin", 
            });
            if(result.ok){
                const data=await result.json();
                console.log(data)
                this.showError(data.message);        
            }else{
                const error=await result.json();
                console.log(error)
                this.showError(error.message);
            }
        },
       

    },
    computed: {
        current_user() {
            return this.$store.state.current_user;
        },

    },
}

export default AdminDashboard;