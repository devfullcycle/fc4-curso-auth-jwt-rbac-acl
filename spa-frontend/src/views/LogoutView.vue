<script lang="ts" setup>
import router from '@/router'

localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')

router.push('/login')
</script>

<template>
  <h1>Fazendo logout</h1>
</template>
