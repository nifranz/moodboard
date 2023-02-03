<template>
  <h2>Projekte</h2>
  <div class="mt-4 mb-4">
    <router-link to="/projekte/createNew" class="btn btn-outline-success">Neues Projekt erstellen</router-link>
    <div class="card-container mt-4">
      <div class="card" v-for="proj in projekte" :key="proj">
        <div class="card-header">
          <h5 class="card-title mt-1 mb-2">{{ proj.proj_name }}</h5>
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class="nav-link card-link active" tab="info" v-bind:tab-group="proj.proj_id" aria-current="true" @click="navFunc">Beschreibung</a>
            </li>
            <li class="nav-item">
              <a class="nav-link card-link" tab="umfragen" v-bind:tab-group="proj.proj_id" @click="navFunc">Umfragen</a>
            </li>
            <li class="nav-item">
              <a class="nav-link card-link" tab="teilnehmer" v-bind:tab-group="proj.proj_id" @click="navFunc">Teilnehmer</a>
            </li>
          </ul>
        </div>
        <section class="card-body" tab="info" v-bind:tab-group="proj.proj_id">     
          <p class="card-text">{{ proj.proj_descr }}</p>          
        </section>
        <section class="card-body" tab="umfragen" v-bind:tab-group="proj.proj_id" hidden>
          <p class="card-text">Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen ListeUmfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen ListeUmfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen ListeUmfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste Umfragen Liste</p>          
        </section>
        <section class="card-body" tab="teilnehmer" v-bind:tab-group="proj.proj_id" hidden>          
          <p class="card-text">Teilnehmer Liste</p>          
        </section>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"> 
            <div class="row">
              <div class="col">Start: {{ proj.proj_startDate }}</div>
              <div class="col">Ende: {{ proj.proj_endDate }}</div>
            </div>       
          </li>
          <li class="list-group-item">Anzahl Teilnehmer: 5</li>
        </ul>
        <div class="d-grid w-75 mx-auto">
          <a href="#" class="btn btn-primary">Projekt öffnen</a>
        </div>
        
        <div class="card-footer text-success">
          Projekt aktiv
        </div>
      </div>     
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  export default {
    name: "ProjekteView.vue",
    data(){
        return{
            loading: false,
            projekte: [],
            org_id: sessionStorage.org_id,
            model: {}
        }
    },
    async created () {
      console.log("sesh storg");
      console.log(sessionStorage.org_id);

      var proj = await api.getProjekte(this.org_id);
      console.log(proj);

      this.projekte = proj;
    },
    methods: {   
      navFunc(e) {
        let html_link = e.target;
        let tab = html_link.getAttribute("tab");
        let tabGroup = html_link.getAttribute("tab-group"); // the org_id of the projekt
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

      }   
    }
  }




</script>

<style>

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  flex: 370px 1;
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
}


</style>