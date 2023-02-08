<template>
    <h2>Projekte > Neues Projekt</h2>
    <LoadingComponent v-if="loading" loading=loading />
    <form v-if="!loading" class="mt-4 mb-4 d-flex flex-column">       
        <div class="form-floating">
            <input class="form-control" placeholder="Name" v-model="model.projektName">
            <label for="floatingInput">Projektname</label>
        </div>
        <div class="form-floating">
            <textarea class="form-control" v-model="model.projektBeschreibung" placeholder="Projektbeschreibung" id="floatingTextarea2" style="height: 100px"></textarea>
            <label>Projektbeschreibung</label>
        </div>
        <div class ="d-flex">
            <div class="input-group">
                <span class="input-group-text" id="basic-addon1">Projekt-Start</span>
                <input class="form-control" type="date" v-model="model.projektStartDate">
            </div>
            <div class="input-group">
                <span class="input-group-text" id="basic-addon1">Projekt-Ende</span>
                <input class="form-control" type="date" v-model="model.projektEndDate">
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Umfragen</h5>
            </div>
            <div class="card-body">
                <ul v-for="(umfr, index) in umfragen" :key="umfr" class="umfrage mb-3 list-group list-group-flush">
                    <li class="list-group-item"> 
                        <label for="basic-url"><h5>Umfrage {{ index + 1 }}</h5></label>
                        <div class="d-flex">                    
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1">Start</span>
                                <input class="form-control" type="date" v-model="umfr.umfrageStartDate">
                            </div>
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1">Ende</span>
                                <input class="form-control" type="date" v-model="umfr.umfrageEndDate">
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
                <button v-if="umfragen.length" class="btn btn-light" @click.prevent="sortUmfragen">Umfragen sortieren</button>
                
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Teilnehmer</h5>
            </div>
            <div class="card-body">

                <div class="c-row d-flex flex-row">
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
                <div class="input-group mb-2" v-for="ma in mitarbeiter" :key="ma">                    
                    <span class="input-group-text" id="basic-addon1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" v-model="ma.include" data-group="teilnehmer" value="">
                        </div>
                    </span>
                    <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterName }}</span>          
                    <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterEmail }}</span>
                    <span type="text" class="form-control overflow-hidden">{{ ma.mitarbeiterRolle }}</span>               
                </div>                
                    <button class="btn btn-outline-primary" @click.prevent="selectAllTeiln">Alle auswählen</button>                
            </div>
        </div>
        <button class="btn btn-primary" @click.prevent="createProjekt" type="submit">Projekt erstellen</button>  
    </form>
</template>

<script>
    import api from '@/api'
    import LoadingComponent from "@/components/LoadingComponent.vue"
    export default {
        name: "CreateProjektView.vue",
        components: {
            LoadingComponent
        },
        data(){
            return{
                loading: false,
                organisationId: sessionStorage.organisationId,
                mitarbeiter: [],
                model: {},
                umfragen: []
            }
        },
        async created () {
            console.log("sesh storg");
            console.log(sessionStorage.organisationId);
            await this.refreshProjekt();            
        },
        methods: {
            async refreshProjekt() {
                this.loading = true;
                this.mitarbeiter = await api.getMitarbeiterAll(this.organisationId);
                this.loading = false;
            },
            async createProjekt() {
                let projekt = this.model;
                projekt.organisationId = this.organisationId;
                let teilnehmerIds = [];
                this.mitarbeiter.forEach(ma => {
                    if (ma.include) teilnehmerIds.push(ma.mitarbeiterId);                    
                });
                projekt.teilnehmerIds = teilnehmerIds;
                projekt.umfragen = this.umfragen;
                try {
                    this.loading = true;
                    await api.createProjekt(projekt);
                    window.location.href = '/projekte';
                } catch (e) {
                    confirm("Fehler");
                }
                
                this.model= {};
            },
            addUmfrage() {
                this.umfragen.push({umfrageStartDate: "",umfrageEndDate: ""});
            },
            deleteUmfrage(index) {
                this.umfragen.splice(index, 1);
            },
            async selectAllTeiln() {
                this.mitarbeiter.forEach(ma => {
                    ma.include = true;
                })
            },
            sortUmfragen() {
                this.umfragen.sort(this.compareStartDates);
            },
            compareStartDates(a, b) {
                if (!a.umfrageStartDate) return 1
                if (!b.umfrageStartDate) return -1
                if ( a.umfrageStartDate < b.umfrageStartDate ){
                    return -1;
                }
                if ( a.umfrageStartDate > b.umfrageStartDate ){
                    return 1;
                }
                return 0;
            }
        }
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