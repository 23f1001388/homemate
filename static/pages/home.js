import Navbar from '../components/navbar.js'

const Home={
  template:
    `<div>
        <Navbar/> 
      </div>
    <div class="row mt-3 justify-content-center">
        <div class="col-md-4 shadow-lg p-3 mb-5 ms-3 bg-body-tertiary rounded vh-100">
            <h4 class="text-center">Home Services at DoorStep</h4>
            <div class="row mt-3 p-2">
              <div class="col-md-4">
                <div class="thumbnail">
                  <router-link to="#">
                    <img src="/static/images/ac-service.png" alt="Ac Service" style="width:100%">
                   
                  </router-link>
                  <div class="caption">
                    <p class="text-center">Ac Service </p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="thumbnail">
                  <router-link to="#">
                    <img src="/static/images/saloon.png" alt="Saloon" style="width:100%">
                  </router-link>
                  <div>
                    <p class="text-center">Salon Service</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="thumbnail">
                  <router-link to="#">
                    <img src="/static/images/vaccum.png" alt="Fjords" style="width:100%">
                   
                  </router-link>
                  <div class="caption">
                    <p class="text-center">Cleaning Service</p>
                  </div>
                </div>
              </div>
              
            </div>
    
        </div>
        <div class="col-md-7 shadow-lg p-3 ms-3 me-3 mb-5 bg-body-tertiary rounded">
          <div class="row cols-2">
            <div class=col-md-6>
              <div class="row">
              <img src="/static/images/ac-service-big.png" alt="Ac Service" style="width:100%">
              </div>
              <div class="row mt-3">
              <img src="/static/images/washing-machine-big.png" alt="Ac Service" style="width:100%">
              </div>
          
            </div>
            <div class=col-md-6>
              <div class="row">
                 <img src="/static/images/saloon-big.png" alt="Fjords" style="width:100%">
              </div>
             <div class="row mt-3">
                <img src="/static/images/sofa-cleaning-big.png" alt="Fjords" style="width:100%">
             </div>
            </div>
          </div>
          
        </div>
       
    </div>
    `,
 data(){
   return{
     ipadd:''
   }
 },
 components:{
    Navbar,
 },
 mounted(){
   this.getLocation();
 },
  methods:{
    getLocation(){
      fetch('https://ipinfo.io/json')
      .then(response=>response.json())
      .then(data=>{
        this.ipadd=data.city;
      })
    }
  }
}

export default Home