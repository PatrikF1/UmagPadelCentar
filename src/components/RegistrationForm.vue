<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  name: '',
  email: '',
  password: '',
  birthDate: '',
  gender: '',
  padelExperience: '',
})

const message = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const submitForm = async () => {
  try {
    isSubmitting.value = true

    const response = await axios.post('http://localhost:3000/api/users', formData.value)

    message.value = '✅ Registration successful!'
    localStorage.setItem('userEmail', formData.value.email)
    await router.push('/dashboard')
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const errorMsg = error.response.data?.error || 'An error occurred during registration.'

      if (status === 400 && errorMsg.includes('duplicate key')) {
        message.value = '❌ This email is already registered.'
      } else if (status === 400) {
        message.value = '❌ ' + errorMsg
      } else {
        message.value = '❌ Unexpected error: ' + errorMsg
      }
    } else {
      message.value = '❌ Cannot connect to the server. Please try again later.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const genderOptions = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
]

const experienceOptions = [
  { value: 'beginner', label: 'Beginner', icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', icon: '⭐' },
  { value: 'pro', label: 'Professional', icon: '🏆' },
]
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
      <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl shadow-xl">
        <div class="text-center">
          <h2
            class="text-2xl font-extrabold text-white font-display flex items-center justify-center gap-2"
          >
            <span>🎾</span> Registration for Padel Centar Umag
          </h2>
          <p class="mt-1 text-sm text-gray-300">Join our padel community today ✨</p>
        </div>

        <form class="mt-4 space-y-3" @submit.prevent="submitForm">
          <div class="space-y-2">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"
              >
                <span>👤</span> Full Name
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

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
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your email address"
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
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Choose a password"
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

            <div>
              <label
                for="birthDate"
                class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"
              >
                <span>🎂</span> Date of Birth
              </label>
              <input
                id="birthDate"
                v-model="formData.birthDate"
                type="date"
                required
                class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <span>👥</span> Gender
              </label>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="option in genderOptions" :key="option.value">
                  <input
                    type="radio"
                    :id="option.value"
                    :value="option.value"
                    v-model="formData.gender"
                    class="peer sr-only"
                    required
                  />
                  <label
                    :for="option.value"
                    class="flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-600 rounded-lg cursor-pointer bg-gray-800/50 text-gray-300 peer-checked:bg-primary-600 peer-checked:text-white hover:bg-gray-700 peer-checked:hover:bg-primary-700 transition-colors"
                  >
                    <span>{{ option.icon }}</span> {{ option.label }}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <span>🏆</span> Padel Experience
              </label>
              <div class="space-y-2">
                <div v-for="level in experienceOptions" :key="level.value">
                  <input
                    type="radio"
                    :id="level.value"
                    :value="level.value"
                    v-model="formData.padelExperience"
                    class="peer sr-only"
                    required
                  />
                  <label
                    :for="level.value"
                    class="flex items-center p-2 border border-gray-600 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-700 transition-all peer-checked:border-primary-500 peer-checked:bg-primary-900/50"
                  >
                    <span class="mr-2">{{ level.icon }}</span>
                    <span
                      class="text-sm font-medium text-gray-300"
                      :class="{ 'text-white': formData.padelExperience === level.value }"
                    >
                      {{ level.label }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col space-y-2 pt-1">
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
              {{ isSubmitting ? '⏳ Registration in progress...' : '✨ Register' }}
            </button>

            <div class="text-center">
              <button
                type="button"
                @click="goToLogin"
                class="text-sm text-gray-400 hover:text-gray-300 focus:outline-none focus:underline transition ease-in-out duration-150 flex items-center justify-center gap-2"
              >
                <span>🔑</span> Already have an account? Login here
              </button>
            </div>
          </div>

          <div
            v-if="message"
            class="mt-3 p-3 rounded-md text-center animate-fade-in"
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

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
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

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
