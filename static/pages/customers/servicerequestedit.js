import CustomerNavbar from "../../components/customernavbar.js";

const ServiceRequestEdit = {
  template: `
        <div>
            <CustomerNavbar/>
        </div>
        <div class="row justify-content-center p-5">
             <div class="col-md-4 shadow-lg border p-2">
                 <div class="p-3">
                    <h4 class="text-center">Edit Service Request</h4>
                     <div class="badge text-danger alert fs-6 text-wrap" v-show="errormessage">{{errormessage}}</div>
                        <div class="form-floating mb-3 mt-3">
                            <input v-model="serviceRequestId" type="text" class="form-control" id="servicerequestId" name="servicerequestId" placeholder="Service Id" disabled>
                            <label for="servicerequestId">Service Request ID</label>
                        </div>

                        <div class="form-floating mt-3">
                            <input v-model="requestdate" type="date" class="form-control" id="requestdate" name="requestdate" placeholder="Price" required>
                            <label for="requestdate" v-model="requestdate">{{servicerequest.date}}</label>
                            
                        </div>
                        
                        <div class="form-floating mt-3">
                            <input v-model="requesttime" type="time" class="form-control" id="requesttime" name="timerequired" placeholder="Time Required" required>
                            <label for="requesttime">Service Time</label>
                        </div>
                        
                         <div class="form-floating mt-3">
                            <input v-model="instructions" type="text" class="form-control" id="instructions" name="instructions" placeholder="Description" required>
                            <label for="instructions">Special Instructions</label>
                        </div>

                        <div class="text-center mt-3">
                            <button class="btn btn-dark me-3" @click="editServiceRequest"><i class="bi bi-floppy"></i> Save</button>
                            <router-link to='/customer/dashboard' class="btn btn-danger"><i class="bi bi-x-square"></i> Cancel</router-link>
                        </div>
       </div>
    </div>
    </div>
    `,
  data() {
    return {
      serviceRequestId:null,
      servicerequest:'',
      requestdate:'',
      requesttime:'',
      instructions:'',
      errormessage: null,
    };
  },
  mounted(){
    this.serviceRequestId = this.$route.params.id;
    this.getServiceRequest();
  },
  components: {
    CustomerNavbar,
  },
  methods: {
    async getServiceRequest() {
        const url = window.location.origin;
        try {
            const result = await fetch(url + `/servicerequest/byservicerequestid/${this.serviceRequestId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'same-origin',
            });
            if (result.ok) {
                const data = await result.json();
                this.requestdate=data.requestdate;
                this.requesttime=data.requesttime;
                this.instructions=data.instructions;
            }
            else {
                const error = await result.json();
                console.log(error);
            }
        } catch (e) {
            console.log(e);
        }
    },

    async editServiceRequest() {
      try {
        const url = window.location.origin;
        const result = await fetch(url + "/servicerequest/edit", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serviceRequestId:this.serviceRequestId,
                requestdate: this.requestdate,
                requesttime: this.requesttime,
                instructions: this.instructions,
            }),
            credentials: "same-origin",  // ensures credentials are sent (like cookies, etc.)
        });
        if (result.ok) {
            try {
                const data = await result.json(); 
                console.log(data);
                this.errormessage = data.message; 
            } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
                this.errormessage = "Error: Response is not in valid JSON format.";
            }
        } else {
            const errorMsg = await result.json(); 
            console.error("Non-OK response:", errorMsg.message);
            this.errormessage = "Error: " + errorMsg.message;
        }
    } catch (error) {
        console.log("Fetch error:", error.message);
        this.errormessage = "Error Occurred: " + error.message || "An unknown error occurred.";
    }
    },
  },
};

export default ServiceRequestEdit;
