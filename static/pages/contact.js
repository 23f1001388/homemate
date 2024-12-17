import Navbar from '../components/navbar.js'

const Contact = {
  template: `
  <div>
        <Navbar/> 
      </div>
  <div class="container">
    <div class="row mt-3 p-5">
      <div class="col-md-5 shadow-lg me-2">
        <div class="p-3">
          <h3 class="mb-3">Contact Us</h3>
          <div class="mb-3">
            <label for="name" class="form-label fs-6">Full Name</label>
            <input type="name" class="form-control" id="name" placeholder="Full Name">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label fs-6">Email address</label>
            <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
          </div>
          <div class="mb-3">
            <label for="message" class="form-label fs-6">Message</label>
            <textarea class="form-control" id="message" rows="3"></textarea>
          </div>
          <div class="text-center mt-3">
            <button class="btn btn-primary me-3" @click="userLogin">Submit</button>
          </div>
        </div>
      </div>
      <div class="col-md-5 shadow-lg ms-2">
        <div class="border p-3 mt-3">
          <h5>Media Enquiry</h5>
          <p>For media inquiries, you can send us an email on</p>
          <p>23f1001388@ds.study.iitm.ac.in</p>
        </div>
      </div>
    </div>
  </div>
  
  `,
  components:{
    Navbar,
  },
};
export default Contact;
