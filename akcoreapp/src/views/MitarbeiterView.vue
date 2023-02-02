<template>
  <h2>Mitarbeiter</h2>
  <div v-for="ma in mitarbeiter" :key="ma">
    <form class="needs-validation">
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Name</span>
            <input type="text" class="form-control" v-model="ma.ma_name" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" >
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Email</span>
            <input type="text" class="form-control" v-model="ma.ma_email" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="col-3">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Rolle</span>
            <select class="form-control" v-model="ma.ma_rolle" aria-label="Default select example">
              <option value="none">Bitte Rolle auswählen</option>
              <option value="Key-User" v-bind:selected="ma.ma_rolle == 'Key-User'">Key-User</option>
              <option value="User" v-bind:selected="ma.ma_rolle == 'User'">User</option>
              <option value="Change-Manager" v-bind:selected="ma.ma_rolle == 'Change-Manager'">Change-Manager</option>
            </select>
          </div>
        </div>
        <div class="col-1">
          <div class="btn-container">
            <button class="btn btn-outline-warning" @click.prevent="editMitarbeiter(ma)" type="submit">Edit</button>
            <button class="btn btn-danger" type="delete" @click.prevent="deleteMitarbeiter(ma)">Delete</button>
          </div>
        </div>
      </div>
    </form>   
  </div>
  <!-- create-new-mitarbeiter row -->
  <form class="needs-validation g-3" novalidate>
    <div class="row">
      <div class="col">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Name</span>
          <input type="text" class="form-control" v-model="model.ma_name" placeholder="Name" aria-label="Username" aria-describedby="basic-addon1" >
        </div>
      </div>
      <div class="col">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Email</span>
          <input type="text" class="form-control" v-model="model.ma_email" placeholder="E-Mail" aria-label="Username" aria-describedby="basic-addon1" required>
        </div>
      </div>
      <div class="col-3">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Rolle</span>
          <select class="form-control" v-on:click="cl" v-model="model.ma_rolle" aria-label="Default select example">
            <option value=undefined>Bitte Rolle auswählen</option>
            <option value="Key-User">Key-User</option>
            <option value="User">User</option>
            <option value="Change-Manager">Change-Manager</option>
          </select> 
        </div>
      </div>
      <div class="col-1">
        <div class="btn-container">
          <button class="btn btn-outline-success" style="width:100%;" @click.prevent="createMitarbeiter" type="submit">Create</button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
  import api from '@/api'
  export default {
    name: "ProjectManagerVuew.vue",
    data(){
        return{
            loading: false,
            mitarbeiter: [],
            org_id: 1,
            model: {}
        }
    },
    async created () {
      console.log(this)
      console.log(this.model.ma_rolle)
      console.log(await this.refreshMitarbeiter());
    },
    methods: {
      async refreshMitarbeiter() {
        this.loading = true;
        this.mitarbeiter = await api.getMitarbeiter(this.org_id);
        console.log("Mitarbeiter:")
        console.log(this.mitarbeiter);
        this.loading = false;
      },

      async createMitarbeiter() {
        var ma = this.model;
        ma.org_id = this.org_id;

        try {
          await api.createMitarbeiter(ma);
        } catch (e) {
          console.log(e);
          confirm(`Fehler: Mitarbeiter konnte nicht erstellt werden.`)
        }

        this.model = {};
        await this.refreshMitarbeiter();
        
      },

      async editMitarbeiter(ma) {
        console.log("editma:");
        console.log(ma)
        try {
          await api.updateMitarbeiter(ma);
          confirm(`Mitarbeiter "${ma.ma_name}" erfolgreich überarbeitet.`)
        } catch (e) {
          console.log(e);
          confirm(`Fehler: Mitarbeiter konnte nicht überarbeitet werden.`)
        }
        await this.refreshMitarbeiter();
      },

      async deleteMitarbeiter(ma) {
        if(confirm(`Möchten Sie den Mitarbeiter "${ma.ma_name}" wirklich löschen?`)) {
          console.log("ja");
          console.log(`delete ma (id=${ma.ma_id})`)

          await api.deleteMitarbeiter(ma.ma_id);
          await this.refreshMitarbeiter();
        }
      }
    }
  }
</script>

<style>
.btn-container{
  width: 150px;
  display: flex;
  gap: 10px;
}
.btn {
  flex: 1;
}

</style>