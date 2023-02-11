<template>
    <h2>Projekte > Neues Projekt</h2>
    <LoadingComponent v-if="loading" loading=loading />
    <div class="forms mt-4 mb-4 d-flex flex-column">
        <form v-if="!loading" class="d-flex flex-column">       
            <div class="form-floating">
                <input class="form-control" id="req" placeholder="Name" v-model="form.projektName" required>
                <label for="floatingInput">Projektname</label>
            </div>
            <div class="form-floating">
                <textarea class="form-control" required v-model="form.projektBeschreibung" placeholder="Projektbeschreibung" id="floatingTextarea2" style="height: 100px"></textarea>
                <label>Projektbeschreibung</label>
            </div>
            <div class ="d-flex">
                <div class="input-group">
                    <span class="input-group-text" id="basic-addon1">Projekt-Start</span>
                    <input class="form-control" :class="[validated.form.projektStartDate ? '' : 'is-invalid']" type="date" v-model="form.projektStartDate">
                </div>
                <div class="input-group">
                    <span class="input-group-text" id="basic-addon1">Projekt-Ende</span>
                    <input class="form-control" :class="[validated.form.projektEndDate ? '' : 'is-invalid']" type="date" v-model="form.projektEndDate">
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Umfragen</h5>
                </div>
                <div class="card-body">
                    <ul v-for="(umfr, index) in form.umfragen" :key="umfr" class="umfrage mb-3 list-group list-group-flush">
                        <li class="list-group-item"> 
                            <label for="basic-url"><h5>Umfrage {{ index + 1 }}</h5></label>
                            <div class="d-flex">                    
                                <div class="input-group">
                                    <span class="input-group-text" id="basic-addon1">Start</span>
                                    <input class="form-control" :class="[umfr.validated ? '' : 'is-invalid']" type="date" v-model="umfr.umfrageStartDate">
                                </div>
                                <div class="input-group">
                                    <span class="input-group-text" id="basic-addon1">Ende</span>
                                    <input class="form-control" :class="[umfr.validated ? '' : 'is-invalid']" type="date" v-model="umfr.umfrageEndDate">
                                </div>
                                <div class="input-group">
                                    <span class="input-group-text" id="basic-addon1">Fragebogen</span>
                                    <select class="form-control">
                                        <option  value="mf">Master-Fragebogen</option>
                                    </select>
                                </div>
                                <button class="btn btn-outline-danger" @click.prevent="deleteUmfrage(index)">Löschen</button>                        
                            </div>
                        </li>                    
                    </ul>
                    <button class="btn btn-outline-primary mr-1" @click.prevent="addUmfrage">Umfrage hinzufügen</button>
                    <button v-if="form.umfragen.length" class="btn btn-light" @click.prevent="sortUmfragen">Umfragen sortieren</button>                    
                </div>
            </div>
        </form>
        <form novalidate @onChange="validate">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Teilnehmer</h5>
                </div>
                <div class="card-body">
                    <div v-for="abt in abteilungen" :key="abt">
                        <label><h5>Abteilung {{ abt.abteilungName }}</h5></label>
                        <div v-for="ma in mitarbeiter" :key="ma">
                            <div class="input-group mb-2" v-if="ma.abteilungId == abt.abteilungId">                 
                                <span class="input-group-text" id="basic-addon1">
                                    <div class="form-check">
                                        <input class="form-check-input" required type="checkbox" v-model="ma.include" data-group="teilnehmer" value="">
                                    </div>
                                </span>
                                <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterName }}</span>          
                                <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterEmail }}</span>
                                <select class="form-control" v-bind:class="{'is-invalid': ma.validatedAsFalsy===true, 'is-valid': ma.validatedAsFalsy===false} " v-model="ma.mitarbeiterRolle" novalidate>
                                    <option value=undefined disabled>Bitte Rolle auswählen</option>
                                    <option value="Key-User">Key-User</option>
                                    <option value="User">User</option>
                                    <option value="Change-Manager">Change-Manager</option>
                                </select>
                            </div>
                        </div>
                    </div>            
                    <button class="btn btn-outline-primary" @click.prevent="selectAllTeiln">Alle auswählen</button>                
                </div>
            </div>
        </form>
        <button class="btn btn-primary" @click.prevent="submitForm" type="submit">Projekt erstellen</button>  
    </div>
</template>

<script>
    // import { reactive, computed } from 'vue'
    // import useValidate from '@vuelidate/core'
    // import { required } from '@vuelidate/validators'
    import api from '@/api'
    import LoadingComponent from "@/components/LoadingComponent.vue"
    export default {
        name: "CreateProjektView.vue",
        components: {
            LoadingComponent
        },
        data(){
            return{
                // v$: useValidate(),
                loading: false,
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
                    mitarbeiter: true,
                    form: {
                        projektName: true,
                        projektBeschreibung: true,
                        projektStartDate: true,
                        projektEndDate: true,
                        umfragen: true,
                    }
                },
                validatedOnce: false,
                validatedProto: {
                    all: true,
                    mitarbeiter: true,
                    form: {
                        projektName: true,
                        projektBeschreibung: true,
                        projektStartDate: true,
                        projektEndDate: true,
                        umfragen: true,
                    }
                }
            }
        },
        async created () {
            await this.refreshData();
        },
        methods: {
            async refreshData() {
                this.loading = true;
                this.mitarbeiter = await api.getMitarbeiterAll(this.organisationId);
                this.abteilungen = await api.getAbteilungen(this.organisationId);
                this.loading = false;
            },
            async submitForm() {
                console.log("HLLO=")
                // this.v$.$validate() // checks all inputs
                // if (!this.v$.$error) {
                //     // if ANY fail validation
                //     alert('Form successfully submitted.')
                // } else {
                //     alert('Form failed validation')
                // }
                // // await this.createProjekt();
                let form = document.querySelectorAll("form")[0];
                console.log(form)
                let formIsValid = form.checkValidity();
                form.classList.add('was-validated')
                this.validatedOnce=true;
                this.validate();
                if (!this.validated.all || !formIsValid) alert("hey, you missed something!")
            },
            async createProjekt() {
                // Adding all checked mitarbeiter to form data object
                for (let ma of this.mitarbeiter) {
                    if (ma.include) this.form.teilnehmer.push( { mitarbeiterId: ma.mitarbeiterId, mitarbeiterRolle: ma.mitarbeiterRolle } ); 
                }
                try {
                    // creating projekt in the backend
                    this.loading = true;
                    await api.createProjekt(this.form);
                    this.form= {};
                    window.location.href = '/projekte';
                } catch (e) {
                    console.error(e);
                    confirm("Fehler - Eingaben überprüfen");
                    this.loading = false;
                }
            },
            addUmfrage() {
                this.form.umfragen.push({umfrageStartDate: "",umfrageEndDate: "", validated: true});
            },
            deleteUmfrage(index) {
                this.form.umfragen.splice(index, 1);
            },
            async selectAllTeiln() {
                this.mitarbeiter.forEach(ma => {
                    ma.include = true;
                });
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
                if (!this.validatedOnce) return
                this.validated = this.validatedProto;
                // form: {
                //     organisationId: sessionStorage.organisationId,
                //     projektName: '',
                //     projektBeschreibung: '',
                //     projektStartDate: '',
                //     projektEndDate: '',
                //     umfragen: [],
                //     teilnehmer: [],
                // },
                // let d = new Date;
                // let month = d.getMonth() + 1;
                // if (month < 10) {
                //     month = "0" + month;
                // } 
                // let today = '' + `${d.getFullYear()}-${month}-${d.getDate()}`

                // if (!this.form.projektName) {
                //     this.validated.all = false;
                //     this.validated.form.projektName = false;
                // } else {
                //     this.validated.form.projektName = true;
                // }

                // if (!this.form.projektBeschreibung) {
                //     this.validated.all = false;
                //     this.validated.form.projektBeschreibung = false;
                // } else {
                //     this.validated.form.projektBeschreibung = true;
                // }

                // if (!this.form.projektEndDate) {
                //     this.validated.all = false;
                //     this.validated.form.projektEndDate = false;
                // } else {
                //     this.validated.form.projektEndDate = true;
                // }

                // if (!this.form.projektStartDate) {
                //     this.validated.all = false;
                //     this.validated.form.projektStartDate = false;
                // } else {
                //     this.validated.form.projektStartDate = true;
                // }

                // if (this.form.umfragen) {
                //     for (let umfr of this.form.umfragen) {
                //         if ((umfr.umfrageStartDate && umfr.umfrageEndDate) && (umfr.umfrageStartDate >= today && umfr.umfrageEndDate >= umfr.umfrageStartDate)) {
                //             umfr.validated = true;
                //         } else {
                //             this.validated.all = false;
                //             umfr.validated = false;
                //         }
                //     }
                // } else {
                //     this.validated.all = false;
                //     this.validated.form.umfragen = false;
                // }
                this.validated.mitarbeiter = false; // set this to false preamtively; will become true if at least one mitarbeiter is included
                for (let ma of this.mitarbeiter) {
                    if (ma.include) this.validated.mitarbeiter = true; // if at least one ma is included, set this.validated.mitarbeiter to true
                    if (ma.include && !ma.mitarbeiterRolle) {
                        this.validated.all = false;
                        ma.validatedAsFalsy = true;
                    } else if (ma.include && ma.mitarbeiterRolle) {
                        ma.validatedAsFalsy = false;
                    }
                }
                if (this.validated.mitarbeiter) this.validated.all = false;
            },
        },
        // setup() {
        //     const state = reactive({
        //         email: '',
        //         password: {
        //             password: '',
        //             confirm: '',
        //         },
        //     })
        //     const rules = computed(() => {
        //         mitarbeiter: { required },             
        //         form: {
        //             projektName: { required },
        //             projektBeschreibung: '',
        //             projektStartDate: { required },
        //             projektEndDate: { required },
        //             umfragen: { required },
        //         },
        //     })
        // },
        // validations() {
        //     return {
        //         mitarbeiter: [],             
        //         form: {
        //             projektName: { required },
        //             projektBeschreibung: '',
        //             projektStartDate: { required },
        //             projektEndDate: { required },
        //             umfragen: { required },
        //         },
        //     }
        // }
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