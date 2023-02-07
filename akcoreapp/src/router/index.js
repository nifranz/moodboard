import { createRouter, createWebHistory } from 'vue-router'
import MitarbeiterView from "../views/MitarbeiterView"
import NutzerView from "../views/NutzerView"
import ProjekteView from "../views/ProjekteView"
import PageNotFound from "@/views/PageNotFound"
import CreateProjektView from "@/views/CreateProjektView"
import ProjektView from "@/views/ProjektView"


const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/nutzer'
  },
  {
    path: '/nutzer',
    name: 'NutzerView',
    component: NutzerView
  },
  {
    path: '/mitarbeiter',
    name: 'MitarbeiterView',
    component: MitarbeiterView
  },
  {
    path: '/projekte',
    name: 'ProjekteView',
    component: ProjekteView
  },
  {
    path: '/:patchMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound
  },
  {
    path: '/projekte/createNew',
    name: 'CreateProjektView',
    component: CreateProjektView
  },
  {
    path: '/projekte/:projektId',
    name: 'ProjektView',
    component: ProjektView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
