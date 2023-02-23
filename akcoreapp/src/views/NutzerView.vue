<template>
  <h2 class="mt-3">Nutzer</h2>
  <LoadingComponent v-if="loading" loading=loading />
  <div  v-if="!loading" class="mt-4 mb-4">
    <!-- <p>Hier können sie ihre Organisation auswählen:</p>
    <form>
      <div class="card p-3 w-50">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Name:</span>
          <select class="form-control" v-model="selectedOrg" aria-label="Default select example">
              <option v-for="org in organisationen" :key="org" v-bind:value="org.organisationId" >{{ org.organisationName }}</option>
          </select>
        </div>
        <button class="btn btn-outline-primary" @click.prevent="setOrg(selectedOrg)" type="submit">Bestätigen</button>
      </div>
    </form> -->
    <iframe src="http://141.89.39.93/kibana/app/dashboards?auth_provider_hint=anonymous.anonymous1#/view/a2d37af0-a22d-11ed-8960-8511422d30b9?embed=true&_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))" height="600" width="800"></iframe>
  </div>
</template>

<script>
  import api from '@/api'
  import LoadingComponent from "@/components/LoadingComponent.vue"
  export default {
    name: "NutzerView.vue",
    components: {
      LoadingComponent
    },
    data(){
        return{
          selectedOrg: sessionStorage.organisationId,
          organisationen: [],
          loading: false,
        }
    },
    async created(){
      await this.refreshOrganisationen();
    },
    methods: {
      async refreshOrganisationen() {
        this.loading = true;
        this.organisationen = await api.getOrganisations();
        this.loading = false;        
      },
      setOrg(organisationId) {
        sessionStorage.setItem("organisationId", organisationId);
        console.log("organisationId set in localStorage to " + sessionStorage.organisationId);
        console.log(document.cookie)
      }
    }
  }
</script>

<style>

</style>