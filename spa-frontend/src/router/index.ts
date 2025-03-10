import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import LogoutView from '../views/LogoutView.vue'
import ProtectedView from '../views/ProtectedView.vue'
import { ClientTokenBasedHttp } from '../ClientTokenBasedHttp'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
    },
    {
      path: '/protected',
      name: 'protected',
      component: ProtectedView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.name === 'login') {
    next()
    return
  }

  if (to.name === 'logout') {
    next()
    return
  }

  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (!accessToken || !refreshToken) {
    next({ name: 'logout' })
    return
  }

  if (ClientTokenBasedHttp.isTokenExpiring(refreshToken)) {
    //melhor verificar se está expirado de fato
    next({ name: 'logout' })
    return
  }

  if (ClientTokenBasedHttp.isTokenExpiring(accessToken)) {
    const http = new ClientTokenBasedHttp({
      baseURL: 'http://localhost:3000',
      accessToken,
      refreshToken,
    })

    try {
      const tokens = await http.doRefreshToken();
      window.localStorage.setItem('accessToken', tokens.access_token);
      window.localStorage.setItem('refreshToken', tokens.refresh_token);
      next();
      return;
    } catch (error) {
      next({ name: 'logout' })
      return;
    }
  }
  next();
})

export default router
