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
              <input :style="{borderColor: hintName}" type="text" class="form-control" v-model="model.mitarbeiter.mitarbeiterName" placeholder="Name">
            </div>
          </div>
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Email</span>
              <input :style="{ borderColor: hintEmail }" type="text" class="form-control" v-model="model.mitarbeiter.mitarbeiterEmail" placeholder="E-Mail" required>
            </div>
          </div>
          <div class="col-3">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">Abteilung</span>
              <select class="form-control" v-model="model.mitarbeiter.abteilungId" :style="{ borderColor: hintAbteilung }">
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
              <input :style="{borderColor: hintAbteilungCreate}" type="text" class="form-control" v-model="model.abteilung.abteilungName" placeholder="Name" >
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
                <option disabled value=undefined>Bitte auswählen</option>
                <option v-for="abt in abteilungen" :key="abt" v-bind:value="abt.abteilungId">{{ abt.abteilungName }}</option>
              </select>
            </div>
          </div>
          <div class="col-2">
            <div class="btn-container">
              <button id="edit_MA" class="btn btn-outline-warning" @click.prevent="editMitarbeiter(ma)" type="submit">Bearbeiten</button>
              <element id="snackbar" ></element>
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
      <h5>Mitarbeiter durch CSV hinzufügen:</h5>
      <div>Vorgaben für den Import:   Trennzeichen: ;  <br> Daten: Name, Email, Abteilungsname <br>
        Verwendung von nur bereits angelegten Abteilungen!
      </div>
      
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <input type="file" class="form-control" id="csv-file" accept=".csv">
          </div>
        </div>
        <div class="col-2">
          <div class="btn-container">
            <button class="btn btn-outline-success" style="width:100%;" @click.prevent="importCSV" type="submit">Upload</button>
          </div>
        </div>
        <table id="csv-table"></table>
      </div>
        
      
      
        

    </form>
  
    <form v-if="!loading" class="needs-validation g-3" novalidate>
      <h5>Abteilung hinzufügen:</h5>
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Abteilungsname</span>
            <input type="text" class="form-control" v-model="model.abteilung.abteilungName" placeholder="Name">
          </div>
        </div>
        <div class="col-2">
          <div class="btn-container">
            <button class="btn btn-outline-success" style="width:100%;" @click.prevent="createAbteilung" type="submit">Create</button>
          </div>
        </div>
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
            hintName: '',
            hintEmail: '',
            hintAbteilung: '',
            hintAbteilungCreate: '',
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
      async showToast(content="error"){
        var x = document.getElementById('snackbar');
        x.innerHTML=content;
        x.className="show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 2250);
      },

      async refreshData() {
        this.loading = true;
        this.hintName = '';
        this.hintEmail = '';
        this.hintAbteilung = '';
        this.hintAbteilungCreate = '';
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var ma = this.model.mitarbeiter;
        ma.organisationId = this.organisationId;

        if (ma.mitarbeiterName != undefined && ma.mitarbeiterEmail != undefined && ma.abteilungId != undefined && emailRegex.test(ma.mitarbeiterEmail)){
          this.loading = true;
          try {
            await api.createMitarbeiter(ma);
            this.showToast(`Mitarbeiter "${ma.mitarbeiterName}" erfolgreich erstellt.`);
          } catch (e) {
            console.log(e);
            this.showToast(`Server-Fehler: Mitarbeiter konnte nicht erstellt werden.`)
          }
          this.loading = false;
          this.model.mitarbeiter = {};
          await this.refreshData();
        }
        else {
          if (ma.mitarbeiterName == undefined) {
            this.hintName = 'red';
          }
          if (ma.mitarbeiterEmail == undefined || !emailRegex.test(ma.mitarbeiterEmail)) {
            this.hintEmail = 'red';
          }
          if (ma.abteilungId == undefined){
            this.hintAbteilung = 'red';
          }
        }
      },
      async importCSV() {
        const fileInput = document.getElementById('csv-file');
        if (fileInput.files.length === 0) {
        this.showToast('Es ist keine CSV Tabelle ausgewählt!');
          return;
        }
        //Einlesen und umwandeln der CSV
        this.loading = true;
        const file = fileInput.files[0];
        const table = document.getElementById('csv-table'); 
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event)=> {
          const csv = event.target.result;
          const rows = csv.split('\n');
          
          for (let i = 1; i < rows.length; i++) {
            const dataRow = document.createElement('tr');
            const dat = rows[i].split(';');
            dat.forEach(function(value) {
              const td = document.createElement('td');
              td.textContent = value;
              dataRow.appendChild(td);
            });
          table.appendChild(dataRow);
          }
          // Beginn der Erstellung von Mitarbeitern
          for(var i=0;i<rows.length;i++){ 
            var ma =this.model.mitarbeiter;
            ma.organisationId=this.organisationId;
            ma.mitarbeiterName=table.children[i].children[0].innerHTML;
            ma.mitarbeiterEmail=table.children[i].children[1].innerHTML;
            for(let abt of this.abteilungen){
              var id_n='';
              id_n=abt.abteilungName;
              if(table.children[i].children[2].innerHTML.includes(id_n)){
              ma.abteilungId=abt.abteilungId;
              }
            }
            //Prüfen ob Email bereits vorhanden.
            for(let ma_check of this.mitarbeiter){
              if(table.children[i].children[1].innerHTML.includes(ma_check.mitarbeiterEmail)){
                ma={};
              }
            }
            try{    
              api.createMitarbeiter(ma);
            }
            catch(e){
              console.log(e);
              this.loading=false;
              alert("Fehler!");
            return;
            }
            this.model.mitarbeiter = {};
          }
        }
        await this.refreshData();
        this.loading = false;
        this.showToast(`Vorgang abgeschlossen!`);
      },

      async editMitarbeiter(ma) {
        console.log("editma:");
        console.log(ma)
        try {
          await api.updateMitarbeiter(ma);
          await this.refreshData();
          this.showToast(`Mitarbeiter "${ma.mitarbeiterName}" erfolgreich bearbeitet.`);
        } catch (e) {
          console.log(e);
          await this.refreshData();
          this.showToast(`Server-Fehler: Mitarbeiter konnte nicht überarbeitet werden.`); 
        }
        //setTimeout(this.refreshData,2500);
      },

      async deleteMitarbeiter(ma) {
        if(confirm(`Möchten Sie den Mitarbeiter "${ma.mitarbeiterName}" wirklich löschen?`)) {
          console.log("ja");
          console.log(`delete ma (id=${ma.mitarbeiterId})`)
          try{
            await api.deleteMitarbeiter(ma.mitarbeiterId);
            await this.refreshData();
            this.showToast(`Mitarbeiter "${ma.mitarbeiterName}" erfolgreich gelöscht.`);
          } catch(e){
            console.log(e)
            await this.refreshData();
            this.showToast(`Server-Fehler: Mitarbeiter konnte nicht gelöscht werden.`);
          }
          
          //setTimeout(this.refreshData,2500);
        }
      },
      async createAbteilung() {
        var abt = this.model.abteilung;
        abt.organisationId = this.organisationId;

        if (abt.abteilungName != undefined) {
          this.loading = true;
          try {
            await api.createAbteilung(abt);
            this.showToast(`Abteilung "${abt.abteilungName}" erfolgreich erstellt.`)
          } catch (e) {
            console.log(e);
            this.showToast(`Server-Fehler: Abteilung konnte nicht erstellt werden.`)
          }
          this.model.abteilung = {};
          await this.refreshData();
          this.loading = false;
        }
        else{
          this.hintAbteilungCreate = 'red';
        }
        //this.loading = true;
      },
      async deleteAbteilung(abt) {
        if (abt.mitarbeiters.length) {
          alert("In der Abteilung existieren Mitarbeiter, daher kann sie nicht gelöscht werden.");
          return
        } else {
          //this.loading = true;
          try {
            console.log("abt", abt)
            await api.deleteAbteilung(abt.abteilungId);
            await this.refreshData();
            this.showToast(`Abteilung "${abt.abteilungName}" erfolgreich gelöscht.`)
          } catch (e) {
            console.log(e);
            await this.refreshData();
            this.showToast(`Server-Fehler: Abteilung konnte nicht gelöscht werden.`);
          }
          
          //this.loading = false;
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

.custom-file-button input[type=file]{
  width: 150px;
}



#snackbar {
  visibility: hidden; /* Hidden by default. Visible on click */
  min-width: 250px; /* Set a default minimum width */
  margin-left: -125px; /* Divide value of min-width by 2 */
  background-color: #2c3e50; /* Black background color */
  color: #fff; /* White text color */
  text-align: center; /* Centered text */
  border-radius: 6px; /* Rounded borders */
  padding: 16px; /* Padding */
  position: fixed; /* Sit on top of the screen */
  z-index: 1; /* Add a z-index if needed */
  left: 50%; /* Center the snackbar */
  bottom: 30px; /* 30px from the bottom */
}
/* Show the snackbar when clicking on a button (class added with JavaScript) */
#snackbar.show {
  visibility: visible; /* Show the snackbar */
  /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
  However, delay the fade out process for 2.5 seconds */
  -webkit-animation: fadein 0.5s, fadeout 0.5s 1.8s;
  animation: fadein 0.5s, fadeout 0.5s 1.8s;
}

/* Animations to fade the snackbar in and out */
@-webkit-keyframes fadein {
  from {bottom: 0; opacity: 0;}
  to {bottom: 30px; opacity: 1;}
}

@keyframes fadein {
  from {bottom: 0; opacity: 0;}
  to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes fadeout {
  from {bottom: 30px; opacity: 1;}
  to {bottom: 0; opacity: 0;}
}

@keyframes fadeout {
  from {bottom: 30px; opacity: 1;}
  to {bottom: 0; opacity: 0;}
}



</style>