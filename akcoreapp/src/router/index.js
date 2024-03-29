import { createRouter, createWebHistory } from 'vue-router'
import MitarbeiterView from "../views/MitarbeiterView"
import UserView from "../views/UserView"
import ProjekteView from "../views/ProjekteView"
import PageNotFound from "@/views/PageNotFound"
import CreateProjektView from "@/views/CreateProjektView"
import ProjektView from "@/views/ProjektView"
import EditProjektView from "@/views/EditProjektView"
import ProjektDashboardView from "@/views/ProjektDashboardView"
import LoginView from "@/views/LoginView.vue"
import DocumentationView from "@/views/DocumentationView"


const routes = [
  {
    path: '/:patchMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound
  },
  {
    path: '/',
    name: 'home',
    redirect: '/projekte'
  },
  {
    path: '/user',
    name: 'UserView',
    component: UserView
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
    path: '/projekt/new',
    name: 'CreateProjektView',
    component: CreateProjektView
  },
  {
    path: '/projekt/:projektId',
    name: 'ProjektView',
    component: ProjektView,
    props: true
  },
  {
    path: '/projekt/:projektId/edit',
    name: 'EditProjektView',
    component: EditProjektView,
    props: true
  },
  {
    path: '/projekt/:projektId/dashboard',
    name: 'ProjektDashboardView',
    component: ProjektDashboardView,
    props: true
  },
  {
    path: '/login',
    name: 'LoginView.vue',
    component: LoginView,
  },
  {
    path: '/docs',
    name: 'DocumentationView',
    component: DocumentationView,
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
