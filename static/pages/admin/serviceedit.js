import AdminNavbar from "../../components/adminnavbar.js";

const ServiceEdit = {
  template: `
        <div>
            <AdminNavbar/>
        </div>
        <div class="row justify-content-center p-5">
    <div class="col-md-4 shadow-lg border p-2">
    <div class="p-3">
      <h4 class="text-center">Edit Service</h4>
        <div class="badge text-danger alert fs-6 text-wrap" v-show="errormessage">{{errormessage}}</div>
        
        <div class="form-floating mb-3 mt-3">
          <input v-model="serviceId" type="text" class="form-control" id="serviceId" name="serviceId" placeholder="Service Id" disabled>
          <label for="serviceId">Service ID</label>
        </div>

        <div class="form-floating mb-3 mt-3">
          <input v-model="name" type="name" class="form-control" id="name" name="name" placeholder="name@example.com" required>
          <label for="name">Name of Service</label>
        </div>

        <div class="form-floating">
          <input v-model="description" type="text" class="form-control" id="description" name="description" placeholder="Description" required>
          <label for="description">Description</label>
        </div>
        
        <div class="form-floating mt-3">
          <input v-model="price" type="number" class="form-control" id="price" name="price" placeholder="Price" required>
          <label for="price">Price for Service</label>
        </div>
        
        <div class="form-floating mt-3">
          <input v-model="timerequired" type="number" class="form-control" id="timerequired" name="timerequired" placeholder="Time Required" required>
          <label for="timerequired">Time Required(in Days)</label>
        </div>
        
        <div class="text-center mt-3">
          <button class="btn btn-primary me-3" @click="editService"><i class="bi bi-floppy"></i> Save</button>
          <router-link to='/admin/dashboard' class="btn btn-danger"><i class="bi bi-x-square"></i> Cancel</router-link>
        </div>
       </div>
    </div>
    </div>
    `,
  data() {
    return {
      serviceId:null,
      name: null,
      description: null,
      price: null,
      timerequired: null,
      errormessage: null,
    };
  },
  created(){
    this.serviceId = this.$route.params.id;
    this.getService();
  },
  components: {
    AdminNavbar,
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
                this.name=data.name;
                this.description=data.description;
                this.price=data.price;
                this.timerequired=data.timerequired;
            }
            else {
                const error = await result.json();
                console.log(error);
            }
        } catch (e) {
            console.log(e);
        }
    },

    async editService() {
      try {
        const url = window.location.origin;
        const result = await fetch(url + "/api/serviceapi", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serviceId:this.serviceId,
                name: this.name,
                description: this.description,
                price: this.price,
                timerequired: this.timerequired,
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

export default ServiceEdit;
