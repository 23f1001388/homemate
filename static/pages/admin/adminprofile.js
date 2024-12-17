import AdminNavbar from "../../components/adminnavbar.js"

const AdminProfile={
    template:`
    <div>
        <AdminNavbar/>
    </div>
    <div class="row justify-content-center mt-3">
        <div class="col-md-9">
            <div class="row">
                <div class="col-md-4 shadow-lg p-3 rounded-5">
                        <img src="/static/images/profile.png" class="img-fluid" alt="Responsive image">
                        <p><h5 class="text-center"><strong>Welcome : {{current_user.email }}</strong></h5></p>
            </div>

            <div class="col-md-7 shadow-lg p-5 rounded-5 ms-3">   
                <div class="alert alert-danger fs-6" v-if="errorMessage">{{errorMessage}}</div>
                        <h2>Profile : {{current_user.email }}</h2>
                            <hr>
                        <div class="form-floating mb-3 mt-3">
                            <input type="text" v-model="userId" class="form-control" id="userId" placeholder="Enter User ID" name="userid" value="{{session['user_id']}}" disabled>
                            <label for="userId">User ID</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="password" v-model="password" class="form-control" id="password" placeholder="Enter Password" name="password" required>
                            <label for="password">Password</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="password" v-model="newpassword" class="form-control" id="newpassword" placeholder="Enter New Password" name="newpassword" required>
                            <label for="newpassword">New Password</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="password" v-model="confirmpassword" class="form-control" id="confirmpassword" placeholder="Enter Password again" name="confirmpassword" required>
                            <label for="confirmpassword">Confirm Password</label>
                        </div>

                            <div class='text-center mt-3'>
                                <button type="submit" @click="updateProfle" class="btn btn-dark mt-3 justify-content-center"> 
                                <i class="bi bi-floppy"></i> Update</button>
                                <router-link to="/admin/dashboard" class="btn btn-danger ms-2 mt-3"><i class="bi bi-x-circle"></i> Cancel</router-link>
                            </div> 
                    </div>
                    </div>
               
      </div>
  </div>
    `,
    data(){
        return{
            userId:'',
            password:'',
            newpassword:'',
            confirmpassword:'',
            errorMessage:'',
        }
    },
    created(){
        const user = JSON.parse(sessionStorage.getItem('user'));
        this.userId = user.id;
    },
    components:{
        AdminNavbar
    },
    computed:{
        current_user(){
            return this.$store.state.current_user;
        }
    },
    methods:{
        async loadUser(){


        },
        async updateProfle(){
            const url=window.location.origin;
            if (this.newpassword !== this.confirmpassword) {
                this.errorMessage = "New password and confirm password do not match.";
                return; 
            }
            try{
                const response=await fetch(`${url}/admin/profile`,{
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                    body:JSON.stringify({
                        userId:this.userId,
                        password: this.password,
                        newpassword:this.newpassword,
                        confirmpassword:this.confirmpassword
                    }),
                });
                if(response.ok){
                    const data=await response.json();
                    this.errorMessage=data.message;
                    console.log(data);
                }
                else{
                    const error=await response.json();
                    this.errorMessage=error.message;
                    console.log(error);
                }
                           
            }catch(error){
                console.log(error);
                this.errorMessage="Error in Updating Profile";
            }
        },
    }
}

export default AdminProfile