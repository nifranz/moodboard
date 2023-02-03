<template>
    <h2>Projekte > Neues Projekt</h2>
    <form class="mt-4 mb-4 d-flex flex-column">       
        <div class="form-floating">
            <input class="form-control" placeholder="Name" v-model="model.proj_name">
            <label for="floatingInput">Projektname</label>
        </div>
        <div class="form-floating">
            <textarea class="form-control" v-model="model.proj_descr" placeholder="Projektbeschreibung" id="floatingTextarea2" style="height: 100px"></textarea>
            <label>Projektbeschreibung</label>
        </div>
        <div class ="d-flex">
            <div class="input-group">
                <span class="input-group-text" id="basic-addon1">Projekt-Start</span>
                <input class="form-control" type="date" v-model="model.proj_startDate">
            </div>
            <div class="input-group">
                <span class="input-group-text" id="basic-addon1">Projekt-Ende</span>
                <input class="form-control" type="date" v-model="model.proj_endDate">
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h5 class="card-title">Umfragen</h5>
            </div>
            <div class="card-body">
                <p class="card-text">Umfrage-Liste</p>
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
                    <span type="text" class="form-control overflow-hidden">{{ ma.ma_name }}</span>          
                    <span type="text" class="form-control overflow-hidden">{{ ma.ma_email }}</span>
                    <span type="text" class="form-control overflow-hidden">{{ ma.ma_rolle }}</span>               
                </div>                
                    <a class="btn btn-outline-primary" @click="selectAllTeiln">Alle auswählen</a>                
            </div>
        </div>
        <button class="btn btn-primary" @click.prevent="createProjekt" type="submit">Bestätigen</button>      
    </form>
</template>

<script>
    import api from '@/api'
    export default {
        name: "CreateProjektView.vue",
        data(){
            return{
                loading: false,
                org_id: sessionStorage.org_id,
                mitarbeiter: [],
                model: {}
            }
        },
        async created () {
            console.log("sesh storg");
            console.log(sessionStorage.org_id);
            this.mitarbeiter = await api.getMitarbeiterAll(this.org_id);
            console.log(this.mitarbeiter)
        },
        methods: {  
            async createProjekt() {
                let projekt = this.model;
                console.log(projekt);
                projekt.org_id = this.org_id;
                let teilnehmer = [];
                this.mitarbeiter.forEach(ma => {
                    if (ma.include) teilnehmer.push(ma.ma_id);                    
                });
                console.log(teilnehmer);
                projekt.teilnehmer = teilnehmer;
                console.log(projekt);
                try {
                    await api.createProjekt(projekt);
                    window.location.href = '/projekte';
                } catch (e) {
                    confirm("Fehler");
                }
                
                this.model= {};
                // window.location.href = '/projekte';
            },
            async selectAllTeiln() {
                this.mitarbeiter = await api.getMitarbeiterAll(this.org_id);
                this.mitarbeiter.forEach(ma => {
                    ma.include = true;
                })
            }    
        }
    }
</script>
  
<style>

    .d-flex {
    gap:10px;
    }

    .col-start {
        width: 20px;
    }

    .c-row {
        margin-left: 25px;
    }

</style>