<template>
    <h6>Projekt bearbeiten:</h6>
    <h2>{{ form.projektName}}</h2>
    <LoadingComponent v-if="loading" loading=loading />
    <div v-if="creating" ><h5>Das Projekt wird aktualisiert...</h5></div>
    <form v-if="!loading" class="mt-4 mb-4 d-flex flex-column" @change="validate">       
        <div class="form-floating">
            <input class="form-control" :class="[validated.projektName ? '' : 'is-invalid']" placeholder="Name" v-model="form.projektName">
            <label for="floatingInput">Projektname</label>
        </div>
        <div class="form-floating">
            <textarea class="form-control" :class="[validated.projektBeschreibung ? '' : 'is-invalid']" v-model="form.projektBeschreibung" placeholder="Projektbeschreibung" id="floatingTextarea2" style="height: 100px"></textarea>
            <label>Projektbeschreibung</label>
        </div>
        <div class ="d-flex">
            <div class="input-group">
                <span class="input-group-text">Projekt-Start</span>
                <input class="form-control" :class="[validated.projektStartDate ? '' : 'is-invalid']" type="date" v-model="form.projektStartDate">
            </div>
            <div class="input-group">
                <span class="input-group-text" >Projekt-Ende</span>
                <input class="form-control" :class="[validated.projektEndDate ? '' : 'is-invalid']" type="date" v-model="form.projektEndDate">
            </div>
        </div>
        <button hidden @click.prevent></button>
        <div class="card" :class="{[!this.form.umfragen.length ? 'border-danger' : '' ]: this.validatedOnce}"> <!-- if this.validatedOnce, execute ternary operator [!this.form.umfragen.length ? 'border-danger' : '' ] -->
            <div class="card-header">
                <h5 class="card-title">Umfragen</h5>
            </div>
            <div class="card-body">
                <ul v-for="(umfr, index) in form.umfragen" :key="umfr" class="umfrage mb-3 list-group list-group-flush">
                    <li class="list-group-item"> 
                        <label><h5 :class="[umfr.readOnly ? '' : 'text-success']">Umfrage {{ index + 1 }}</h5></label>
                        <div class="d-flex">                    
                            <div class="input-group">
                                <span class="input-group-text">Start</span>
                                <input v-if="!umfr.readOnly" class="form-control" :class="[umfr.validated.umfrageStartDate ? '' : 'is-invalid']"  type="date" v-model="umfr.umfrageStartDate">
                                <div v-if="umfr.readOnly" class="form-control" type="date">{{umfr.umfrageStartDate}}</div>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text">Ende</span>
                                <input v-if="!umfr.readOnly" class="form-control" :class="[umfr.validated.umfrageEndDate ? '' : 'is-invalid']"  type="date" v-model="umfr.umfrageEndDate">
                                <div v-if="umfr.readOnly" class="form-control" type="date">{{umfr.umfrageEndDate}}</div>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text">Fragebogen</span>
                                <select v-if="!umfr.readOnly" class="form-control">
                                    <option value="mf">Master-Fragebogen</option>
                                </select>
                                <div v-if="umfr.readOnly" class="form-control">Master-Fragebogen</div>
                            </div>
                            <button v-if="!umfr.readOnly" class="btn btn-outline-danger" @click.prevent="deleteUmfrage(index)">Löschen</button>                        
                        </div>
                        <div v-if="(!umfr.validated.umfrageStartDate || !umfr.validated.umfrageEndDate) && this.validatedOnce">
                            <div class="text-danger mt-3">Bitte geben Sie eine gültige Zeitperiode für diese Umfrage an. Achten Sie darauf, dass diese nicht in der Vergangenheit liegt.</div>
                        </div>  
                    </li>                    
                </ul>
                
                <button class="btn btn-outline-primary mr-1" @click.prevent="addUmfrage()">Umfrage hinzufügen</button>
                <button v-if="form.umfragen.length" class="btn btn-light" @click.prevent="sortUmfragen">Umfragen sortieren</button>                    
                <div v-if="!this.form.umfragen.length">
                    <div v-if="validatedOnce" class="inval text-danger mt-3">Bitte fügen Sie mindestens eine Umfrage hinzu.</div>
                </div>
            </div>
        </div>
        <div class="card" :class="[validated.atLeastOneMitarbeiter ? '' : 'border-danger']">
            <div class="card-header">
                <h5 class="card-title">Teilnehmer</h5>
            </div>
            <div class="card-body">
                <div v-for="abt in abteilungen" :key="abt">
                    <label><h5>Abteilung {{ abt.abteilungName }}</h5></label>
                    <div v-for="ma in mitarbeiter" :key="ma">
                        <div class="input-group mb-2" v-if="ma.abteilungId == abt.abteilungId">                 
                            <span class="input-group-text">
                                <div class="form-check">
                                    <input :disabled="ma.readOnly" class="form-check-input" required type="checkbox" v-model="ma.include" data-group="teilnehmer" value="">
                                </div>
                            </span>
                            <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterName }}</span>          
                            <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterEmail }}</span>
                            <select class="form-control" :disabled="ma.readOnly" v-bind:class="{'is-invalid': validatedOnce && ma.include && ma.validatedAsFalsy===true, '': validatedOnce && ma.include && ma.validatedAsFalsy===false} " v-model="ma.mitarbeiterRolle" novalidate>
                                <option value=undefined disabled>Bitte Rolle auswählen</option>
                                <option value="Key-User">Key-User</option>
                                <option value="User">User</option>
                                <option value="Change-Manager">Change-Manager</option>
                            </select>
                        </div>
                    </div>
                </div>            
                <button class="btn btn-outline-primary" @click.prevent="selectAllTeiln">Alle auswählen</button>
                <div v-if="!this.validated.atLeastOneMitarbeiter">
                    <div v-if="validatedOnce" class="text-danger mt-3">Bitte fügen Sie mindestens einen Mitarbeiter hinzu.</div>
                </div>           
            </div>
        </div>
        <div v-if="validatedOnce">
            <label v-if="validated.all" class="is-valid form-control text-success">Alle Eingaben scheinen korrekt zu sein.</label>
            <label v-if="!validated.all" class="is-invalid form-control text-danger">Bitte überprüfen Sie ihre Eingaben.</label>
        </div>
        <div class="d-flex flex-row">
            <button class="btn btn-primary flex-1" @click.prevent="submitForm" type="submit">Projekt aktualisieren</button>
            <button class="btn btn-outline-secondary flex-1" @click.prevent="cancel" type="submit">Abbrechen</button>
        </div>

    </form>
</template>

<script>
    // import { reactive, computed } from 'vue'
    // import useValidate from '@vuelidate/core'
    // import { required } from '@vuelidate/validators'
    import api from '@/api'
    import LoadingComponent from "@/components/LoadingComponent.vue"
    export default {
        name: "EditProjektView.vue",
        props: {
            projektId: String
        },
        components: {
            LoadingComponent
        },
        data(){
            return{
                // v$: useValidate(),
                loading: false,
                creating: false,
                projekt: {},
                organisationId: sessionStorage.organisationId,                
                mitarbeiter: [],
                abteilungen: [],             
                form: {
                    organisationId: sessionStorage.organisationId,
                    projektName: '',
                    projektBeschreibung: '',
                    projektStartDate: '',
                    projektEndDate: '',
                    umfragen: [],
                    teilnehmer: [],
                },
                validated: {
                    all: true,
                    projektName: true,
                    projektBeschreibung: true,
                    projektStartDate: true,
                    projektEndDate: true,
                    umfragen: true,
                    mitarbeiter: true,
                    atLeastOneMitarbeiter: true,
                },
                validatedOnce: false,
            }
        },
        async created () {
            await this.refreshData();
        },
        methods: {
            cancel() {
                console.log(this.projekt)
                if (confirm("Möchten Sie den Vorgang abbrechen und zur Projektübersicht zurückkehren?")) {
                    
                    window.location.href = `/projekt/${this.projekt.projektId}`
                }
            },
            async refreshData() {
                this.loading = true;
                this.projekt = await api.getProjekt(this.projektId)
                this.mitarbeiter = await api.getMitarbeiterAll(this.organisationId);
                this.abteilungen = await api.getAbteilungen(this.organisationId);
                console.log(this.projekt)

                // updating this.form to represent the data already existent in the database
                this.form.projektName = this.projekt.projektName;
                this.form.projektBeschreibung = this.projekt.projektBeschreibung;
                this.form.projektStartDate = this.projekt.projektStartDate;
                this.form.projektEndDate = this.projekt.projektEndDate;
                
                for (let umfr of this.projekt.umfrages) {
                    this.addUmfrage(umfr.umfrageStartDate, umfr.umfrageEndDate, true)
                }
                // adding attributes to this.mitarbeiter to account for the data already existing in the project
                for (let ma of this.mitarbeiter) {
                    console.log(ma);
                    for (let teiln of this.projekt.mitarbeiters) {
                        // loop through all teilnehmer of the project
                        if (teiln.mitarbeiterId == ma.mitarbeiterId) {
                            // if a teilnehmer has been found that matches the mitarbeiterId of ma, add the properties
                            ma.include = true; 
                            ma.readOnly = true; 
                            ma.mitarbeiterRolle = teiln.projektTeilnahme.mitarbeiterRolle;
                        }
                        console.log(ma);
                    }
                }
                this.loading = false;
            },
            async submitForm() {
                this.validatedOnce=true;
                this.validate();
                console.log(this.validated)
                if (this.validated.all) this.updateProjekt();
            },
            async updateProjekt() {
                // Adding all checked mitarbeiter to form data object
                for (let ma of this.mitarbeiter) {
                    if (ma.include) this.form.teilnehmer.push( { mitarbeiterId: ma.mitarbeiterId, mitarbeiterRolle: ma.mitarbeiterRolle, new: !ma.readOnly } ); 
                }
                try {
                    // creating projekt in the backend
                    this.loading = true;
                    this.creating = true;
                    var projektURI = await api.updateProjekt(this.form, this.projekt.projektId);
                    console.log(projektURI);
                    this.form= {};
                    window.location.href = projektURI;
                    this.loading = false;
                } catch (e) {
                    console.error(e);
                    confirm("Fehler - Eingaben überprüfen");
                    this.creating = false;
                    this.loading = false;
                }
            },
            addUmfrage(umfrageStartDate = '', umfrageEndDate = '', readOnly = false) {
                // this function serves two purposes: it adds umfragen that are already existant in the database by being called for every survey with the survey data as the arguments; 
                // it is also called with no arguments given when a new survey is added via the interface
                this.form.umfragen.push({umfrageStartDate: umfrageStartDate, umfrageEndDate: umfrageEndDate, readOnly: readOnly, validated: {umfrageStartDate: true, umfrageEndDate: true}});
                this.validate();
            },
            deleteUmfrage(index) {
                this.form.umfragen.splice(index, 1);
                this.validate();
            },
            async selectAllTeiln() {
                this.mitarbeiter.forEach(ma => {
                    ma.include = true;
                });
                this.validate();
            },
            sortUmfragen() {
                this.form.umfragen.sort(this.compareStartDates);
            },
            compareStartDates(a, b) {
                // a simple function providing a comparator for the start dates of a umfrage
                if (!a.umfrageStartDate) return 1
                if (!b.umfrageStartDate) return -1
                if ( a.umfrageStartDate < b.umfrageStartDate ){
                    return -1;
                }
                if ( a.umfrageStartDate > b.umfrageStartDate ){
                    return 1;
                }
                if ( a.umfrageEndDate < b.umfrageEndDate ){
                    return -1;
                }
                if ( a.umfrageEndDate > b.umfrageEndDate ){
                    return 1;
                }
                return 0;
            },
            validate() {
                console.log("validating; validated once:", this.validatedOnce);
                console.log(this.validated)
                console.log(this.form.umfragen)

                if (!this.validatedOnce) return
                this.validated = {
                    all: true,
                    projektName: true,
                    projektBeschreibung: true,
                    projektStartDate: true,
                    projektEndDate: true,
                    umfragen: true,
                    mitarbeiter: true,
                    atLeastOneMitarbeiter: true,
                };

                let today = this.getToday();

                if (!this.form.projektName) {
                    this.validated.all = false;
                    this.validated.projektName = false;
                } else {
                    this.validated.projektName = true;
                }

                if (!this.form.projektBeschreibung) {
                    this.validated.all = false;
                    this.validated.projektBeschreibung = false;
                } else {
                    this.validated.projektBeschreibung = true;
                }

                if (!this.form.projektEndDate) {
                    this.validated.all = false;
                    this.validated.projektEndDate = false;
                } else {
                    this.validated.projektEndDate = true;
                }

                if (!this.form.projektStartDate) {
                    this.validated.all = false;
                    this.validated.projektStartDate = false;
                } else {
                    this.validated.projektStartDate = true;
                }

                if (this.form.umfragen.length) {
                    this.validated.umfragen = true;
                    for (let umfr of this.form.umfragen) {
                        if (!umfr.readOnly) { // only validate if the umfrage is new
                            // validate start date
                            if (umfr.umfrageStartDate) {
                                if (umfr.umfrageStartDate >= today) {
                                    umfr.validated.umfrageStartDate = true;
                                } else {
                                    this.validated.all = false;
                                    this.validated.umfragen = false;
                                    umfr.validated.umfrageStartDate = false;
                                }
                            } else {
                                    this.validated.all = false;
                                    this.validated.umfragen = false;
                                    umfr.validated.umfrageStartDate = false;
                            }

                            // validate end date
                            if (umfr.umfrageEndDate) {
                                if (umfr.umfrageEndDate >= umfr.umfrageStartDate && umfr.umfrageEndDate >= today) {
                                    umfr.validated.umfrageEndDate = true;
                                } else {
                                    this.validated.all = false;
                                    this.validated.umfragen = false;
                                    umfr.validated.umfrageEndDate = false;
                                }
                            } else {
                                    this.validated.all = false;
                                    this.validated.umfragen = false;
                                    umfr.validated.umfrageEndDate = false;
                            }
                        }                        

                    }
                } else {
                    this.validated.all = false;
                    this.validated.umfragen = false;
                }
                
                this.validated.atLeastOneMitarbeiter = false; // set this to false preamtively; will become true if at least one mitarbeiter is included
                this.validated.mitarbeiter = false;
                for (let ma of this.mitarbeiter) {
                    if (ma.include) this.validated.atLeastOneMitarbeiter = true; this.validated.mitarbeiter = true; // if at least one ma is included, set this.validated.mitarbeiter to true
                    if (ma.include && !ma.mitarbeiterRolle) {
                        this.validated.mitarbeiter = false;
                        this.validated.all = false;
                        ma.validatedAsFalsy = true;
                    } else if (ma.include && ma.mitarbeiterRolle) {
                        ma.validatedAsFalsy = false;
                    }
                }
                if (!this.validated.atLeastOneMitarbeiter) this.validated.all = false;
            },
            getToday() {
                let d = new Date;
                let month = d.getMonth() + 1;
                if (month < 10) {
                    month = "0" + month;
                } 
                return '' + `${d.getFullYear()}-${month}-${d.getDate()}`
            }
        },
    }
</script>
  
<style scoped>

    .d-flex {
    gap:10px;
    }

    .col-start {
        width: 20px;
    }

    .c-row {
        margin-left: 25px;
    }
    .mr-1 {
        margin-right: 10px;
    }

</style>