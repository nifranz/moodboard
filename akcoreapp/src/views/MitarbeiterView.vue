<template>
  <h2>Mitarbeiter und Abteilungen</h2>
  <LoadingComponent v-if="loading" :loading="this.loading" />
  <ErrorComponent v-if="error" :error="this.error" />
  <div v-if="!error" class="mt-3">
    <form v-if="!loading && abteilungen.length" class="needs-validation g-3" novalidate>
        <h5>Mitarbeiter hinzufügen:</h5>
        <div class="row">
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Name</span>
              <input type="text" class="form-control" v-model="model.mitarbeiter.mitarbeiterName" placeholder="Name" >
            </div>
          </div>
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Email</span>
              <input type="text" class="form-control" v-model="model.mitarbeiter.mitarbeiterEmail" placeholder="E-Mail" required>
            </div>
          </div>
          <div class="col-3">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Abteilung</span>
              <select class="form-control" v-model="model.mitarbeiter.abteilungId" >
                <option disabled value=undefined>Bitte auswählen</option>
                <option v-for="abt in abteilungen" :key="abt" v-bind:value="'' + abt.abteilungId">{{ abt.abteilungName }}</option>
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

      <form v-if="!loading" class="needs-validation g-3" novalidate>
        <h5>Abteilung hinzufügen:</h5>
        <div class="row">
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Abteilungsname</span>
              <input type="text" class="form-control" v-model="model.abteilung.abteilungName" placeholder="Name" >
            </div>
          </div>
          <div class="col-2">
            <div class="btn-container">
              <button class="btn btn-outline-success" style="width:100%;" @click.prevent="createAbteilung" type="submit">Create</button>
            </div>
          </div>
        </div>
        <hr class="hr" style="border: 0;
          height: 3px;
          background: #095484;
          background-image: linear-gradient(to right, #ccc, #095484, #ccc);"/>
      </form>

    <form v-if="!loading">
      <ul v-for="abt in abteilungen" :key="abt" class="mb-4 ">
        <div>Abteilung:</div>
        <h3>{{ abt.abteilungName }}</h3>
        <div v-if="!abt.mitarbeiters.length" class="text-secondary">Keine Mitarbeiter in dieser Abteilung.</div>
        <li class ="row mt-2" v-for="ma in abt.mitarbeiters" :key="ma">
          <div class="col">
            <div class="input-group">
              <span class="input-group-text">Name</span>
              <input type="text" class="form-control" v-model="ma.mitarbeiterName" placeholder="Name">
            </div>
          </div>
          <div class="col">
            <div class="input-group">
              <span class="input-group-text">Email</span>
              <input type="text" class="form-control" v-model="ma.mitarbeiterEmail" placeholder="E-Mail">
            </div>
          </div>
          <div class="col-3">
            <div class="input-group">
              <span class="input-group-text">Abteilung</span>
              <select class="form-control" v-model="ma.abteilungId">
                <option disabled value=undefined>Bitte Rolle auswählen</option>
                <option v-for="abt in abteilungen" :key="abt" v-bind:value="abt.abteilungId">{{ abt.abteilungName }}</option>
              </select>
            </div>
          </div>
          <div class="col-2">
            <div class="btn-container">
              <button class="btn btn-outline-warning" @click.prevent="editMitarbeiter(ma)" type="submit">Bearbeiten</button>
              <button class="btn btn-danger" type="delete" @click.prevent="deleteMitarbeiter(ma)">Löschen</button>
            </div>
          </div>
        </li>
        <button v-if="!abt.mitarbeiters.length" class="btn btn-outline-danger mt-2" @click.prevent="deleteAbteilung(abt)">Abteilung löschen</button>
        <hr class="hr" style="hr1"/>
      </ul>
      <div v-if="!abteilungen.length">
        <p class="color-secondary">Es existieren keine Abteilungen. Um einen Mitarbeiter zu anzulegen, legen sie bitte zunächst eine Abteilung an.</p>
        <hr class="hr" />
      </div>
    </form>
    <!-- create-new-mitarbeiter row -->
  </div>
</template>

<script>

  import api from '@/api'
  import LoadingComponent from "@/components/LoadingComponent.vue"
  import ErrorComponent from "@/components/ErrorComponent.vue"
  export default {
    name: "MitarbeiterView.vue",
    components: {
      LoadingComponent,
      ErrorComponent
    },
    data(){
        return{
            error: undefined,
            loading: false,
            mitarbeiter: [],
            abteilungen: [],
            organisationId: sessionStorage.organisationId,
            model: {
              abteilung: {},
              mitarbeiter: {}
            },
        }
    },
    async created () {
      await this.refreshData();
      console.log("sesh storg");
      console.log(sessionStorage.organisationId)
    },
    methods: {
      async refreshData() {
        this.loading = true;
        try {
          this.mitarbeiter = await api.getMitarbeiter(this.organisationId);
          this.abteilungen = await api.getAbteilungen(this.organisationId);
          console.log(this.abteilungen)
        } catch (e) {
          this.error = e;
          console.log(this.error)
          console.log(e)
        }
        console.log("Mitarbeiter:")
        console.log(this.mitarbeiter);
        console.log("Abteilungen:")
        console.log(this.abteilungen);
        this.loading = false;
      },

      async createMitarbeiter() {
        var ma = this.model.mitarbeiter;
        ma.organisationId = this.organisationId;

        this.loading = true;
        try {
          await api.createMitarbeiter(ma);
        } catch (e) {
          console.log(e);
          alert(`Server-Fehler: Mitarbeiter konnte nicht erstellt werden.`)
        }
        this.loading = false;
        this.model.mitarbeiter = {};
        await this.refreshData();
      },

      async editMitarbeiter(ma) {
        console.log("editma:");
        console.log(ma)
        try {
          await api.updateMitarbeiter(ma);
          alert(`Mitarbeiter "${ma.mitarbeiterName}" erfolgreich überarbeitet.`)
        } catch (e) {
          console.log(e);
          alert(`Server-Fehler: Mitarbeiter konnte nicht überarbeitet werden.`)
        }
        await this.refreshData();
      },

      async deleteMitarbeiter(ma) {
        if(confirm(`Möchten Sie den Mitarbeiter "${ma.mitarbeiterName}" wirklich löschen?`)) {
          console.log("ja");
          console.log(`delete ma (id=${ma.mitarbeiterId})`)

          await api.deleteMitarbeiter(ma.mitarbeiterId);
          await this.refreshData();
        }
      },
      async createAbteilung() {
        var abt = this.model.abteilung;
        abt.organisationId = this.organisationId;
        this.loading = true;
        try {
          await api.createAbteilung(abt);
          alert(`Abteilung "${abt.abteilungName}" erfolgreich erstellt.`)
        } catch (e) {
          console.log(e);
          alert(`Server-Fehler: Abteilung konnte nicht erstellt werden.`)
        }
        this.model.abteilung = {};
        await this.refreshData();
        this.loading = false;
      },
      async deleteAbteilung(abt) {
        if (abt.mitarbeiters.length) {
          alert("In der Abteilung existieren Mitarbeiter, daher kann sie nicht gelöscht werden.");
          return
        } else {
          this.loading = true;
          try {
            console.log("abt", abt)
            await api.deleteAbteilung(abt.abteilungId);
            alert(`Abteilung "${abt.abteilungName}" erfolgreich gelöscht.`);
            await this.refreshData();
          } catch (e) {
            console.log(e);
            alert(`Server-Fehler: Abteilung konnte nicht gelöscht werden.`);
          }
          this.loading = false;
        }
      }
    }
  }
</script>

<style scoped>
ul {
  padding: 0px;
  margin: 0px;
}
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