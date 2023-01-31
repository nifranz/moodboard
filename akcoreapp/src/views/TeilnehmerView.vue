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
            <div class="dropdown">
              <select class="form-control" aria-label="Default select example">
                <option selected>Bitte Rolle auswählen</option>
                <option value="1">Key-User</option>
                <option value="2">User</option>
                <option value="3">Change-Manager</option>
              </select>
            </div>
          </div>
        </div>
        <div class="col-1">
          <button class="btn btn-danger" type="delete">Delete</button>
        </div>
      </div>    
    </div>
</template>

<script>
  import teilnehmerDB from '../../db/teilnehmer.json'
  export default {
    name: "ProjectManagerVuew.vue",
    data(){
        return{
            teilnehmer: teilnehmerDB
        }
    }

  }
</script>

<style>

</style>