<template>
  <h2>Projekte</h2>
  <div class="mb-4">
    <a href="#" class="btn btn-outline-success mt-4 ">Neues Projekt erstellen</a>
    <div class="card-container mt-4">
      <div class="card" v-for="proj in projekte" :key="proj">
        <div class="card-body">          
          <h5 class="card-title">{{ proj }}</h5>
          <p class="card-text">Dies ist eine Projektbeschreibung. Hier werden Informationen zu deinem Projekt angezeigt.</p>
          <a href="#" class="btn btn-primary">Projekt öffnen</a>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <div class="row">
              <div class="col">Start: 15.02.2023</div>
              <div class="col">Ende: 15.02.2023</div>
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
  // import api from '@/api'
  export default {
    name: "ProjekteView.vue",
    data(){
        return{
            loading: false,
            projekte: ["Projekt 1", "Projekt 2", "Projekt 3","Projekt 4","Projekt 5"],
            org_id: localStorage,
            model: {}
        }
    },
    async created () {
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