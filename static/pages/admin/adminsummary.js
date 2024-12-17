import AdminNavbar from "../../components/adminnavbar.js";


const AdminSummary = {
    template: `
        <div>
            <AdminNavbar/>
        </div>

        <div class="row row-cols-2 justtify-content-center p-5" >

            <div class="col-6 shadow-lg border p-3" id="ratings">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="text-center">Service Request Summary Chart</h3>
                    </div>
                    <div class="card-body">
                        <canvas ref="requestsChart"></canvas>
                    </div>
                </div>
            </div> 
            <div class="col-6 shadow-lg border p-3" id="requests">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="text-center">Overall Customer Ratings Chart</h3>
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
    },
    data(){
        return{
            requestsData:[],
            ratingsData:[],
            errorMessage:'',
            userData: [12, 19, 3, 5, 2, 3],
            campaignData: [5, 10, 15, 7, 3, 9]
        }
    },
    methods:{
      async loadRequestsChart(){
        const url=window.location.origin;
        const result=await fetch(url + '/summary/servicerequestsdata');
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
              barThickness: 50,
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
        const url=window.location.origin;
        const result=await fetch(url + '/summary/ratingsdata');
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
        const labels=this.ratingsData.map(item=>item.status);
        const values=this.ratingsData.map(item=>item.count);
        
        new Chart(requestsChart, {
          type: "bar", // You can change the chart type here
          data: {
            labels: labels,
            datasets: [{
              label: "Requests Data",
              data: values,
              barThickness: 50,
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
      }
    },
    mounted() {
        this.loadRequestsChart();
        const ratingsChart = this.$refs.ratingsChart;
    
       
        new Chart(ratingsChart, {
          type: "line", // You can change the chart type here
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
              label: "Campaign Progress",
              data: this.campaignData,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
}

export default AdminSummary
