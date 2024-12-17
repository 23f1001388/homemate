import router from '../static/utils/router.js'
import Navbar from '../static/components/navbar.js'
import store from '../static/utils/store.js'

const app=Vue.createApp({
  template:`
  <div>
    <router-view/>
  </div>`,
  
});
app.component('Navbar',Navbar);
app.use(router);
app.use(store);
app.mount("#app");

