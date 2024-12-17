import Navbar from "../components/navbar.js"

const RegisterCustomer={
  template:`
    <div>
        <Navbar/> 
      </div>
    <div class="row justify-content-center p-5">
    <div class="col-md-6 shadow-lg border p-2">
    <div class="p-3">
   
      <h4 class="text-center">Customer SignUp</h4>
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
          <textarea class="form-control" v-model="address" id="address" name="address" placeholder="Complete Address" required></textarea>
          <label for="address">Complete Address</label>
        </div>
        
        <div class="form-floating mt-3">
          <input type="number" v-model="pincode" class="form-control" id="pincode" name="pincode" placeholder="PIN Code" required>
          <label for="pincode">PIN Code</label>
        </div>

        <div class="form-floating mt-3">
          <input type="text" v-model="contact" class="form-control" id="contact" name="contact" placeholder="Contact" required>
          <label for="contact">Contact</label>
        </div>
        
        <div class="text-center mt-3">
          <button class="btn btn-primary" @click="registerCustomer">Sign Up</button>
        </div>
        <div class='text-center'>
          <h6>Already have an account ? <router-link to='/Login'>Login</router-link></h6>
        </div>
       </div>
    </div>
    </div>
  `,
  components:{
    Navbar,
  },
  data(){
    return{
      email: "",
      password: "",
      name: "",
      address: "",
      pincode: "",
      contact: "",
      errormessage:"",
    }
  },
  methods:{
    async registerCustomer() {
      try {
        const url = window.location.origin;
        const result = await fetch(url + '/register/customer',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
              name: this.name,
              address: this.address,
              pincode: this.pincode,
              contact: this.contact
            }),
            credentials: 'same-origin',
          });

        if (result.ok) {
          const data = await result.json();
          console.log("Updated Successfully");
          this.errormessage="Update Successfully";
        }
        else {
          const errorMsg = await result.json();
          console.log("Updation  Failed : ", errorMsg);
          this.errormessage="Updation  Failed";
        }
      }
      catch (error) {
        console.log("Fetch error:", error);
        this.errormessage="Fetch error:", error;
      }
    },
  },
}

export default RegisterCustomer