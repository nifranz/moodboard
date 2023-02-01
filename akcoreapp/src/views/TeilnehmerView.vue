<template>
    <h2>Teilnehmer</h2>
    <div v-for="teiln in teilnehmer" :key="teiln">
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Name</span>
            <input type="text" class="form-control" v-bind:value="teiln.name" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" >
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Email</span>
            <input type="text" class="form-control" v-bind:value="teiln.email" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="col-3">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Rolle</span>
            <select class="form-control" aria-label="Default select example">
              <option >Bitte Rolle auswählen</option>
              <option selected v-bind:value="teiln.rolle">{{ teiln.rolle }}</option>
              <option value="2">User</option>
              <option value="3">Change-Manager</option>
            </select>
          </div>
        </div>
        <div class="col-1">
          <button class="btn btn-danger" type="delete" @click.prevent="deleteTeiln(teiln)">Delete</button>
        </div>
      </div>    
    </div>    
    <div class="row">
      <div class="col">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Name</span>
          <input type="text" class="form-control" v-model="model.name" placeholder="Name" aria-label="Username" aria-describedby="basic-addon1" >
        </div>
      </div>
      <div class="col">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Email</span>
          <input type="text" class="form-control" v-model="model.email" placeholder="E-Mail" aria-label="Username" aria-describedby="basic-addon1">
        </div>
      </div>
      <div class="col-3">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Rolle</span>
          <select class="form-control" v-model="model.rolle" aria-label="Default select example">
            <option selected>Bitte Rolle auswählen</option>
            <option value="1">Key-User</option>
            <option value="2">User</option>
            <option value="3">Change-Manager</option>
          </select>
        </div>
      </div>
      <div class="col-1">
        <button class="btn btn-success" @click.prevent="createTeiln()" type="delete">Create</button>
      </div>
    </div>
</template>

<script>
  import teilnehmerDB from '../../db/teilnehmer.json'
  // Enriching teilnehmerDB
  for (let teiln of teilnehmerDB) {
    switch (teiln.rolle) {
      case "01":
        teiln.rolle = "Change Manager"
        break;
      case "02":
        teiln.rolle = "Key-User"
        break;
      case "03":
        teiln.rolle = "User"
    }
  }

  export default {
    name: "ProjectManagerVuew.vue",
    data(){
        return{
            teilnehmer: teilnehmerDB,
            model: {}
        }
    },
    methods: {
      async deleteTeiln (teiln) {
        if(confirm(`Möchten Sie den Teilnehmer "${teiln.name}" wirklich löschen?`)) {
          console.log("ja");
          console.log(`delete teiln (id=${teiln.id})`)
          this.teilnehmer = this.teilnehmer.filter(t => {
            console.log(t.id);
            console.log(teiln.id);
            return t.id != teiln.id;
          })
        }
      },
      async createTeiln() {
        var teiln = this.model;
        if(confirm(`Möchten Sie den Teilnehmer "${teiln.name}" wirklich erstellen?`)) {
          console.log("ja");
          console.log(teiln)
          this.teilnehmer.push(Object.assign({},teiln));
          this.model = {};
        }
      }
    }
  }
</script>

<style>

</style>