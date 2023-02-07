<template>
  <h2>Mitarbeiter</h2>
  <LoadingComponent v-if="loading" loading=loading />
  <div class="mt-4">
    <div v-for="ma in mitarbeiter" :key="ma">
      <form class="needs-validation">
        <div class="row">
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text">Name</span>
              <input type="text" class="form-control" v-model="ma.mitarbeiterName" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" >
            </div>
          </div>
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text">Email</span>
              <input type="text" class="form-control" v-model="ma.mitarbeiterEmail" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
            </div>
          </div>
          <div class="col-3">
            <div class="input-group mb-3">
              <span class="input-group-text">Rolle</span>
              <select class="form-control" v-model="ma.mitarbeiterRolle" aria-label="Default select example">
                <option value="none">Bitte Rolle auswählen</option>
                <option value="Key-User" v-bind:selected="ma.mitarbeiterRolle == 'Key-User'">Key-User</option>
                <option value="User" v-bind:selected="ma.mitarbeiterRolle == 'User'">User</option>
                <option value="Change-Manager" v-bind:selected="ma.mitarbeiterRolle == 'Change-Manager'">Change-Manager</option>
              </select>
            </div>
          </div>
          <div class="col-2">
            <div class="btn-container">
              <button class="btn btn-outline-warning" @click.prevent="editMitarbeiter(ma)" type="submit">Edit</button>
              <button class="btn btn-danger" type="delete" @click.prevent="deleteMitarbeiter(ma)">Delete</button>
            </div>
          </div>
        </div>
      </form>   
    </div>
    <!-- create-new-mitarbeiter row -->
    <form v-if="!loading" class="needs-validation g-3" novalidate>
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Name</span>
            <input type="text" class="form-control" v-model="model.mitarbeiterName" placeholder="Name" aria-label="Username" aria-describedby="basic-addon1" >
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Email</span>
            <input type="text" class="form-control" v-model="model.mitarbeiterEmail" placeholder="E-Mail" aria-label="Username" aria-describedby="basic-addon1" required>
          </div>
        </div>
        <div class="col-3">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Rolle</span>
            <select class="form-control" v-model="model.mitarbeiterRolle" aria-label="Default select example">
              <option value=undefined>Bitte Rolle auswählen</option>
              <option value="Key-User">Key-User</option>
              <option value="User">User</option>
              <option value="Change-Manager">Change-Manager</option>
            </select> 
          </div>
        </div>
        <div class="col-2">
          <div class="btn-container">
            <button class="btn btn-outline-success" style="width:100%;" @click.prevent="createMitarbeiter" type="submit">Create</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>

  import api from '@/api'
  import LoadingComponent from "@/components/LoadingComponent.vue"
  export default {
    name: "MitarbeiterView.vue",
    components: {
      LoadingComponent
    },
    data(){
        return{
            loading: false,
            mitarbeiter: [],
            organisationId: sessionStorage.organisationId,
            model: {}
        }
    },
    async created () {
      await this.refreshMitarbeiter();
      console.log("sesh storg");
      console.log(sessionStorage.organisationId)
    },
    methods: {
      async refreshMitarbeiter() {
        this.loading = true;
        this.mitarbeiter = await api.getMitarbeiterAll(this.organisationId);
        console.log("Mitarbeiter:")
        console.log(this.mitarbeiter);
        this.loading = false;
      },

      async createMitarbeiter() {
        var ma = this.model;
        ma.organisationId = this.organisationId;

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
          confirm(`Mitarbeiter "${ma.mitarbeiterName}" erfolgreich überarbeitet.`)
        } catch (e) {
          console.log(e);
          confirm(`Fehler: Mitarbeiter konnte nicht überarbeitet werden.`)
        }
        await this.refreshMitarbeiter();
      },

      async deleteMitarbeiter(ma) {
        if(confirm(`Möchten Sie den Mitarbeiter "${ma.mitarbeiterName}" wirklich löschen?`)) {
          console.log("ja");
          console.log(`delete ma (id=${ma.mitarbeiterId})`)

          await api.deleteMitarbeiter(ma.mitarbeiterId);
          await this.refreshMitarbeiter();
        }
      }
    }
  }
</script>

<style scoped>
.btn-container{
  width: 150px;
  display: flex;
  gap: 10px;
}
.btn {
  flex: 1;
}

.col-2 {
  width: 150px;
}

</style>