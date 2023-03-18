<template>
    <h2>Usermanagement</h2>
    <LoadingComponent v-if="loading" :loading="this.loading" />
    <ErrorComponent v-if="error" :error="this.error" />
    <div v-if="!error" class="mt-3">
        <form v-if="!loading && users.length" class="needs-validation g-3" novalidate>
            <h5>User hinzufügen:</h5>
            <div class="row">
                <div class="col">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Username</span>
                        <input :style="{ borderColor: hintUsername }" type="text" class="form-control"
                            v-model="model.user.username" placeholder="Name">
                    </div>
                </div>
                <div class="col">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Passwort</span>
                        <input :style="{ borderColor: hintPassword }" type="text" class="form-control"
                            v-model="model.user.password" placeholder="Passwort" required>
                    </div>
                </div>
                <div class="col-3">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Typ</span>
                        <input :style="{ borderColor: hintType }" type="text" class="form-control"
                                v-model="model.user.type" placeholder="Typ" required>
                    </div>
                </div>
                <div class="col-2">
                    <div class="btn-container">
                        <button class="btn btn-outline-success" style="width:100%;" @click.prevent="createUser"
                            type="submit">Create</button>
                    </div>
                </div>
            </div>
        </form>

        <hr class="hr" style="border: 0;
                  height: 3px;
                  background: #095484;
                  background-image: linear-gradient(to right, #ccc, #095484, #ccc);" />

        <form v-if="!loading">
                <div>Users:</div>
                <div v-if="!users.length" class="text-secondary">Keine User vorhanden.</div>
                <li class="row mt-2" v-for="usr in users" :key="usr">
                    <div class="col">
                        <div class="input-group">
                            <span class="input-group-text">Username</span>
                            <input type="text" class="form-control" v-model="usr.username" placeholder="Username">
                        </div>
                    </div>
                    <div class="col">
                        <div class="input-group">
                            <span class="input-group-text">Passwort</span>
                            <input type="password" class="form-control" v-model="usr.password" placeholder="Passwort">
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="input-group">
                            <span class="input-group-text">Typ</span>
                            <input type="text" class="form-control" v-model="usr.type" placeholder="Typ">
                        </div>
                    </div>
                    <div class="col-2">
                        <div class="btn-container">
                            <button class="btn btn-outline-warning" @click.prevent="editUser(usr)"
                                type="submit">Bearbeiten</button>
                            <button class="btn btn-danger" type="delete"
                                @click.prevent="deleteUser(usr)">Löschen</button>
                        </div>
                    </div>
                </li>
            <hr class="hr" />
        </form>
        <!-- create-new-mitarbeiter row -->
    </div>
</template>

<script>

import api from '@/api'
import LoadingComponent from "@/components/LoadingComponent.vue"
import ErrorComponent from "@/components/ErrorComponent.vue"
export default {
    name: "UserView.vue",
    components: {
        LoadingComponent,
        ErrorComponent
    },
    data() {
        return {
            error: undefined,
            loading: false,
            hintUsername: '',
            hintPassword: '',
            hintType: '',
            users: [],
            organisationId: sessionStorage.organisationId,
            model: {
                user: {}
            },
        }
    },
    async created() {
        await this.refreshData();
        console.log("sesh storg");
        console.log(sessionStorage.organisationId)
    },
    methods: {
        async refreshData() {
            this.loading = true;
            this.hintUsername = '';
            this.hintPassword = '';
            this.hintType = '';
            try {
                this.users = await api.getUsers(this.organisationId);
            } catch (e) {
                this.error = e;
                console.log(this.error)
                console.log(e)
            }
            console.log("Users:")
            console.log(this.users);
            this.loading = false;
        },

        async createUser() {
            var usr = this.model.user;
            usr.organisationId = this.organisationId;

            if (usr.username != undefined && usr.password != undefined && usr.type != undefined) {
                this.loading = true;
                try {
                    await api.createUser(usr);
                } catch (e) {
                    console.log(e);
                    alert(`Server-Fehler: User konnte nicht erstellt werden.`);
                }
                this.loading = false;
                this.model.user = {};
                await this.refreshData();
            }
            else {
                if (usr.username == undefined) {
                    this.hintUsername = 'red';
                }
                if (usr.password == undefined) {
                    this.hintPassword = 'red';
                }
                if (usr.type == undefined) {
                    this.hintType = 'red';
                }
            }
        },
        async editUser(usr) {
            console.log("edit usr:");
            console.log(usr)
            try {
                await api.updateUser(usr);
                alert(`User "${usr.username}" erfolgreich überarbeitet.`)
            } catch (e) {
                console.log(e);
                alert(`Server-Fehler: User konnte nicht überarbeitet werden.`)
            }
            await this.refreshData();
        },

        async deleteUser(usr) {
            if (confirm(`Möchten Sie den User "${usr.username}" wirklich löschen?`)) {
                console.log("ja");
                console.log(`delete ma (id=${usr.userId})`)

                await api.deleteUser(usr.userId);
                await this.refreshData();
            }
        },
    }
}
</script>

<style scoped>
ul {
    padding: 0px;
    margin: 0px;
}

.btn-container {
    width: 150px;
    display: flex;
    gap: 10px;
}

.btn {
    flex: 1;
}

.col-2 {
    width: 150px;
}</style>