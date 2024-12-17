import ProfessionalNavbar from "../../components/professionalnavbar.js";

const ProfessionalProfile = {
  template: `
  <div>
        <ProfessionalNavbar/> 
      </div>
    <div class="row justify-content-center p-3">
      <div class="col-md-9 p-2">
        <div class="row">
                <div class="col-md-4 shadow-lg p-3 rounded-5">
                        <img src="/static/images/profile.png" class="img-fluid" alt="Responsive image">
                        <p><h5 class="text-center"><strong>Welcome : {{current_user.email }}</strong></h5></p>
                        <p><strong>Name:</strong> {{name}}</p>
                        <p><strong>Address:</strong> {{address}}</p>
                        <p><strong>Pincode:</strong> {{pincode}}</p>
                        <p><strong>Contact: </strong>{{contact}}</p>

                </div>
                <div class="col-md-7 shadow-lg p-5 rounded-5 ms-3">   
                  <div class="alert alert-danger fs-6" v-if="errorMessage">{{errorMessage}}</div>
                        <h2>Profile : {{current_user.email }}</h2>
                            <hr>
                      <div class="form-floating mb-3 mt-3">
                            <input type="text" v-model="userId" class="form-control" id="userId" placeholder="Enter User ID" name="userid" value="{{session['user_id']}}" disabled>
                            <label for="userId">User ID</label>
                        </div>
                      <div class="form-floating mt-3">
                        <input type="text" v-model="description" class="form-control" id="description" name="description" placeholder="Full Description" required>
                        <label for="description">Full Description</label>
                      </div>                
                      <div class="form-floating mt-3">
                        <input type="number" v-model="experience" class="form-control" id="experience" name="experience" placeholder="Experience in Years" required>
                        <label for="experience">Experience in Years</label>
                      </div>

                      <div class="form-floating mt-3">
                        <textarea class="form-control" v-model="address" id="address" name="address" placeholder="Complete Address" required></textarea>
                        <label for="address">Complete Address</label>
                      </div>
                      
                      <div class="form-floating mt-3">
                        <input type="number"  v-model="pincode" class="form-control" id="pincode" name="pincode" placeholder="PIN Code" required>
                        <label for="pincode">PIN Code</label>
                      </div>

                      <div class="form-floating mt-3">
                        <input type="text" v-model="contact" class="form-control" id="contact" name="contact" placeholder="Contact" required>
                        <label for="contact">Contact</label>
                      </div>                      
                      <div class='text-center mt-3'>
                            <button type="submit" @click="updateProfessional" class="btn btn-dark mt-3 justify-content-center"> 
                            <i class="bi bi-floppy"></i> Update</button>
                            <router-link to="/customer/dashboard" class="btn btn-danger ms-2 mt-3"><i class="bi bi-x-circle"></i> Cancel</router-link>
                      </div> 
              </div>
          </div>
    </div>
  `,
  components: {
    ProfessionalNavbar,
  },
  created(){
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userId=user.id;
    this.professionalId = user.user_id;
  },
  computed:{
    current_user(){
        return this.$store.state.current_user;
    }
  },
  data() {
    return {
      userId:'',
      professionalId:'',
      name:'',
      description:'',
      experience: '',
      address: '',
      pincode: '',
      contact: '',
      errorMessage: "",
    }
  },
  mounted() {
    this.loadServices();
    this.getProfessional();
  },
  methods: {
    async getProfessional() {
      const url = window.location.origin;
      try {
          const result = await fetch(`${url}/getprofessional/${this.professionalId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: 'same-origin',
          });
          if (result.ok) {
              const data = await result.json();
              console.log(data);
              this.name=data.name;
              this.address=data.address;
              this.pincode=data.pincode;
              this.contact=data.contact;
              this.experience=data.experience;
              this.description=data.description;
          }
          else {
              const error = await result.json();
              console.log(error);
              this.errorMessage=error.message;
          }
      } catch (e) {
          console.log(e);
      }
    },
    async loadServices() {
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
    onFileChange(event) {
      const file = event.target.files[0];
      if (file && file.type != "application/pdf") {
        this.message = "Please Select a PDF File";
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.message = '';
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        this.message = "Please Select a PDF File to upload";
        return;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      try {
        const url = window.location.origin;
        const response = await fetch(url + '/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          this.message = `Error: ${errorData.error}`;
        } else {
          const data = await response.json();
          this.message = `Success: ${data.message}`;
        }
      } catch (error) {
        this.message = `Error: ${error.message}`;
      }
    },
    async updateProfessional() {
      try {
        const url = window.location.origin;
        const response = await fetch(url + '/professional/profile',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId:this.userId,
              address: this.address,
              pincode: this.pincode,
              contact: this.contact,
              description:this.description,
              experience:this.experience
            }),
            credentials: 'same-origin',
          });

        if (response.ok) {
          const data = await response.json();
          console.log("Updated Successfully");
          this.errorMessage="Updated Successfully";
        }
        else {
          const errorMsg = await response.json();
          console.log("Updation  Failed : ", errorMsg);
          this.errorMessage="Updation  Failed";
        }
      }
      catch (error) {
        console.log("Fetch error:", error);
        this.errorMessage="Fetch error:", error;
      }
    },
    

  }
}

export default ProfessionalProfile