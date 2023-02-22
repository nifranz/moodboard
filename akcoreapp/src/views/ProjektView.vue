<template>
    <h6>Projekt:</h6>
    <h2>{{ projekt.projektName}}</h2>
    <router-link v-bind:to="`/projekt/${projekt.projektId}/dashboard` " class="btn btn-primary">Dashboard öffnen</router-link>
    <LoadingComponent v-if="loading" loading=loading />
    <form v-if="!loading" class="mt-4 mb-4 d-flex flex-column">       
        <label>Projektbeschreibung</label>
        <div class="card">
            <div class="card-body">
                <div class="card-text"><p>{{ projekt.projektBeschreibung }}</p></div>
            </div>
        </div>
        <div class ="d-flex">
            <div class="input-group">
                <span class="input-group-text">Projekt-Start</span>
                <div class="form-control" >{{projekt.projektStartDate}}</div>
            </div>
            <div class="input-group">
                <span class="input-group-text">Projekt-Ende</span>
                <div class="form-control" >{{projekt.projektEndDate}}</div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Umfragen</h5>
            </div>
            <div class="card-body">
                <ul v-for="(umfr, index) in projekt.umfrages" :key="umfr" class="umfrage mb-3 list-group list-group-flush">
                    <li class="list-group-item"> 
                        <label for="basic-url"><h5>Umfrage {{ index + 1 }}</h5></label>
                        <div class="d-flex">                    
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1">Start</span>
                                <div class="form-control" >{{umfr.umfrageStartDate}}</div>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1">Ende</span>
                                <div class="form-control" >{{umfr.umfrageEndDate}}</div>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1">Fragebogen</span>
                                <select class="form-control">
                                    <option  value="mf">Master-Fragebogen</option>
                                </select>
                            </div>                     
                        </div>
                    </li>                    
                </ul>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Teilnehmer</h5>
            </div>
            <div class="card-body">

                <div class="row d-flex flex-row">
                    <div class="col-start">
                    </div>
                    <div class="col">
                        <label for="basic-url"><h5>Name</h5></label>
                    </div>
                    <div class="col">
                        <label for="basic-url"><h5>E-Mail</h5></label>
                    </div>
                    <div class="col">
                        <label for="basic-url"><h5>Rolle</h5></label>
                    </div>
                </div>
                <div class="input-group mb-2" v-for="teiln in projekt.mitarbeiters" :key="teiln">                    
                    <span type="text" class="form-control overflow-hidden">{{ teiln.mitarbeiterName }}</span>          
                    <span type="text" class="form-control overflow-hidden">{{ teiln.mitarbeiterEmail }}</span>
                    <span type="text" class="form-control overflow-hidden">{{ teiln.projektTeilnahme.mitarbeiterRolle }}</span>               
                </div>                              
            </div>
        </div>
        <div class="d-flex flex-row">
            <router-link :to="'/projekt/' + projekt.projektId + '/edit'" class="btn btn-secondary flex-1">Projekt bearbeiten</router-link>
            <button class="btn btn-outline-danger flex-1" @click.prevent="deleteProjekt" type="submit">Projekt löschen</button>
        </div>
        <br />
            <br />
            <hr class="hr" />
            <h6 class="debug" @click="setDebug">Show Debug Info</h6>
        <div  v-if="debug">

            <div v-for="ma in projekt.mitarbeiters" :key="ma">
                Umfragen-Array von Mitarbeiter {{ ma.mitarbeiterName }}: 
                <ul>
                    <li v-for="umfr in ma.umfrages" :key="umfr"> {{ umfr }} </li>
                </ul>
            </div>
            <div>Projekt-Umfragen: {{ projekt.umfrages }}</div></div>
    </form>
</template>

<script>
    import api from '@/api'
    import LoadingComponent from "@/components/LoadingComponent.vue"
    export default {
        name: "ProjektView.vue",
        props: {
            projektId: String
        },
        components: {
            LoadingComponent
        },
        data(){
            return{
                loading: false,
                organisationId: sessionStorage.organisationId,
                projekt: {},
                debug: false,
            }
        },
        async created () {
            console.log("sesh storg");
            console.log(sessionStorage.organisationId);
            console.log(this.id)
            this.refreshProjekt();
        },
        methods: {
            setDebug() {
                this.debug=!this.debug;
            },
            async refreshProjekt() {
                this.loading = true;
                this.projekt = await api.getProjekt(this.projektId);
                console.log(this.projekt)
                this.loading = false;
            },
            async createProjekt() {
                let projekt = this.model;
                console.log(projekt);
                projekt.organisationId = this.organisationId;
                let teilnehmer = [];
                this.mitarbeiter.forEach(ma => {
                    if (ma.include) teilnehmer.push(ma.mitarbeiterId);                    
                });
                console.log(teilnehmer);
                projekt.teilnehmer = teilnehmer;
                console.log(projekt);
                try {
                    await api.createProjekt(projekt);
                    this.$router.push('/projekte');
                } catch (e) {
                    confirm("Fehler");
                }
                
                this.model= {};
                // window.location.href = '/projekte';
            },
            async deleteProjekt() {
                if (confirm('Sind Sie sicher? Alle Umfragen und die zugehörigen Antworten werden gelöscht. Diese Aktion kann nicht Rückgängig gemacht werden.')) {
                    this.loading = true;
                    await api.deleteProjekt(this.projekt.projektId);
                    this.$router.push('/projekte');
                }
            },
            async selectAllTeiln() {
                this.mitarbeiter.forEach(ma => {
                    ma.include = true;
                })
            }    
        }
    }
</script>
  
<style>
    .debug::hover {
        cursor:pointer;
    }

    .d-flex {
    gap:10px;
    }

    .col-start {
        width: 20px;
    }

</style>