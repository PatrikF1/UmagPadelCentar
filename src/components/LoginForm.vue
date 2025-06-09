<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const formData = ref({
  email: '',
  password: ''
})

const message = ref('')
const isSubmitting = ref(false)

const submitForm = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('http://localhost:3000/api/users/login', formData.value)
    message.value = 'Login successful!'
    // Save user email for dashboard
    localStorage.setItem('userEmail', formData.value.email)
    // Navigate to dashboard
    await router.push('/dashboard')
  } catch (error) {
    message.value = 'Error: ' + (error.response?.data?.error || error.message)
  } finally {
    isSubmitting.value = false
  }
}

const goToRegistration = () => {
  router.push('/register')
}

const goToAdminLogin = () => {
  router.push('/admin-login')
}
</script>

<template>
  <div class="fixed inset-0 h-screen w-screen font-sans">
    <!-- Background image -->
    <div 
      class="fixed inset-0 w-full h-full"
      style="
        background-image: url('/background.jpeg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        width: 100vw;
        height: 100vh;
      "
    ></div>
    
    <!-- Dark overlay -->
    <div class="fixed inset-0 bg-black/50"></div>

    <!-- Content -->
    <div class="relative z-10 h-full w-full flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-white font-display">
            Login to Padel Centar Umag
          </h2>
          <p class="mt-2 text-center text-sm text-gray-300">
            Welcome back to our padel community
          </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="submitForm">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300">Email Address</label>
              <input 
                id="email" 
                v-model="formData.email" 
                type="email" 
                required 
                class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              >
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
              <input 
                id="password" 
                v-model="formData.password" 
                type="password" 
                required 
                class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              >
            </div>
          </div>

          <div class="flex flex-col space-y-4">
            <button 
              type="submit" 
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              :disabled="isSubmitting"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-primary-300 group-hover:text-primary-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                </svg>
              </span>
              {{ isSubmitting ? 'Logging in...' : 'Login' }}
            </button>

            <div class="flex items-center justify-between">
              <button 
                type="button"
                @click="goToRegistration"
                class="text-sm text-primary-500 hover:text-primary-400 focus:outline-none focus:underline transition ease-in-out duration-150"
              >
                Register here
              </button>

              <button 
                type="button"
                @click="goToAdminLogin"
                class="text-sm text-gray-400 hover:text-gray-300 focus:outline-none focus:underline transition ease-in-out duration-150"
              >
                Admin Login
              </button>
            </div>
          </div>

          <div v-if="message" 
               class="mt-4 p-4 rounded-md text-center animate-fade-in"
               :class="{
                 'bg-green-900/50 text-green-200': !message.includes('Error'),
                 'bg-red-900/50 text-red-200': message.includes('Error')
               }">
            {{ message }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 