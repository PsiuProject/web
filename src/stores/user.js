import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const email = ref('')
  const password = ref('')
  const isLoggedIn = ref(false)
  const showGreeting = ref(false)

  const userEmail = computed(() => email.value)

  function login(newEmail, newPassword) {
    email.value = newEmail
    password.value = newPassword
    isLoggedIn.value = true
    showGreeting.value = true
  }

  function logout() {
    email.value = ''
    password.value = ''
    isLoggedIn.value = false
    showGreeting.value = false
  }

  function dismissGreeting() {
    showGreeting.value = false
  }

  return {
    email,
    password,
    isLoggedIn,
    showGreeting,
    userEmail,
    login,
    logout,
    dismissGreeting
  }
})
