<template>
    <h2>Projekte > Neues Projekt</h2>
    <form class="mt-4 mb-4">
        <div class="card p-4">
            <div class="form-floating">
                <input class="form-control" placeholder="Name">
                <label for="floatingInput">Projektname</label>
            </div>
            <div class="form-floating">
                <textarea class="form-control" placeholder="Projektbeschreibung" id="floatingTextarea2" style="height: 100px"></textarea>
                <label>Projektbeschreibung</label>
            </div>
            <div class ="d-flex">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1">Projekt-Start</span>
                    <input class="form-control" type="date">
                </div>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1">Projekt-Ende</span>
                    <input class="form-control" type="date">
                </div>
            </div>
            <button class="btn btn-outline-primary" @click.prevent="setOrg(selectedOrg)" type="submit">Bestätigen</button>
        </div>        
    </form>
  </template>
  
  <script>
    import api from '@/api'
    export default {
      name: "CreateProjektView.vue",
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
  

  
  .card {
    gap:10px;
  }

  .d-flex {
    gap:10px;
  }
  
  </style>