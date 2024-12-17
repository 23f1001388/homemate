import Navbar from "../components/navbar.js";

const RegisterProfessional = {
  template: `
  <div>
        <Navbar/> 
      </div>
    <div class="row justify-content-center p-3">
    <div class="col-md-6 shadow-lg border p-2">
    <div class="p-2">

      <h4 class="text-center">Service Professional SignUp</h4>
        <div class="alert alert-danger fs-6" v-show="errormessage">{{errormessage}}</div>
        <div class="form-floating mb-3 mt-3">
          <input type="email" v-model="email" class="form-control" id="email" name="email" placeholder="name@example.com" required>
          <label for="email">Email address</label>
        </div>

        <div class="form-floating">
          <input type="password" v-model="password" class="form-control" id="password" name="password" placeholder="Password" required>
          <label for="password">Password</label>
        </div>
        
        <div class="form-floating mt-3">
          <input type="text" v-model="name" class="form-control" id="name" name="name" placeholder="Full Name" required>
          <label for="name">Full Name</label>
        </div>

        <div class="form-floating mt-3">
          <input type="text" v-model="description" class="form-control" id="description" name="description" placeholder="Full Description" required>
          <label for="description">Full Description</label>
        </div>
        
        <div class="form-floating mt-3">
        <select class="form-select" v-model="selectedService" id="service" aria-label="service" name="service">
          <option disabled value="">Select Service</option>
          <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
        </select>
        <label for="service">Please Select Service Type</label>
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

        <div class="form-floating mt-3">
          <input type="file"  class="form-control" id="fileupload" 
          name="fileupload" placeholder="Select File" @change="onFileChange" accept="application/pdf" required>
          <label for="fileupload">Select File</label>
          <p class="alert alert-danger fs-6" v-if="message">{{ message }}</p>
        </div>
        
        <div class="text-center mt-3">
          <button class="btn btn-primary" @click="registerProfessional">Sign Up</button>
        </div>
        <div class='text-center'>
          <h6>Already have an account ? <router-link to='/Login'>Login</router-link></h6>
        </div>
       </div>
    </div>
    </div>
  `,
  components: {
    Navbar,
  },
  data() {
    return {
      email: '',
      password: '',
      name: '',
      description:'',
      services: [],
      selectedservice: '',
      experience: '',
      address: '',
      pincode: '',
      contact: '',
      fileupload: '',
      selectedFile: null,
      message: '',
      errormessage: "",
    }
  },
  mounted() {
    this.loadServices();
  },
  methods: {
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
    async registerProfessional(){
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('email', this.email);
      formData.append('password', this.password);
      formData.append('name', this.name);
      formData.append('description', this.description);
      // const services = Array.isArray(this.selectedService) ? this.selectedService.join(',') : '';

      console.log("Selected Services:", this.selectedService);
      formData.append('service', this.selectedService);
      // formData.append('service', this.selectedService.join(','));
      formData.append('experience', this.experience);
      formData.append('address', this.address);
      formData.append('pincode', this.pincode);
      formData.append('contact', this.contact);

      const url=window.location.origin;
      const result=await fetch(url+'/register/professional',{
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        });
      if(result.ok){
        const data = await result.json();
        console.log("Updated Successfully");
        this.errormessage="Update Successfully"; 
      }else{
        const errorMsg = await result.json();
        console.log("Updation  Failed : ", errorMsg.message);
        this.errormessage="Updation  Failed" + errorMsg.message;
      }
    },
    

  }
}

export default RegisterProfessional