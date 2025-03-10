<script setup lang="ts">
import router from '@/router'

async function handleSubmit(event: Event) {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  
  router.push('/protected')
  
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
