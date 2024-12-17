import CustomerNavbar from "../../components/customernavbar.js";

const CustomerFeedback = {
    template:
        `<div>
            <CustomerNavbar/>
        </div>
    <div class="row justify-content-center p-5">
           <div class="col-md-4 shadow-lg border p-3 rounded-5">
                <span  class="alert alert-danger" v-if="errorMessage">{{errorMessage}}</span>
                <h3 class="text-center text-danger">Service Feedback</h3>
               
                <div v-if="serviceRequest" class="text-center">
                    <p><strong>Service Name: </strong>{{ serviceRequest.service_name }}</p>
                    <p><strong>Description: </strong>{{ serviceRequest.service_description }}</p>
                    <p><strong>Professional Name: </strong>{{ serviceRequest.professional_name }}</p>
                    <p><strong>Contact:</strong> <span>{{ serviceRequest.professional_contact }}</span></p>
                    <p><span class="badge text-bg-success fs-4">Status: {{ serviceRequest.status }}</span></p>
                </div>
                <div class="star-rating d-flex justify-content-center">
                    <span v-for="n in 5" :key="n" 
                        @click="rateService(n)" 
                        @mouseover="hoverRating(n)" 
                        @mouseleave="resetHoverRating" 
                        :class="{
                            'filled': n <= rating,
                            'hovered': n <= hoverRatingValue,
                            'unfilled': n > rating && n > hoverRatingValue
                        }">
                        ★
                    </span>
                </div>
                <div class="text-center">
                    <p class="fs-5">Rating: {{ rating }} out of 5</p>
                </div>
                    <textarea class="form-control" v-model="feedback" placeholder="Feedback in 100 words"></textarea>
                <div class="text-center mt-3">
                    <button class="btn btn-dark" @click="submitFeedback"><i class="bi bi-upload"></i> Submit</button>
                    <router-link to="/customer/dashboard" class="btn btn-danger ms-2"><i class="bi bi-x-circle"></i> Cancel</router-link>
                </div>
        </div>
    </div>
    
    `,
    
    data() {
        return {
            serviceRequestId: this.$route.params.id,
            errorMessage: '',
            serviceRequest: [],
            rating: 0, 
            feedback:'',
            hoverRatingValue: 0, 
        }
    },
    components: {
        CustomerNavbar,
    },
    created() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        this.userId = user.id;
        this.customerId = user.user_id;
    },
    mounted() {
        this.getServiceRequest();
    },
    methods: {
        async getServiceRequest() {
            const url = window.location.origin;
            try {
                const result = await fetch(url + `/servicerequest/byservicerequestid/${this.serviceRequestId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'same-origin',
                });
                if (result.ok) {
                    const data = await result.json();
                    console.log(data);
                    this.serviceRequest = data.serviceRequest;
                } else {
                    const errorMsg = await result.json();
                    console.log(errorMsg);
                    this.errorMessage = errorMsg.message;
                }
            } catch (error) {
                console.log(error);
                this.errorMessage = "Fetch error:", error;
            }
        },
        async rateService(rating) {
            this.rating = rating;
        },

        async submitFeedback(){
            const url=window.location.origin;
            const response=await fetch(url+ '/customer/feedback/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ serviceRequestId: this.serviceRequestId, rating: this.rating ,feedback:this.feedback }),
            });
            if(response.ok){
                const data=await response.json();
                console.log(data);
                this.errorMessage=data.message;
            }
            else{
                const error=await response.json();
                console.log(data.message);
                this.errorMessage=data.message;
            }
        },
        hoverRating(value) {
            this.hoverRatingValue = value;
            this.rating=value;
        },
        resetHoverRating() {
            this.hoverRatingValue = 0;
        },
    },

}

export default CustomerFeedback