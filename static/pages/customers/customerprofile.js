import CustomerNavbar from "../../components/customernavbar.js";

const CustomerProfile={
  template:`
    <div>
        <CustomerNavbar/> 
      </div>
    <div class="row justify-content-center mt-3">
        <div class="col-md-9">
            <div class="row">
                <div class="col-md-4 shadow-lg p-3 rounded-5">
                        <img src="/static/images/profile.png" class="img-fluid" alt="Responsive image">
                        <p><h5 class="text-center"><strong>Welcome : {{current_user.email }}</strong></h5></p>
                        <p><strong>Name:</strong> {{customerName}}</p>
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
                          <input type="text" v-model="customerName" class="form-control" id="name" name="name" placeholder="Full Name" required>
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

                        <div class='text-center mt-3'>
                            <button type="submit" @click="updateCustomer" class="btn btn-dark mt-3 justify-content-center"> 
                            <i class="bi bi-floppy"></i> Update</button>
                            <router-link to="/customer/dashboard" class="btn btn-danger ms-2 mt-3"><i class="bi bi-x-circle"></i> Cancel</router-link>
                        </div> 
                    </div>
                    </div>
               
      </div>
  </div>
  `,
  components:{
    CustomerNavbar,
  },
  data(){
    return{
      userId:'',
      customerId:'',
      customerName:'',
      password:'',
      newpassword:'',
      confirmpassword:'',
      address: '',
      pincode: '',
      contact: '',
      errorMessage:'',
    }
  },
  created(){
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userId=user.id;
    this.customerId = user.user_id;
  },
  computed:{
    current_user(){
        return this.$store.state.current_user;
    }
  },
  mounted() {
    this.getCustomer();
  },
  methods:{
    async getCustomer() {
      const url = window.location.origin;
      try {
          const result = await fetch(`${url}/getcustomer/${this.customerId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: 'same-origin',
          });
          if (result.ok) {
              const data = await result.json();
              console.log(data);
              this.customerName=data.name;
              this.address=data.address;
              this.pincode=data.pincode;
              this.contact=data.contact;
          }
          else {
              const error = await result.json();
              console.log(error);
          }
      } catch (e) {
          console.log(e);
      }
    },
    async updateCustomer() {
      try {
        const url = window.location.origin;
        const response = await fetch(url + '/customer/profile',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId:this.userId,
              name: this.customerName,
              address: this.address,
              pincode: this.pincode,
              contact: this.contact
            }),
            credentials: 'same-origin',
          });

        if (response.ok) {
          const data = await response.json();
          console.log("Updated Successfully");
          this.errorMessage="Update Successfully";
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
  },
}

export default CustomerProfile