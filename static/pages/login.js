import router from '../utils/router.js'
import Navbar from '../components/navbar.js'

const Login = {
  template: `
    <div>
        <Navbar/> 
      </div>
    <div class="row justify-content-center p-5">
    <div class="col-md-4 shadow-lg border p-2 rounded-5">
      <div class="p-3">
        <h4 class="text-center">User Login</h4>
        <div class="alert alert-danger fs-6" v-show="errormessage">{{errormessage}}</div>
        
        <div class="form-floating mb-3">
          <input type="email" v-model="email" class="form-control" placeholder="name@example.com">
          <label for="email">Email address</label>
         
        </div>
        <div class="form-floating mb-3">
        <input type="password" v-model="password" class="form-control" name="password" placeholder="Password">
        <label for="password">Password</label>
       
      </div>
      <div class="text-center mt-3">
        <button class="btn btn-primary me-3" @click="userLogin">Login</button>
        <router-link to='/' class="btn btn-danger">Cancel</router-link>
      </div>
      <div class='text-center'>
        <h6>Don't have an account ? <router-link to='/register/customer'>Register</router-link></h6>
        </div>
      </div>
    </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      errormessage:"",
    };
  },
  components:{
    Navbar,
  },
  methods: {
    async userLogin() {
      try {
        const url = window.location.origin;
        const result=await fetch(url + "/userlogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials:'same-origin',
        });
        if (result.ok) {
          const data=await result.json();
          sessionStorage.setItem('user',JSON.stringify(data));
          console.log(data);
          this.$store.commit('setUser',data);
          this.$store.commit('setRole',data.role);
          this.$store.commit('setLoggedIn',true);
          // router.push('/admin/main')
          console.log("User Role is:"+ data.role);

          switch(data.role){
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'professional':
              router.push('/professional/dashboard');
              break;
            case 'customer':
              router.push('/customer/dashboard')
          }

          }else{
            const errorMsg=await result.json();
            this.errormessage=errorMsg.message;
            console.error('Login Failed : ', errorMsg);
          }
      } catch (error) {
        console.error("Fetch error:", error);
        this.errormessage="Error Occured";
      }
    },
  },
};

export default Login;
