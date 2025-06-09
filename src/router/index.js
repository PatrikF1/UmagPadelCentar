import { createRouter, createWebHistory } from 'vue-router'
import RegistrationForm from '../components/RegistrationForm.vue'
import LoginForm from '../components/LoginForm.vue'
import AdminLogin from '../components/AdminLogin.vue'
import AdminPanel from '../components/AdminPanel.vue'
import Dashboard from '../components/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/register',
      name: 'registration',
      component: RegistrationForm
    },
    {
      path: '/login',
      name: 'login',
      component: LoginForm
    },
    {
      path: '/admin-login',
      name: 'adminLogin',
      component: AdminLogin
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanel,
      meta: { requiresAdmin: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      // Redirect root to login
      path: '/',
      redirect: '/login'
    }
  ]
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const userEmail = localStorage.getItem('userEmail')
  const adminToken = localStorage.getItem('adminToken')
  
  if (to.meta.requiresAdmin && !adminToken) {
    next('/admin-login')
  } else if (to.meta.requiresAuth && !userEmail) {
    next('/login')
  } else {
    next()
  }
})

export default router
