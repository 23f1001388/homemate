import AdminNavbar from "../components/adminnavbar.js";
import ProfessionalNavbar from "../components/professionalnavbar.js";
import CustomerNavbar from "../components/customernavbar.js";

const Summary = {
    template: `
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

            <div class="col-md-5 shadow-lg border rounded-5 p-3" id="requests">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="text-center">Service Request Summary Chart</h3>
                    </div>
                    <div class="card-body">
                        <canvas ref="requestsChart"></canvas>
                    </div>
                </div>
            </div> 
            
            <div class="col-md-5 shadow-lg border p-3 rounded-5 ms-3 " id="ratings">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="text-center">Requests Rating Count Chart</h3>
                    </div>
                    <div class="card-body">
                        <canvas ref="ratingsChart"></canvas>
                    </div>
                </div>
            </div>
            
        </div>

    `,
    components:{
        AdminNavbar,
        ProfessionalNavbar,
        CustomerNavbar,
    },
    data(){
        return{
            userId:'',
            professonalId:'',
            customerId:'',
            requestsData:[],
            ratingsData:[],
            errorMessage:'',
            role:'',
        }
    },
    created() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        this.userId=user.id;
        this.professonalId=user.user_id,
        this.customerId=user.user_id,
        this.role = user.role; 
        this.loadRequestsChart();
        this.loadRatingsChart();     
    },
    methods:{
      async loadRequestsChart(){
        let url=window.location.origin;
        if(this.role==='admin'){
          url=url+`/summary/servicerequestsdata`
        }
        if(this.role==='professional'){
          url=url+`/summary/servicerequestsdata/professional/${this.professonalId}`
        }
        if(this.role==='customer'){
          url=url+`/summary/servicerequestsdata/customer/${this.customerId}`
        }
        console.log("URl is: ",url);
        const result=await fetch(url);
        if(result.ok){
          const data=await result.json();
          this.requestsData=data;
          console.log("Fetched Data:" , this.requestsData)
          this.prapareRequestsChart();

        }else {
          const errorMsg = await result.json();
          this.errormessage = errorMsg.message;
          console.log(errorMsg);
        }
      },

      
      prapareRequestsChart(){
        const requestsChart = this.$refs.requestsChart;
        const labels=this.requestsData.map(item=>item.status);
        const values=this.requestsData.map(item=>item.count);
        
        new Chart(requestsChart, {
          type: "bar", // You can change the chart type here
          data: {
            labels: labels,
            datasets: [{
              label: "Requests Data",
              data: values,
              barpercentage:0.5,
              barThickness: 35,
              borderWidth: 1,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(153, 102, 255, 0.7)'
              ]
            }],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      },

      async loadRatingsChart(){
        let url=window.location.origin;
        console.log(this.role)
        if(this.role==='admin'){
          url=url+`/summary/ratingschartdata`
        }
        if(this.role==='professional'){
          url=url+`/summary/ratingschartdata/professional/${this.professonalId}`
        }
        if(this.role==='customer'){
          url=url+`/summary/ratingschartdata/customer/${this.customerId}`
        }
        const result=await fetch(url);
        if(result.ok){
          const data=await result.json();
          this.ratingsData=data;
          console.log("Fetched Data:" , this.ratingsData)
          this.prapareRatingsChart();

        }else {
          const errorMsg = await result.json();
          this.errormessage = errorMsg.message;
          console.log(errorMsg);
        }
      },
      
      prapareRatingsChart(){
        const ratingsChart = this.$refs.ratingsChart;
        const labels=this.ratingsData.map(item=>item.ratings);
        const values=this.ratingsData.map(item=>item.count);
        
        new Chart(ratingsChart, {
          type: "doughnut", // You can change the chart type here
          data: {
            labels: labels,
            datasets: [{
              label: "Ratings Data",
              data: values,
              barThickness: 50,
              borderWidth: 1,
              backgroundColor: [
                'rgba(255, 205, 86, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)'
              ]
            }],
          },
          options: {
            radius:'90%',
            aspectRatio:1.7,
            responsive:true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    },
    
}

export default Summary
