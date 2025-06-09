<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const userData = ref(null)
const message = ref('')

// Sample upcoming events data - replace with actual data later
const upcomingEvents = ref([
  {
    id: 1,
    title: 'Weekend Tournament',
    description: 'Join our weekend tournament and compete with other players!',
    date: 'Saturday, April 20, 2024',
    time: '10:00 AM',
    image: '/events/tournament.jpg',
    category: 'Tournament'
  },
  {
    id: 2,
    title: "Beginner's Workshop",
    description: 'Learn the basics of padel with our experienced instructors.',
    date: 'Tuesday, April 23, 2024',
    time: '6:00 PM',
    image: '/events/workshop.jpg',
    category: 'Workshop'
  },
  {
    id: 3,
    title: 'Pro Exhibition Match',
    description: 'Watch professional players showcase their skills in an exhibition match!',
    date: 'Sunday, April 28, 2024',
    time: '4:00 PM',
    image: '/events/exhibition.jpg',
    category: 'Exhibition'
  }
])

onMounted(async () => {
  try {
    // Get user data from localStorage (saved during registration)
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      const response = await axios.get(`http://localhost:3000/api/users/email/${userEmail}`)
      userData.value = response.data
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
})
</script>

<template>
  <div class="min-h-screen w-screen font-sans">
    <!-- Background image -->
    <div 
      class="fixed inset-0 w-full h-full -z-10"
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
    <div class="fixed inset-0 bg-black/50 -z-10"></div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen pb-12">
      <!-- Header -->
      <header class="bg-gray-900/80 backdrop-blur-sm shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-white">Welcome to Padel Centar Umag</h1>
            <div class="flex items-center space-x-4">
              <span class="text-gray-300">{{ userData?.name }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Profile & Quick Actions -->
          <div class="space-y-6">
            <!-- Profile Card -->
            <div class="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-xl p-6">
              <h2 class="text-xl font-semibold text-white mb-4">Your Profile</h2>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Name</label>
                  <p class="mt-1 text-white">{{ userData?.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Email</label>
                  <p class="mt-1 text-white">{{ userData?.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Experience Level</label>
                  <p class="mt-1 text-white capitalize">{{ userData?.padelExperience }}</p>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-xl p-6">
              <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div class="space-y-4">
                <button class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                  <span class="material-icons">event</span>
                  <span>Book a Court</span>
                </button>
                <button class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                  <span class="material-icons">emoji_events</span>
                  <span>Join Tournament</span>
                </button>
                <button class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                  <span class="material-icons">group</span>
                  <span>Find Partners</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Upcoming Events -->
          <div class="lg:col-span-2">
            <div class="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-xl p-6">
              <h2 class="text-2xl font-semibold text-white mb-6">Upcoming Events</h2>
              <div class="grid gap-6">
                <div v-for="event in upcomingEvents" :key="event.id" 
                     class="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors">
                  <div class="flex flex-col md:flex-row">
                    <!-- Event Image -->
                    <div class="md:w-1/3">
                      <img :src="event.image" :alt="event.title" 
                           class="w-full h-48 md:h-full object-cover" />
                    </div>
                    <!-- Event Details -->
                    <div class="p-6 md:w-2/3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                          {{ event.category }}
                        </span>
                        <div class="flex items-center text-gray-300">
                          <span class="material-icons mr-1 text-sm">calendar_today</span>
                          <span class="text-sm">{{ event.date }}</span>
                        </div>
                      </div>
                      <h3 class="text-xl font-semibold text-white mb-2">{{ event.title }}</h3>
                      <p class="text-gray-300 mb-4">{{ event.description }}</p>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center text-gray-300">
                          <span class="material-icons mr-1 text-sm">schedule</span>
                          <span class="text-sm">{{ event.time }}</span>
                        </div>
                        <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                          Register Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Add Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style> 