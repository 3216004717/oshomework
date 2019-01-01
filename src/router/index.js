import Vue from 'vue'
import Router from 'vue-router'
import Main from '../components/Main'
import Main1 from '../components/Main1'
import Main2 from '../components/Main2'
import Main3 from '../components/Main3'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/process',
      name: 'Main1',
      component: Main1
    },
    {
      path: '/homework',
      name: 'Main2',
      component: Main2
    },
    {
      path: '/storage',
      name: 'Main3',
      component: Main3
    }
  ]
})
