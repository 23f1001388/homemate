import AdminNavbar from "../../components/adminnavbar.js";

const UserDetails = {
  template: `
        <div>
            <AdminNavbar/>
        </div>
        <div class="row justify-content-center p-5">
           <div class="col-md-4 shadow-lg border">
              <div class="card">
                <div class="card-header">
                  <h4 class="text-center">User Details</h4>

                </div>
                <div class="card-body">
                      <table class="table responsive">
                        <thead>
                            <th>User Id</th>
                            <th>User Email</th>
                            <th>Roles</th>
                         </thead>
                         <tbody>
                              <tr v-for="user in users" :key="user.id">
                                <td> {{ user.id }} </td>
                                <td>{{ user.email }}</td>
                                <td>
                                <ul v-if="user.roles && user.roles.length" class="list-unstyled">
                                    <li v-for="role in user.roles" :key="role">{{ role }}</li>
                                </ul>
                                <span v-else>No roles assigned</span>
                                </td>
                               
                              </tr>
                          </tbody>
                      </table>
                    </div>
                </div>
            </div>
           

            <div class="col-md-4 shadow-lg border p-2">
              <div class="p-3">
                <h4 class="text-center">Professional Details</h4>
                      <table class="table">
                        <thead>
                            <th>Id</th>
                            <th>Email</th>
                         </thead>
                         <tbody>
                              <tr v-for="professional in professionals" :key="professional.id">
                                <td> {{ professional.id }} </td>
                                <td>{{ professional.email }}</td>

                              </tr>
                          </tbody>
                      </table>
              </div>
            </div>

            <div class="col-md-4 shadow-lg border p-2">
              <div class="p-3">
                <h4 class="text-center">Cutomer Details</h4>
                      <table class="table">
                        <thead>
                            <th>Id</th>
                            <th>Email</th>
                         </thead>
                         <tbody>
                             <tr v-for="customer in customers" :key="customer.id">
                                <td> {{ customer.id }} </td>
                                <td>{{ customer.email }}</td>
                              </tr>
                          </tbody>
                      </table>
              </div>
            </div>
            
    </div>
    `,
  data() {
    return {
      users: [],
      professionals: [],
      customers: [],
      errormessage: null,
    };
  },
  components: {
    AdminNavbar,
  },
  mounted() {
    this.getUsers();
    this.getProfessionals();
    this.getCustomers();
  },
  methods: {
    formatRoles(roles) {
      if (Array.isArray(roles)) {
        return roles.join(", "); // Join array elements into a comma-separated string
      }
      return roles || [roles]; // Fallback if roles is not an array
    },
    async getUsers() {
      try {
        const url = window.location.origin;
        const user = sessionStorage.getItem('user');
        const token=user.token;
        console.log(token);
        const result = await fetch(url + "/admin/users");
        if (result.ok) {
          const data = await result.json();
          console.log(data);
          this.users = data;
        } else {
          const errorMsg = await result.json();
          this.errormessage = errorMsg.message;
          console.log(errorMsg);
        }
      } catch (error) {
        console.log("Fetch error:", error);
        this.errormessage = "Error Occured";
      }
    },
    async getProfessionals() {
      try {
        const url = window.location.origin;
        const result = await fetch(url + "/admin/professionals");
        if (result.ok) {
          const data = await result.json();
          console.log(data);
          this.professionals = data;
        } else {
          const errorMsg = await result.json();
          this.errormessage = errorMsg.message;
          console.log(errorMsg);
        }
      } catch (error) {
        console.log("Fetch error:", error);
        this.errormessage = "Error Occured";
      }
    },
    async getCustomers() {
      try {
        const url = window.location.origin;
        const result = await fetch(url + "/admin/customers");
        if (result.ok) {
          const data = await result.json();
          console.log(data);
          this.customers = data;
        } else {
          const errorMsg = await result.json();
          this.errormessage = errorMsg.message;
          console.log(errorMsg);
        }
      } catch (error) {
        console.log("Fetch error:", error);
        this.errormessage = "Error Occured";
      }
    },
  },
};

export default UserDetails;
