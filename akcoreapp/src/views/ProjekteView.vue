<template>
  <h2>Projekte</h2>
  <div class="mt-4 mb-4">
    <router-link to="/projekte/createNew" class="btn btn-outline-success">Neues Projekt erstellen</router-link>
    <div class="card-container mt-4">
      <div class="card" v-for="proj in projekte" :key="proj">
        <div class="card-body">          
          <h5 class="card-title">{{ proj.proj_name }}</h5>
          <p class="card-text">{{ proj.proc_descr }}</p>
          <a href="#" class="btn btn-primary">Projekt öffnen</a>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <div class="row">
              <div class="col">Start: {{ proj.proj_startDate }}</div>
              <div class="col">Ende: {{ proj.proj_endDate }}</div>
            </div>       
          </li>
          <li class="list-group-item">Anzahl Teilnehmer: 5</li>
        </ul>
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
  height: 150px;
  flex: 400px 1;
}

</style>