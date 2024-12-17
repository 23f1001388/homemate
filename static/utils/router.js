import Home from '../pages/home.js'
import About from '../pages/about.js'
import Contact from '../pages/contact.js'
import Login from '../pages/login.js'
import RegisterCustomer from '../pages/registercustomer.js'
import RegisterProfessional from '../pages/registerprofessional.js'
import store from './store.js'

// Admin Component/Pages
import AdminDashboard from '../pages/admin/admindashboard.js'
import UserDetails from '../pages/admin/userdetails.js'
import ServiceCreate from '../pages/admin/servicecreate.js'
import ServiceEdit from '../pages/admin/serviceedit.js'
import AdminSearch from '../pages/admin/adminsearch.js'
import AdminSummary from '../pages/admin/adminsummary.js'
import AdminProfile from '../pages/admin/adminprofile.js'

// Professional Components/Pages
import ProfessionalDashboard from '../pages/professionals/professionaldashboard.js'
import ProfessionalProfile from '../pages/professionals/professionalprofile.js'
import ProfessionalSearch from '../pages/professionals/professionalsearch.js'

// Customer Component/Pages
import CustomerDashboard from '../pages/customers/customerdashboard.js'
import CustomerServices from '../pages/customers/customerservices.js'
import CustomerProfile from '../pages/customers/customerprofile.js'
import CustomerFeedback from '../pages/customers/customerfeedback.js'

//Common Components
import ChangePassword from '../components/changepassword.js'
import Summary from '../components/summary.js'
import Search from '../components/search.js'
import ServiceRequestEdit from '../pages/customers/servicerequestedit.js'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/login', component: Login },
  { path: '/register/customer', component: RegisterCustomer },
  { path: '/register/professional', component: RegisterProfessional },
  // Admin Routes
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresLogin: true, role: 'admin' } },
  { path: '/admin/service/create', component: ServiceCreate, meta: { requiresLogin: true, role: 'admin' } },
  { path: '/admin/service/edit/:id', component: ServiceEdit, meta: { requiresLogin: true, role: 'admin' } },
  { path: '/admin/users', component: UserDetails, meta: { requiresLogin: true, role: 'admin' } },
  { path: '/admin/profile', component: AdminProfile, meta: { requiresLogin: true, role: 'admin' } },

  // Professional Routes
  { path: '/professional/dashboard', component: ProfessionalDashboard, meta: { requiresLogin: true, role: 'professional' } },
  { path: '/professional/profile', component: ProfessionalProfile, meta: { requiresLogin: true, role: 'professional' } },
  
  // Customer Routes
  { path: '/customer/dashboard', component: CustomerDashboard, meta: { requiresLogin: true, role: 'customer' } },
  { path: '/customer/services/:id', component: CustomerServices, meta: { requiresLogin: true, role: 'customer' } },
  { path: '/customer/profile', component: CustomerProfile, meta: { requiresLogin: true, role: 'customer' } },
  { path: '/customer/feedback/:id', component: CustomerFeedback, meta: { requiresLogin: true, role: 'customer' } },
  
  
  //Common Routes
  { path: '/changepassword', component: ChangePassword, meta: { requiresLogin: true, roles: ['customer', 'admin', 'professional'] } },
  { path: '/search', component: Search, meta: { requiresLogin: true, roles: ['customer', 'admin', 'professional'] } },
  { path: '/summary', component: Summary, meta: { requiresLogin: true, roles: ['customer', 'admin', 'professional'] } },
  { path: '/servicerequest/edit/:id', component: ServiceRequestEdit, meta: { requiresLogin: true, roles: ['customer', 'admin', 'professional'] } },
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  mode:'history',
  routes,
});

router.beforeEach((to, from, next) => {

  const user=JSON.parse(sessionStorage.getItem('user'));
  const token=user ? user.token: null;
  const role=user ? user.role: null;

  if (user) {
      store.commit('setUser',user);
      store.commit('setRole',user.role);
      store.commit('setLoggedIn',true);
    }

  if(to.meta.requiresLogin){
    if(!token){
      next({path:'/login'})
    }else{
      if(to.meta.role===role){
        next();
      }else{
          if (to.meta.roles && to.meta.roles.includes(role)) {
            next();  // Role is allowed, proceed to route
          } else {
            // Redirect based on user role
            const roleRedirectMap = {
              'admin': '/admin/dashboard',
              'professional': '/professional/dashboard',
              'customer': '/customer/dashboard',
            };
            // Redirect to the appropriate dashboard or login if role is invalid
            const redirectPath = roleRedirectMap[role] || '/login';
            next({ path: redirectPath });     
      }
    }
  }
  }else{
    next()
  }
})



export default router;