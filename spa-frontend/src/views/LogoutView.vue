<script lang="ts" setup>
import router from '@/router'
import { ClientCookieHttpOnly } from '@/ClientCookieHttpOnly'

const http = new ClientCookieHttpOnly({
  baseURL: 'http://localhost:3000'
});

http.logout().then(() => {
  localStorage.removeItem('accessTokenExpiryTime')
  localStorage.removeItem('refreshTokenExpiryTime')
  router.push('/login')
})

// ### local storage ###
// localStorage.removeItem('accessToken')
// localStorage.removeItem('refreshToken')
// router.push('/login')
</script>

<template>
  <h1>Fazendo logout</h1>
</template>
