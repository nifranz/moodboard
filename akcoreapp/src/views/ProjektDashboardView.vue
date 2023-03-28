<template>
    <h6>Projekt:</h6>
    <h2>{{ projekt.projektName}}</h2>
    <router-link :to="`/projekt/${projekt.projektId}` " class="btn btn-outline-secondary mb-3">zur Projektübersicht</router-link>
    <button class="btn btn-outline-primary mb-3 mx-3" @click.prevent="reloadIframe">Dashboard neu laden</button>
    <LoadingComponent />
    <div class ="d-flex justify-content-center align-items-center">
    <iframe class="kibana-iframe" v-if="projekt.projektKibanaDashboardId" :src="this.kibanaLink" height="1800" width="1500" nonce="rAnd0m"></iframe>
    </div>
</template>

<script>

    import api from '@/api'
    import LoadingComponent from "@/components/LoadingComponent.vue"
    export default {
        name: "ProjektDashboardView.vue",
        components: {
            LoadingComponent
        },
        props: {
            projektId: String
        },
        data(){
            return{
                projekt: {},
                kibanaLink: "",
            }
        },
        async created(){
            await this.refreshData();
        },
        methods: {
            async refreshData() {
                this.loading = true;
                this.projekt = await api.getProjekt(this.projektId);
                console.log(this.projekt);
                this.kibanaLinkOld = "http://bolarus.wi.uni-potsdam.de/kibana/app/dashboards?auth_provider_hint=anonymous1#/view/a2d37af0-a22d-11ed-8960-8511422d30b9?embed=true&_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15y%2Cto%3Anow))",
                this.kibanaLink = `http://bolarus.wi.uni-potsdam.de/kibana/s/${this.projektId}/app/dashboards?auth_provider_hint=anonymous1#/view/${this.projekt.projektKibanaDashboardId}?embed=true&_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15y%2Cto%3Anow))`
                this.loading = false;        
            },
            reloadIframe() {
                document.getElementsByClassName('kibana-iframe')[0].contentWindow.location.reload();
            }
        }
    }

</script>

<style>

</style>