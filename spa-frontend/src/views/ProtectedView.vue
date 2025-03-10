<script lang="ts" setup>
import { ClientTokenBasedHttp } from '@/ClientTokenBasedHttp';
import { ref } from 'vue';
  const accessToken = localStorage.getItem('accessToken')!
  const refreshToken = localStorage.getItem('refreshToken')!
  const http = new ClientTokenBasedHttp({
      baseURL: 'http://localhost:3000',
      accessToken,
      refreshToken,
    })
  const user = ref({});  
  http.get('/protected').then((data) => user.value = data)
</script>

<template>
  <h1>SPA - Protected</h1>
  <pre>{{ user }}</pre>
</template>
