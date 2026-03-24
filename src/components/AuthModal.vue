<template>
  <div class="auth-wrapper">
    <button class="auth-trigger" @click="toggleDropdown">
      <div v-if="userStore.isLoggedIn" class="avatar">
        {{ userStore.email.charAt(0).toUpperCase() }}
      </div>
      <div v-else class="avatar-placeholder">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    </button>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="showDropdown" class="auth-dropdown" @click.stop>
          <template v-if="!userStore.isLoggedIn">
            <div class="dropdown-header">
              <span class="dropdown-title">Sign In</span>
            </div>
            <form @submit.prevent="handleLogin" class="auth-form">
              <div class="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  v-model="formEmail" 
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div class="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  v-model="formPassword" 
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" class="submit-btn">
                Create Account
              </button>
            </form>
          </template>
          <template v-else>
            <div class="dropdown-header logged-in">
              <div class="avatar-large">
                {{ userStore.email.charAt(0).toUpperCase() }}
              </div>
              <span class="user-email">{{ userStore.email }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">
              Sign Out
            </button>
          </template>
        </div>
      </Transition>

      <Transition name="greeting">
        <div v-if="userStore.showGreeting" class="greeting-toast" @click="userStore.dismissGreeting">
          <div class="greeting-content">
            <span class="greeting-icon">✦</span>
            <span class="greeting-text">Welcome aboard, {{ userStore.email.split('@')[0] }}!</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const showDropdown = ref(false)
const formEmail = ref('')
const formPassword = ref('')

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleLogin() {
  if (formEmail.value && formPassword.value) {
    userStore.login(formEmail.value, formPassword.value)
    formEmail.value = ''
    formPassword.value = ''
    showDropdown.value = false
  }
}

function handleLogout() {
  userStore.logout()
  showDropdown.value = false
}

function handleClickOutside(e) {
  if (showDropdown.value && !e.target.closest('.auth-dropdown') && !e.target.closest('.auth-trigger')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  align-items: center;
}

.auth-trigger {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.52vw;
}

.avatar,
.avatar-placeholder {
  width: 2.08vw;
  height: 2.08vw;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.3s;
}

.avatar {
  background: var(--terracotta);
  color: var(--ink);
}

.avatar-placeholder {
  background: var(--ink);
  border: 0.05vw solid var(--moss-light);
  color: var(--paper);
}

.auth-trigger:hover .avatar,
.auth-trigger:hover .avatar-placeholder {
  border-color: var(--terracotta);
  transform: scale(1.05);
}

.auth-dropdown {
  position: fixed;
  top: 5.56vh;
  right: 2.08vw;
  width: 18.23vw;
  background: var(--ink);
  border: 0.05vw solid var(--moss);
  z-index: 2000;
  overflow: hidden;
}

.dropdown-header {
  padding: 1.04vw 1.30vw;
  border-bottom: 0.05vw solid rgba(255,255,255,0.1);
}

.dropdown-header.logged-in {
  display: flex;
  align-items: center;
  gap: 0.78vw;
  padding: 1.30vw;
}

.dropdown-title {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1vw;
  color: var(--moss-light);
}

.avatar-large {
  width: 2.60vw;
  height: 2.60vw;
  border-radius: 50%;
  background: var(--terracotta);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
}

.user-email {
  font-size: 0.85rem;
  color: var(--paper);
  opacity: 0.9;
}

.auth-form {
  padding: 1.04vw 1.30vw 1.30vw;
  display: flex;
  flex-direction: column;
  gap: 0.78vw;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.31vh;
}

.input-group label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05vw;
  color: var(--moss-light);
}

.input-group input {
  background: rgba(255,255,255,0.05);
  border: 0.05vw solid var(--moss);
  color: var(--paper);
  padding: 0.63vh 0.63vw;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.input-group input::placeholder {
  color: rgba(226, 222, 208, 0.3);
}

.input-group input:focus {
  outline: none;
  border-color: var(--terracotta);
  background: rgba(255,255,255,0.08);
}

.submit-btn,
.logout-btn {
  background: var(--terracotta);
  border: none;
  color: var(--ink);
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1vw;
  padding: 0.78vh 1.04vw;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.52vw;
}

.submit-btn:hover,
.logout-btn:hover {
  background: var(--stencil-orange);
}

.logout-btn {
  margin: 0 1.30vw 1.30vw;
  width: calc(100% - 2.60vw);
}

.greeting-toast {
  position: fixed;
  top: 5.56vh;
  right: 2.08vw;
  background: var(--moss);
  border: 0.05vw solid var(--moss-light);
  padding: 0.78vw 1.30vw;
  z-index: 2001;
  cursor: pointer;
  animation: slideIn 0.4s ease-out;
}

.greeting-content {
  display: flex;
  align-items: center;
  gap: 0.78vw;
}

.greeting-icon {
  color: var(--stencil-orange);
  font-size: 1rem;
}

.greeting-text {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: var(--paper);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.78vw);
}

.greeting-enter-active {
  transition: all 0.4s ease-out;
}

.greeting-leave-active {
  transition: all 0.3s ease-in;
}

.greeting-enter-from {
  opacity: 0;
  transform: translateY(-1.56vw);
}

.greeting-leave-to {
  opacity: 0;
  transform: translateX(3.13vw);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-1.04vw);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
