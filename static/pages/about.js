import Navbar from '../components/navbar.js'
const About={
  template:`
  <div>
        <Navbar/> 
      </div>

  <div class="row justify-content-center">
   
        <h2 class="text-center">About Us</h2>
  </div>
  <div class="row justify-content-center mt-3 bg-tertiary">
    <div class="col-md-10 shadow-lg border p-2">
        <h2 class="text-center">Who are We ?</h2>
        <p>A-Z Company is a technology platform offering a variety of services at home. 
        Customers use our platform to book services such as beauty treatments, haircuts, massage therapy, 
        cleaning, plumbing, carpentry, appliance repair, painting etc. These services are delivered 
        in the comfort of their home and at a time of their choosing. We promise our customers a high 
        quality, standardised and reliable service experience. To fulfill this promise, we work 
        closely with our hand-picked service partners, enabling them with technology, training, products, 
        tools, financing, insurance and brand, helping them succeed and deliver on this promise.</p>

        <h5>Our Vision: Empower millions of professionals worldwide to deliver services at home like 
        never experienced before</h5>

        <h2 class="text-center mt-5">How We Do it</h2>
        <p>A-Z Company provides a platform that allows skilled and experienced professionals to connect
         with users looking for specific services. Once on the platform, our match-making algorithm 
         identifies professionals who are closest to the users’ requirements and available at the requested
         time and date.</p>

    </div>
  </div>
  
  `,
  components:{
    Navbar,
  },
}

export default About