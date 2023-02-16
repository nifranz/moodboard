<template>
    <div class="d-flex justify-content-center" v-if="loading">
        <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
        </div>
    </div>
</template>

<script>

export default {
    name: "LoadingComponent",
    props: ['loading']
}
</script>

<style>

</style>