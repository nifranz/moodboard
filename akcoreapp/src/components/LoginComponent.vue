<template>
    <h1>Login</h1>
    <div class="d-flex justify-content-center">
        <form class="login-form">
            <div class="card p-3">
                <!-- Email input -->
                <div class="form-outline mb-4">
                    <input type="email" v-model="loginName" class="form-control" />
                    <label class="form-label" >Accountname</label>
                </div>

                <!-- Password input -->
                <div class="form-outline mb-4">
                    <input type="password" class="form-control" />
                    <label class="form-label" >Passwort</label>
                </div>

                <!-- Submit button -->
                <button type="button" class="btn btn-primary btn-block mb-4" @click.prevent="login">Einloggen</button>
                <div class="text-center">
                    <a href="#!">Passwort vergessen?</a>
                </div>               
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'LoginComponent.vue',
        data() {
            return {
                loginName: ""
            }
        },
        login() {
            sessionStorage.setItem("account", true);  
        }
    }
</script>

<style scoped>
.login-form {
    flex:1;
    max-width: 650px;
}

</style>