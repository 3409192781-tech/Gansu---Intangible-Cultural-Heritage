import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/spots', name: 'SpotList', component: () => import('../views/ListPage.vue'), meta: { type: 'spots' } },
  { path: '/spots/:id', name: 'SpotDetail', component: () => import('../views/DetailPage.vue'), meta: { type: 'spots' } },
  { path: '/cultures', name: 'CultureList', component: () => import('../views/ListPage.vue'), meta: { type: 'cultures' } },
  { path: '/cultures/:id', name: 'CultureDetail', component: () => import('../views/DetailPage.vue'), meta: { type: 'cultures' } },
  { path: '/foods', name: 'FoodList', component: () => import('../views/ListPage.vue'), meta: { type: 'foods' } },
  { path: '/foods/:id', name: 'FoodDetail', component: () => import('../views/DetailPage.vue'), meta: { type: 'foods' } },
  { path: '/products', name: 'ProductList', component: () => import('../views/ListPage.vue'), meta: { type: 'products' } },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('../views/ProductDetail.vue') },
  { path: '/guides', name: 'GuideList', component: () => import('../views/ListPage.vue'), meta: { type: 'guides' } },
  { path: '/guides/:id', name: 'GuideDetail', component: () => import('../views/DetailPage.vue'), meta: { type: 'guides' } },
  { path: '/map', name: 'MapPage', component: () => import('../views/MapPage.vue') },
  { path: '/cities', name: 'Cities', component: () => import('../views/CitiesPage.vue') },
  { path: '/cities/:name', name: 'CityDetail', component: () => import('../views/CityDetail.vue') },
  { path: '/search', name: 'Search', component: () => import('../views/SearchPage.vue') },
  { path: '/about', name: 'About', component: () => import('../views/AboutPage.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})
