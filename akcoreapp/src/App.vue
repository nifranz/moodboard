<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <span class="navbar-brand">A&K AdminPanel</span>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul v-if="account" class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/projekte" active-class="active" class="nav-link">Projekte</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/mitarbeiter" active-class="active" class="nav-link">Mitarbeiter</router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link to="/nutzer" active-class="active" class="nav-link">Nutzer</router-link>           
          </li> -->


          <!-- <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Dropdown
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
          </li>-->
        </ul>
        <div v-if="account" class="d-flex align-items-center">
          <div class="mx-3">eingeloggt als: {{ this.account }}</div>
          <button  class="btn btn-outline-primary" @click.prevent="logout">Ausloggen</button>
        </div>

        <!-- <form class="d-flex">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form> -->
      </div>
    </div>
  </nav>
    <div class="container">
      <routerView v-if="account"/>
      <div v-if="!account" class="d-flex justify-content-center align-items-center flex-column ">
        <h1>Login</h1>
        <form class="login-form d-flex justify-content-center align-items-center">
            <div class="card p-3">
                <!-- Email input -->
                <div class="form-outline mb-4">
                    <input type="email" v-model="form.name" class="form-control" />
                    <label class="form-label" >Accountname</label>
                </div>

                <!-- Password input -->
                <div class="form-outline mb-4">
                    <input type="password" v-model="form.passwort" class="form-control" />
                    <label class="form-label" >Passwort</label>
                </div>

                <!-- Submit button -->
                <button type="button" class="btn btn-primary btn-block mb-4" @click.prevent="login">Einloggen</button>
                <div v-if="form.fail" class="text-center text-danger">
                    Benutzername oder Passwort falsch!
                </div>  
                <div class="text-center">
                    <a href="#!">Passwort vergessen?</a>
                </div>
                <LoadingComponent :loading="this.form.loading"/>           
            </div>
        </form>
    </div>
    </div>
</template>

<script>
  // import CONSTANTS from '@/constants.js';
  import api from '@/api'
  import LoadingComponent from "@/components/LoadingComponent.vue"
  // const CONSTANTS = {DEFAULT_organisationId: 1};
  export default { 
    name : 'App',
    data() {
      return {
        organisationName: "LSWI-Lehrstuhl",
        organisationId: "",
        form: {
          name: '',
          passwort: '',
          fail: false,
          loading: false,
        },
        account: "",
      }
    },
    components: {
      LoadingComponent,
    },
    methods: {
      accountHandler() {
        if (this.account) {
          this.logout()
        }
        else {
          this.$router.push("/login")
        }
      },
      async login(){
        this.form.loading = true;
        this.form.fail = false;
        let data = {accountName: this.form.name, passwort: this.form.passwort}
        try {
          let response = await api.verifyLogin(data);
          if (response.accountName) {
            setTimeout(async () => {                    
              sessionStorage.setItem("account", response.accountName);
              console.log(response)
              this.account = sessionStorage.getItem("account");
              document.cookie = {organisationId: response.organisatonId};
              this.organisationId = response.organisationId;
              sessionStorage.setItem("organisationId", this.organisationId)
              this.form.name = "";
              this.form.passwort = "";
            }, "1000");
          } else {
            this.form.fail = true;
          }
        } catch (e) {
          console.error(e);
          this.form.fail = true;
        }
        this.form.loading = false;
      },
      logout(){
        setTimeout(() => {
          sessionStorage.setItem("account", "")
          this.account = sessionStorage.getItem("account");
          this.loginName = "";
        }, "1000");
      }
    },
    mounted() {
      this.$store.commit('initializeStore');
      this.account = sessionStorage.getItem("account");   
    }
  }
  // set default organisation
  // document.cookie = {organisationId: CONSTANTS.DEFAULT_organisationId};
  // sessionStorage.setItem("organisationId", CONSTANTS.DEFAULT_organisationId);
</script>

<style>

.body {
  overflow-y: scroll;
}

.container {
  margin-top: 20px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.flex-1 {
  flex:1;
}

.login-form {
    width: 500px;
    max-width: 650px;
}
</style>
