import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'


/* 
    Bootstrap CSS , JS
*/

import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";

import "./styles.css"; // main css file

createApp(App).use(store).use(router).mount('#app')
