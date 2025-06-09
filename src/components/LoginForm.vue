<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const formData = ref({
  email: '',
  password: '',
})

const message = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const submitForm = async () => {
  try {
    isSubmitting.value = true
    const response = await axios.post('http://localhost:3000/api/users/login', formData.value)
    message.value = 'Login successful!'
    localStorage.setItem('userEmail', formData.value.email)
    await router.push('/dashboard')
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const errorMsg = error.response.data?.error || 'An error occurred during login.'

      if (status === 401) {
        message.value = '❌ Incorrect email or password.'
      } else if (status === 404) {
        message.value = '❌ User not found.'
      } else {
        message.value = '❌ ' + errorMsg
      }
    } else {
      message.value = '❌ Cannot connect to the server. Please check your internet connection.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToAdminLogin = () => {
  router.push('/admin-login')
}
</script>

<template>
  <div class="fixed inset-0 h-screen w-screen font-sans">
    <div
      class="fixed inset-0 w-full h-full"
      style="
        background-image: url('/background.jpeg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
      "
    ></div>

    <div class="fixed inset-0 bg-black/50"></div>

    <div class="relative z-10 h-full w-full flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl shadow-2xl">
        <div class="text-center">
          <h2
            class="text-2xl font-extrabold text-white font-display flex items-center justify-center gap-2"
          >
            <span>🔐</span> Login to Padel Centar Umag
          </h2>
          <p class="mt-1 text-sm text-gray-300">Welcome back! Let's get you in 🎾</p>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="submitForm">
          <div class="space-y-3">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"
              >
                <span>📧</span> Email Address
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="Enter your email"
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"
              >
                <span>🔒</span> Password
              </label>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter your password"
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div class="flex items-center mt-2 text-sm text-gray-300">
                <input
                  id="showPassword"
                  type="checkbox"
                  v-model="showPassword"
                  class="mr-2 accent-primary-500"
                />
                <label for="showPassword" class="cursor-pointer select-none">Show password</label>
              </div>
            </div>
          </div>

          <div class="flex flex-col space-y-4 pt-2">
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              :disabled="isSubmitting"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  class="h-5 w-5 text-primary-300 group-hover:text-primary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              {{ isSubmitting ? '⏳ Logging in...' : '🔓 Login' }}
            </button>

            <div class="flex justify-between text-sm pt-1">
              <button
                type="button"
                @click="goToRegister"
                class="text-primary-500 hover:text-primary-400 focus:outline-none focus:underline transition"
              >
                📝 Register
              </button>
              <button
                type="button"
                @click="goToAdminLogin"
                class="text-gray-400 hover:text-gray-300 focus:outline-none focus:underline transition"
              >
                ⚙️ Admin Login
              </button>
            </div>
          </div>

          <div
            v-if="message"
            class="mt-4 p-3 rounded-md text-center animate-fade-in"
            :class="{
              'bg-green-900/50 text-green-200': !message.includes('❌'),
              'bg-red-900/50 text-red-200': message.includes('❌'),
            }"
          >
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
