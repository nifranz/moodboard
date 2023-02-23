<template>
    <div>
        <h1>Fehler!</h1>
        <p>{{ error }}</p>
    </div>
</template>

<script>

export default {
    name: "ErrorComponent",
    props: ['error'],
    created() {
        console.log(this.error);
    },    
    methods: {
    }
}
</script>

<style>

</style>