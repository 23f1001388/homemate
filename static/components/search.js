import AdminNavbar from "../components/adminnavbar.js";
import ProfessionalNavbar from "../components/professionalnavbar.js";
import CustomerNavbar from "../components/customernavbar.js";


const Search={
    template:`
    <div v-if="role=='admin'">
        <AdminNavbar/>
    </div>
    <div v-if="role=='professional'">
        <ProfessionalNavbar/>
    </div>
    <div v-if="role=='customer'">
        <CustomerNavbar/>
    </div>

    <div class="row justify-content-center p-5" >
           <div class="col shadow-lg border p-3 rounded-5">
                <div class="row">
                    <div class="col-6">
                        <h4 class="text-center">Search</h4>
                    </div>
                    <div class="col-6">
                        <div class="input-group">
                            <select v-model="searchType" @change="getSelected" class="form-select">
                                <option value="Select Search Type">Select Search Type</option>
                                <option 
    v-if="role=='admin' || role=='customer'" value="Professional">Professional</option>
                                <option v-if="role=='admin' || role=='professional'"  value="Customer">Customer</option>
                                <option value="Service">Service</option>
                                <option value="ServiceRequest">Service Request</option>
                            </select>

                            <select v-model="subType" class="form-select">
                                <option value="Select Subtype">Select Subtype</option>
                                <option v-for="(label, value) in subTypes" :key="value" :value="value">{{ label }}</option>
                            </select>
                             <input v-model="searchText"  class="form-control" name="searchText" id="searchText" type="text" placeholder="Type to Search" aria-label="Search" required />
                            <button @click="getSearched" class="btn btn-primary" ><i class="bi bi-search"></i> Search</button>
                        </div>
                    </div>
                </div> 
            </div>
    </div>
    
    <div class="row justify-content-center p-5" v-if="services.length>0">
           <div class="col shadow-lg border p-3 rounded-5"> 
                <h4>Services  Search Result</h4>
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Time(in Hrs.)</th>
         
                    </thead>
                    <tbody>
                    <tr v-for="service in services" :key="service.id">
                        <td>{{service.id}}</td>
                        <td>{{service.name}}</td>
                        <td>{{service.description}}</td>
                        <td>{{service.price}}</td>
                        <td>{{ service.timerequired }}</td>
                    </tr>
                    </tbody>

                </table>
               

            </div>
    </div>
    
    <div class="row justify-content-center p-5" v-if="professionals.length>0">
           <div class="col shadow-lg border p-3 border rounded-5">
                <h4>Professionals Search Result</h4>
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Experience</th>
                        <th>Service Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                    <tr v-for="professional in professionals" :key="professional.id">
                        <td>{{professional.id}}</td>
                        <td>{{professional.email}}</td>
                        <td>{{professional.name}}</td>
                        <td>{{professional.experience}} Years</td>
                        <td>{{ professional.services.join(', ') }}</td>
                        <td><span v-if="professional.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span></td>
                        <td v-if="role=='admin'">
                           <button v-if="professional.active!=1" class="btn btn-success btn-sm" @click="approveProfessional(professional.id)"><i class="bi bi-check-circle"></i> Approve</button>
                            <button v-if="professional.active==1" class="btn btn-danger btn-sm ms-3" @click="rejectProfessional(professional.id)"><i class="bi bi-x-circle"></i> Reject</button>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>
    <div class="row justify-content-center p-5" v-if="customers.length>0">
           <div class="col shadow-lg border p-3 border rounded-5">
                <h4>Customers Search Result</h4>
                <table class="table responsive">
                    <thead>
                        <th>Id</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                    <tr v-for="customer in customers" :key="customer.id">
                        <td>{{customer.id}}</td>
                        <td>{{customer.email}}</td>
                        <td>{{customer.name}}</td>
                        <td>{{customer.address}}</td>
                        <td>{{ customer.contact }}</td>
                        <td><span v-if="customer.active==1" class="badge text-bg-success">Active</span>
                            <span v-else class="badge text-bg-danger">Inactive</span></td>
                        <td v-if="role=='admin'">
                             <button v-if="customer.active!=1" class="btn btn-success btn-sm" @click="approveCustomer(customer.id)"><i class="bi bi-check-circle"></i> Approve</button>
                            <button v-if="customer.active==1" class="btn btn-danger btn-sm ms-3" @click="rejectCustomer(customer.id)"><i class="bi bi-x-circle"></i> Reject</button>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>

    <div class="row justify-content-center p-5" v-if="servicerequests.length>0">
           <div class="col shadow-lg border p-3 border rounded-5">
                <h4>Service Request  Search Result</h4>
                <table class="table responsive">
                    <thead>
                        <th>ID</th>
                        <th>Service Name</th>
                        <th>Professional Name</th>
                        <th>Phone No</th>
                        <th>Request Date</th>                        
                        <th>Status</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                    <tr v-for="servicerequest in servicerequests" :key="servicerequest.id">
                        <td>{{servicerequest.id}}</td>
                        <td>{{servicerequest.service_name}}</td>
                        <td>{{servicerequest.professional_name}}</td>
                        <td>{{ servicerequest.professional_contact }}</td>
                        <td>{{ servicerequest.requestdate }}</td>
                        <td>
                            <span v-if="servicerequest.status==='Requested'" class="badge text-bg-primary">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Assigned'" class="badge text-bg-warning">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Accepted'" class="badge text-bg-success">{{servicerequest.status}}</span>
                            <span v-if="servicerequest.status==='Closed'" class="badge text-bg-danger">{{servicerequest.status}}</span>
                        </td>
                        <td>
                            <router-link :to="'/customer/feedback/' + servicerequest.id" class="btn btn-danger rounded-3 ms-3 btn-sm"><i class="bi bi-trash3"></i> Close It ? </router-link>
                        </td>
                    </tr>
                    </tbody>

                </table>
            </div>
    </div>
    <div v-if="errorMessage" class="row justify-content-center p-5">
        <div class="col shadow-lg border p-3 rounded-5">
            <div class="alert alert-danger fs-6" v-if="errorMessage">{{errorMessage}}</div>
        </div>
    </div>
    `,
    data(){
        return{
            errorMessage:'',
            role:'',
            searchType: "Select Search Type",
            subType: "Select Subtype",
            searchText:'',
            allServices: [],
            services:[],
            professionals:[],
            customers:[],
            servicerequests:[],
            errorMessage:'',
            subTypes: {},
            professionalSearch: {
                "By Name": "By Name",
                "By Description": "By Description",
                "By Address": "By Address",
                "By Pincode": "By Pincode",
                "By Contact":"By Contact",
                "By Experience":"By Experience",
                "By Status":"By Status"
            },
            customerSearch: {
                "By Name": "By Name",
                "By Address": "By Address",
                "By Pincode": "By Pincode",
                "By Contact":"By Contact",
                "By Status":"By Status"
            },
            serviceSearch: {
                "By Name": "By Name",
                "By Description": "By Description",
                "By Price": "By Price",
                "By Status": "By Status",
            },
            serviceRequestSearch: {
                "By Service": "By Service",
                "By Professional": "By Professional",
                "By Customer": "By Customer",
                "By Request Date": "By Request Date",    
                "By Ratings": "By Ratings",
                "By Status": "By Status",
            },
        }
    },
    components:{
        AdminNavbar,
        ProfessionalNavbar,
        CustomerNavbar,
    },
    created() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        this.role = user.role;
    },
    methods:{
        getSearched(){
              if(this.searchType == "Professional"){
                   this.getProfessionals();
              }
              if(this.searchType == "Customer"){
                  this.getCustomers();
              }
              if(this.searchType == "Service"){
                  this.getServices();
              }
              if(this.searchType == "ServiceRequest"){
                  this.getServiceRequests();
              }
          },
        getSelected(){
            this.services=[];
            this.professionals=[];
            this.customers=[];
            this.servicerequests=[];

            switch (this.searchType) {
                case 'Professional':
                this.subTypes = this.professionalSearch;
                break;
                case 'Customer':
                this.subTypes = this.customerSearch;
                break;
                case 'Service':
                this.subTypes = this.serviceSearch;
                break;
                case 'ServiceRequest':
                this.subTypes = this.serviceRequestSearch;
                break;
                default:
                this.subTypes = {};
                break;
            }
            // Reset the selected subtype when search type changes
            this.selectedSubType = "Select Subtype";   
        },
        async getServices() {
            // const url = window.location.origin;
            const url = `${window.location.origin}/api/serviceapi`;
            const params = new URLSearchParams();  
            params.append('subType', this.subType); 
            params.append('searchText', this.searchText);
            try {
                const result = await fetch(`${url}?${params.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    if(data.length>0){
                        this.services = data;
                        this.errorMessage='';
                    }else{
                        this.allServices=[];
                        this.errorMessage="No Data Found";
                    };
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
            // const url = window.location.origin;
            const url = `${window.location.origin}/search/professionals`;
            const params = new URLSearchParams();  
            params.append('subType', this.subType); 
            params.append('searchText', this.searchText);
            console.log(this.subType,this.searchText)
            try {
                const result = await fetch(`${url}?${params.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    if(data.length>0){
                        this.professionals = data;
                        this.errorMessage='';
                    }
                    else {
                        this.professionals = [];  
                        this.errorMessage = 'No Data Found'; 
                    }

                }
                else {
                    const error = await result.json();
                    this.errorMessage=error.message;
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getCustomers() {
            // const url = window.location.origin;
            const url = `${window.location.origin}/search/customers`;
            const params = new URLSearchParams();  
            params.append('subType', this.subType); 
            params.append('searchText', this.searchText);
            console.log(this.subType,this.searchText);
            try {
                const result = await fetch(`${url}?${params.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    if(data.length>0){
                        this.customers = data;
                        this.errorMessage='';
                    }else{
                        this.customers=[];
                        this.errorMessage="No Data Found";
                    }

                }
                else {
                    const error = await result.json();
                    this.errorMessage=error.message;
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getServiceRequests() {
            const url = `${window.location.origin}/search/servicerequests`;
            const params = new URLSearchParams();  
            params.append('subType', this.subType); 
            params.append('searchText', this.searchText);
            console.log(this.subType,this,searchText)
            try {
                const result = await fetch(`${url}?${params.toString()}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    if(data.length>0){
                        this.servicerequests = data;
                        this.errorMessage='';
                    }else{
                        this.servicerequests=[];
                        this.errorMessage="No Data Found";
                    }


                }
                else {
                    const error = await result.json();
                    this.errorMessage=error.message;
                    console.log(error);
                }
            } catch (e) {
                this.errorMessage=error.message;
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
                    this.errorMessage = data;
                    const updatedProfessional = this.professionals.find(prof => prof.id === id);
                    if (updatedProfessional) {
                        updatedProfessional.active = 1;  // Update to active status
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
        async rejectProfessional(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/rejectprofessional/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.errorMessage = data;
                    const updatedProfessional = this.professionals.find(prof => prof.id === id);
                    if (updatedProfessional) {
                        updatedProfessional.active = 0;  // Update to active status
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
        async approveCustomer(id){
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/admin/approvecustomer/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                });
                if (result.ok) {
                    const data = await result.json();
                    this.errorMessage = data;
                    const updatedCustomer = this.customers.find(cust => cust.id === id);
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
                    this.errorMessage = data;
                    const updatedCustomer = this.customers.find(cust => cust.id === id);
                    if (updatedCustomer) {
                        updatedCustomer.active = 0;  // Update to active status
                    }
                }
                else {
                    const error = await result.json();
                    this.errormessage=error.message;
                    console.log(error);
                }
            } catch (e) {
                console.log(e);
            }
        },
      }
}

export default Search