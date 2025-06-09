<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const isLoggedIn = ref(false)
const users = ref([])
const loginData = ref({
  username: '',
  password: ''
})
const token = ref('')
const message = ref('')
const editingUser = ref(null)
const showPassword = ref(false)

const login = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/admin/login', loginData.value)
    token.value = response.data.token
    isLoggedIn.value = true
    fetchUsers()
  } catch (error) {
    message.value = 'Invalid credentials'
  }
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const startEdit = (user) => {
  // Format the date to YYYY-MM-DD for the date input
  const formattedUser = {
    ...user,
    birthDate: new Date(user.birthDate).toISOString().split('T')[0]
  }
  editingUser.value = formattedUser
}

const saveEdit = async () => {
  try {
    // Format the date to ISO string for the API
    const formattedData = {
      ...editingUser.value,
      birthDate: new Date(editingUser.value.birthDate).toISOString()
    }

    await axios.put(
      `http://localhost:3000/api/users/${editingUser.value._id}`,
      formattedData,
      {
        headers: { Authorization: `Bearer ${token.value}` }
      }
    )
    message.value = 'User updated successfully'
    editingUser.value = null
    fetchUsers()
  } catch (error) {
    console.error('Error updating user:', error)
    message.value = 'Error updating user: ' + (error.response?.data?.message || error.message)
  }
}

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await axios.delete(`http://localhost:3000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    message.value = 'User deleted successfully'
    fetchUsers()
  } catch (error) {
    message.value = 'Error deleting user'
  }
}

const exportToExcel = async () => {
  try {
    console.log('Starting export...');
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: { 
        Authorization: `Bearer ${token.value}`
      }
    });

    // Transform data to English
    const transformedData = response.data.map(user => ({
      "Full Name": user.name,
      "Email": user.email,
      "Birth Date": formatDate(user.birthDate),
      "Gender": user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
      "Experience Level": user.padelExperience.charAt(0).toUpperCase() + user.padelExperience.slice(1)
    }));

    // Create CSV content
    const headers = ["Full Name", "Email", "Birth Date", "Gender", "Experience Level"];
    const csvContent = [
      headers.join(','),
      ...transformedData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registered_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.value = 'Export successful';
    console.log('Download completed');
  } catch (error) {
    console.error('Export error:', error);
    message.value = 'Export error: ' + (error.response?.data?.error || error.message);
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

onMounted(() => {
  const savedToken = localStorage.getItem('adminToken')
  if (savedToken) {
    token.value = savedToken
    isLoggedIn.value = true
    fetchUsers()
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

    <!-- Login Form -->
    <div v-if="!isLoggedIn" class="fixed inset-0 h-screen w-screen font-sans">
      <div class="relative z-10 h-full w-full flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
          <div>
            <h2 class="text-center text-3xl font-extrabold text-white font-display">
              Admin Login
            </h2>
            <p class="mt-2 text-center text-sm text-gray-300">
              Enter your credentials to access the admin panel
            </p>
          </div>
          <form class="mt-8 space-y-6" @submit.prevent="login">
            <div class="space-y-4 rounded-md">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
                <input 
                  id="username" 
                  v-model="loginData.username" 
                  type="text" 
                  required 
                  class="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter your username"
                >
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
                <div class="mt-1 relative">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="password" 
                    v-model="loginData.password" 
                    required
                    class="block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm pr-10"
                    placeholder="Enter your password"
                  >
                  <button 
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span v-if="showPassword" class="text-gray-400 hover:text-gray-300">👁️</span>
                    <span v-else class="text-gray-400 hover:text-gray-300">👁️‍🗨️</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-primary-300 group-hover:text-primary-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
                Login
              </button>
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

    <!-- Admin Dashboard -->
    <div v-else class="fixed inset-0 h-screen w-screen font-sans">
      <div class="relative z-10 h-full w-full flex flex-col">
        <header class="bg-gray-900/80 backdrop-blur-sm shadow-lg mb-6">
          <div class="container mx-auto px-4 py-6">
            <h1 class="text-3xl font-bold tracking-tight text-white text-center">Admin Panel</h1>
          </div>
        </header>

        <main class="flex-1 container mx-auto px-4 flex flex-col items-center overflow-auto">
          <div class="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 w-full max-w-6xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-white">Registered Users</h2>
              <button 
                @click="exportToExcel" 
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <span>Export CSV</span>
              </button>
            </div>
            
            <div v-if="message" 
                 class="mb-6 p-4 rounded-lg animate-fade-in"
                 :class="{
                   'bg-green-900/50 text-green-200 border border-green-800': !message.includes('Error'),
                   'bg-red-900/50 text-red-200 border border-red-800': message.includes('Error')
                 }">
              {{ message }}
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-700 shadow-2xl">
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800/50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Birth Date</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gender</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Experience</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700 bg-gray-800/30">
                  <tr v-for="user in users" :key="user._id" class="hover:bg-gray-700/50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{{ user.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{{ user.email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{{ formatDate(user.birthDate) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200 capitalize">{{ user.gender }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200 capitalize">{{ user.padelExperience }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      <div class="flex gap-3">
                        <button 
                          @click="deleteUser(user._id)"
                          class="text-red-400 hover:text-red-300 transition-colors duration-150"
                        >
                          Delete
                        </button>
                        <button 
                          @click="startEdit(user)"
                          class="text-blue-400 hover:text-blue-300 transition-colors duration-150"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingUser" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div class="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-gray-900/90 p-6 text-left align-middle shadow-xl transition-all">
          <h3 class="text-xl font-semibold leading-6 text-white mb-4">
            Edit User
          </h3>
          
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Name</label>
              <input 
                v-model="editingUser.name" 
                type="text"
                class="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300">Email</label>
              <input 
                v-model="editingUser.email" 
                type="email"
                class="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300">Birth Date</label>
              <input 
                v-model="editingUser.birthDate" 
                type="date"
                class="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300">Gender</label>
              <div class="mt-2 grid grid-cols-2 gap-3">
                <div v-for="option in ['male', 'female']" :key="option" class="relative">
                  <input 
                    type="radio" 
                    :id="'edit-' + option" 
                    :value="option" 
                    v-model="editingUser.gender"
                    class="peer sr-only"
                  >
                  <label 
                    :for="'edit-' + option"
                    class="flex justify-center items-center px-3 py-2 text-sm font-medium border border-gray-600 rounded-lg cursor-pointer bg-gray-800/50 text-gray-300 peer-checked:bg-primary-600 peer-checked:text-white hover:bg-gray-700 peer-checked:hover:bg-primary-700 transition-colors capitalize"
                  >
                    {{ option }}
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300">Padel Experience</label>
              <div class="mt-2 space-y-2">
                <div v-for="level in ['beginner', 'intermediate', 'pro']" :key="level" class="relative">
                  <input 
                    type="radio" 
                    :id="'edit-' + level" 
                    :value="level" 
                    v-model="editingUser.padelExperience"
                    class="peer sr-only"
                  >
                  <label 
                    :for="'edit-' + level"
                    class="flex items-center p-3 border border-gray-600 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-700 transition-all peer-checked:border-primary-500 peer-checked:bg-primary-900/50"
                  >
                    <span class="text-sm font-medium text-gray-300 peer-checked:text-white">
                      {{ level === 'beginner' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Advanced' }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="editingUser = null"
              class="inline-flex justify-center rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              @click="saveEdit"
              class="inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Zadržavamo samo custom stilove koji nisu pokriveni Tailwindom */
.form-radio {
  @apply rounded-full;
}

input[type="date"] {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}

/* Custom styling for date input */
input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
  transition: filter 0.2s ease-in-out;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  filter: invert(1);
}
</style> 