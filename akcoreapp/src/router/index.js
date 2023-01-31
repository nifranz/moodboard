import { createRouter, createWebHistory } from 'vue-router'
import TeilnehmerView from "../views/TeilnehmerView"
import NutzerView from "../views/NutzerView"
import ProjekteView from "../views/ProjekteView"
// import PageNotFound from "@/views/PageNotFound"
import PageNotFound from "../views/PageNotFound"

const routes = [
  {
    path: '/',
    name: 'home',
    component: PageNotFound
  },
  {
    path: '/nutzer',
    name: 'NutzerView',
    component: NutzerView
  },
  {
    path: '/teilnehmer',
    name: 'TeilnehmerView',
    component: TeilnehmerView
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
