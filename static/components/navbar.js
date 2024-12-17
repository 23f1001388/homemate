const Navbar={
  template:`<div class="container-fluid">
    <nav class="navbar navbar-expand-lg bg-light navbar-light">
      <div class="container-fluid">
        <router-link class="navbar-brand badge text-bg-dark fs-4" to="/">A-Z</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to='/' class="nav-link active" aria-current="page">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to='/about' class="nav-link">About</router-link>
            </li>
            <li class="nav-item">
              <router-link to='/contact' class="nav-link" >Contact</router-link>
            </li>
           
          </ul>
         
         
         <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle"></i> Login/SignUp
            </button>
            
            <div class="dropdown-menu dropdown-menu-start dropdown-menu-lg-end dropdown-menu-light">
              <div class="d-flex p-1">
                <div class="flex-fill">
                  <ul class="list-unstyled">
                    <li><router-link class="dropdown-item fs-5" to="/login"><i class="bi bi-box-arrow-in-right"></i> Login</router-link></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-item fs-5"><i class="bi bi-person-add"></i> Register</h6></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><router-link class="dropdown-item fs-6" to="/register/professional">As Professional</router-link></li>
                    <li><router-link class="dropdown-item fs-6" to="/register/customer">As Customer</router-link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </div>`,

 
  
}

export default Navbar;