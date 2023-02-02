<template>
  <h2>Organisation</h2>
  <div class="mt-4 mb-4">
    <p>Hier können sie ihre Organisation auswählen:</p>
    <form>
      <div class="card p-3 w-50">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">Name:</span>
          <select class="form-control" v-model="selectedOrg" aria-label="Default select example">
              <option v-for="org in organisationen" :key="org" v-bind:value="org.org_id" >{{ org.org_name }}</option>
          </select>
        </div>
        <button class="btn btn-outline-primary" @click.prevent="setOrg(selectedOrg)" type="submit">Bestätigen</button>
      </div>
    </form>
    <h2 class="mt-3">Nutzer</h2>
  </div>
</template>

<script>
  export default {
    name: "NutzerView.vue",
    data(){
        return{
          selectedOrg: sessionStorage.org_id,
          organisationen: [{org_id: 1, org_name: "LSWI-Lehrstuhl"},{org_id: 2, org_name: "BWL-Lehrstuhl"}]
        }
    },
    async created(){

    },
    methods: {
      setOrg(org_id) {
        sessionStorage.setItem("org_id", org_id);
        console.log("org_id set in localStorage to " + sessionStorage.org_id);
      }
    }
  }
</script>

<style>

</style>