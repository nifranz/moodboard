<template>
    <LoadingComponent />
    <router-link :to="`/projekt/${projekt.projektId}` " class="btn btn-outline-secondary">zur Projektübersicht</router-link>
    <iframe :src="this.kibanaLink" height="600" width="800" nonce="rAnd0m"></iframe>

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
                this.kibanaLink = `http://bolarus.wi.uni-potsdam.de/kibana/s/${this.projektId}/app/dashboards#/view/${this.projekt.projektKibanaDashboardId}?embed=true&_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))`
                this.loading = false;        
            },
        }
    }

</script>

<style>

</style>