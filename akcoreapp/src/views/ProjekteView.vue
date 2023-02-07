<template>
  <h2>Projekte</h2>
  <LoadingComponent v-if="loading" loading=loading />
  <div class="mt-4 mb-4">
    <router-link v-if="!loading" to="/projekte/createNew" class="btn btn-outline-success">Neues Projekt erstellen</router-link>
    <div class="card-container mt-4">
      <div class="card projekt" v-for="proj in projekte" :key="proj">
        <div class="card-header">
          <h5 class="card-title mt-1 mb-2">{{ proj.projektName }}</h5>
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class="nav-link card-link active" tab="info" v-bind:tab-group="proj.projektId" aria-current="true" @click="navFunc">Beschreibung</a>
            </li>
            <li class="nav-item">
              <a class="nav-link card-link" tab="umfragen" v-bind:tab-group="proj.projektId" @click="navFunc">Umfragen</a>
            </li>
            <li class="nav-item">
              <a class="nav-link card-link" tab="teilnehmer" v-bind:tab-group="proj.projektId" @click="navFunc">Teilnehmer</a>
            </li>
          </ul>
        </div>
        <section class="card-body" tab="info" v-bind:tab-group="proj.projektId">     
          <p class="card-text">{{ proj.projektBeschreibung }}</p>          
        </section>
        <section class="card-body" tab="umfragen" v-bind:tab-group="proj.projektId" hidden>
          <div v-for="(umfr, index) in proj.umfrages" :key="umfr">
            <label for="basic-url"><h5>Umfrage {{ index + 1 }}</h5></label>       
            <div class="input-group mb-2">     
                <span type="text" class="form-control d-flex align-items-center">{{umfr.umfrageStartDate}}</span>
                <span type="text" class="form-control d-flex align-items-center">{{umfr.umfrageEndDate}}</span>
                <span type="text" class="form-control d-flex align-items-center">Master-Fragebogen</span>                  
            </div>
          </div>       
        </section>
        <section class="card-body" tab="teilnehmer" v-bind:tab-group="proj.projektId" hidden>          
          <div class="input-group mb-2" v-for="teiln in proj.mitarbeiters" :key="teiln">
            <span type="text" class="form-control d-flex align-items-center">{{ teiln.mitarbeiterName }}</span>          
            <span type="text" class="form-control d-flex align-items-center">{{ teiln.mitarbeiterEmail }}</span>
            <span type="text" class="form-control d-flex align-items-center">{{ teiln.mitarbeiterRolle }}</span> 
          </div>          
        </section>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"> 
            <div class="row">
              <div class="col">Start: {{ proj.projektStartDate }}</div>
              <div class="col">Ende: {{ proj.projektEndDate }}</div>
            </div>       
          </li>
          <li class="list-group-item">Anzahl Teilnehmer: {{ proj.mitarbeiters.length }}</li>
          <li class="list-group-item">
            <div v-if="proj.isActive == true" class="text-success">
              Projekt aktiv
            </div>
            <div v-if="proj.isActive == false" class="text-danger">
              Projekt inaktiv
            </div>
          </li>
        </ul>
        <router-link v-bind:to="'/projekte/' + proj.projektId" class="footer-btn btn btn-primary">Projekt öffnen</router-link>

      </div>     
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import LoadingComponent from "@/components/LoadingComponent.vue"
  export default {
    name: "ProjektView.vue",
    components: {
      LoadingComponent
    },
    data(){
        return{
            loading: false,
            projekte: [],
            organisationId: sessionStorage.organisationId,
            model: {}
        }
    },
    async created () {
      console.log("sesh storg");
      console.log(sessionStorage.organisationId);
      await this.refreshProjekte();
    },
    methods: {         
      async refreshProjekte() {
        this.loading = true;
        var proj = await api.getProjekte(this.organisationId);
        this.projekte = proj;
        this.projekte.forEach(p => {
          let from = new Date(p.projektStartDate);
          let to = new Date(p.projektEndDate);
          if ((Date.now() <= to) && (Date.now() >= from)) {
            p.isActive = true;
          } else {
            p.isActive = false;
          }          
        });
        this.loading = false;
        console.log(this.projekte)
      },
      async getProjekt(projektId) {
        console.log(await api.getProjekt(projektId));
      },
      navFunc(e) {
        let html_link = e.target;
        let tab = html_link.getAttribute("tab");
        let tabGroup = html_link.getAttribute("tab-group"); // the organisationId of the projekt
        let html_groupLinks = document.querySelectorAll(`a[tab-group='${tabGroup}']`);
        html_groupLinks.forEach(e => {
          e.classList.remove("active");
        });
        html_link.classList.add("active")
        let html_groupContentAll = document.querySelectorAll(`section[tab-group='${tabGroup}']`);
        let html_groupContentTab = document.querySelectorAll(`section[tab-group='${tabGroup}'][tab='${tab}']`);
        html_groupContentAll.forEach(e => {
          e.hidden = true;
        })
        html_groupContentTab[0].hidden = false;
      },
    }
  }

</script>

<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card.projekt {
  flex: 385px 1;
}
.ctr {
  display: flex;
  justify-content: center;
}

.nav a:hover:not(.active) {
  cursor: pointer;
}

.card-body {
  overflow: overlay;
  transition: 1s;
}

.spinner {
  color:rgb(102, 102, 102)
}


</style>