<script setup lang="ts">
import { ClientTokenBasedHttp } from '@/ClientTokenBasedHttp'
import { ClientCookieHttpOnly } from '@/ClientCookieHttpOnly'
import router from '@/router'

async function handleSubmit(event: Event) {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const http = new ClientCookieHttpOnly({baseURL: 'http://localhost:3000'})
  const tokens = await http.login(email, password);
  
  //guardasse as info do user no local storage

  localStorage.setItem('accessTokenExpiryTime', http.accessTokenExpiryTime+"");
  localStorage.setItem('refreshTokenExpiryTime', http.refreshTokenExpiryTime+"");

  // ### local storage ####
  // const http = new ClientTokenBasedHttp({baseURL: 'http://localhost:3000'})
  // const tokens = await http.login(email, password);
  // console.log(tokens);
  // window.localStorage.setItem('accessToken', tokens.access_token);
  // window.localStorage.setItem('refreshToken', tokens.refresh_token);
  
  //router.push('/protected')
  
}
</script>

<template>
  <main>
    <h1>SPA - Login</h1>
    <form @submit="handleSubmit">
      <div>
        <label for="email">email</label>
        <input type="text" id="email" name="email" required value="admin@user.com" />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required value="admin" />
      </div>
      <button type="submit">Login</button>
    </form>
  </main>
</template>
