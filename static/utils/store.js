const store=Vuex.createStore({
    state:{
        loggedIn:false,
        current_user:null,
        role:""
    },
    mutations:{
        setLoggedIn(state,status){
            state.loggedIn=status;
        },
        setUser(state,user){
            state.current_user=user;
        },
        clearUser(state){
            sessionStorage.clear();
            state.loggedIn=false;
            state.current_user=null;
            state.role="";
        },
        setRole(state,role){
            state.role=role;
        },
    },
    actions:{
        login({commit},user){
            commit('setUser',user);
        },
        logout({commit}){
            commit('clearUser');
        },
    },
    getters:{
        getCurrentUser:state=>state.current_user,
    }
});

export default store;