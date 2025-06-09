<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('users.title') }}</h1>
            <p class="text-gray-600">إدارة شاملة للمستخدمين والصلاحيات</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <PlusIcon class="w-5 h-5" />
            <span>{{ $t('users.new_user') }}</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics?.total || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UsersIcon class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">المديرين</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics?.byRole?.admin || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">مديري المبيعات</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics?.byRole?.sales_manager || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">المندوبين</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics?.byRole?.representative || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <UserGroupIcon class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>

          <!-- Role Filter -->
          <select
            v-model="selectedRole"
            @change="filterUsers"
            class="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأدوار</option>
            <option value="admin">مدير</option>
            <option value="sales_manager">مدير مبيعات</option>
            <option value="representative">مندوب مبيعات</option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="selectedStatus"
            @change="filterUsers"
            class="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="suspended">معلق</option>
          </select>

          <!-- Refresh Button -->
          <button
            @click="loadUsers"
            :disabled="loading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon :class="['w-5 h-5', loading && 'animate-spin']" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">المستخدم</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">الدور</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">آخر دخول</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  <div class="flex items-center justify-center space-x-2">
                    <ArrowPathIcon class="w-5 h-5 animate-spin" />
                    <span>جاري التحميل...</span>
                  </div>
                </td>
              </tr>
              
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  لا توجد مستخدمين
                </td>
              </tr>

              <tr 
                v-else
                v-for="user in filteredUsers" 
                :key="user.id"
                class="hover:bg-gray-50/50 transition-colors duration-200"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span class="text-white text-sm font-semibold">
                        {{ getUserInitials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                      <p v-if="user.phone" class="text-xs text-gray-400">{{ user.phone }}</p>
                    </div>
                  </div>
                </td>
                
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex px-3 py-1 text-xs font-medium rounded-full',
                    getRoleColor(user.role)
                  ]">
                    {{ $t(`users.role_${user.role}`) }}
                  </span>
                </td>
                
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex px-3 py-1 text-xs font-medium rounded-full',
                    getStatusColor(user.status)
                  ]">
                    {{ $t(`common.${user.status}`) }}
                  </span>
                </td>
                
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ user.last_login ? formatDate(user.last_login) : 'لم يسجل دخول بعد' }}
                </td>
                
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <!-- View Details -->
                    <button
                      @click="viewUser(user)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      :title="$t('common.view')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>

                    <!-- Edit User -->
                    <button
                      @click="editUser(user)"
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      :title="$t('common.edit')"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>

                    <!-- Reset Password -->
                    <button
                      @click="resetPassword(user)"
                      class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                      :title="إعادة تعيين كلمة المرور"
                    >
                      <KeyIcon class="w-4 h-4" />
                    </button>

                    <!-- Toggle Status -->
                    <button
                      @click="toggleStatus(user)"
                      :class="[
                        'p-2 rounded-lg transition-colors duration-200',
                        user.status === 'active' 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      ]"
                      :title="user.status === 'active' ? 'تعطيل' : 'تفعيل'"
                    >
                      <component :is="user.status === 'active' ? XMarkIcon : CheckIcon" class="w-4 h-4" />
                    </button>

                    <!-- Delete User -->
                    <button
                      v-if="user.email !== currentUser?.email"
                      @click="deleteUser(user)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      :title="$t('common.delete')"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create User Modal -->
      <CreateUserModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @created="handleUserCreated"
      />

      <!-- Edit User Modal -->
      <EditUserModal
        v-if="showEditModal && selectedUser"
        :user="selectedUser"
        @close="showEditModal = false"
        @updated="handleUserUpdated"
      />

      <!-- View User Modal -->
      <ViewUserModal
        v-if="showViewModal && selectedUser"
        :user="selectedUser"
        @close="showViewModal = false"
      />

      <!-- Reset Password Modal -->
      <ResetPasswordModal
        v-if="showResetPasswordModal && selectedUser"
        :user="selectedUser"
        @close="showResetPasswordModal = false"
        @reset="handlePasswordReset"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { userService, type User } from '@/services/users'
import {
  PlusIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

// Components
import CreateUserModal from '@/components/users/CreateUserModal.vue'
import EditUserModal from '@/components/users/EditUserModal.vue'
import ViewUserModal from '@/components/users/ViewUserModal.vue'
import ResetPasswordModal from '@/components/users/ResetPasswordModal.vue'

const { t } = useI18n()
const authStore = useAuthStore()

// Reactive data
const users = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const statistics = ref<any>(null)
const loading = ref(false)
const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showResetPasswordModal = ref(false)
const selectedUser = ref<User | null>(null)

// Computed
const currentUser = computed(() => authStore.user)

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const { data, error } = await userService.getAllUsers()
    if (error) {
      console.error('Error loading users:', error)
      // Show error notification
    } else {
      users.value = data || []
      filteredUsers.value = data || []
    }
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  const { data, error } = await userService.getUsersStatistics()
  if (error) {
    console.error('Error loading statistics:', error)
  } else {
    statistics.value = data
  }
}

const filterUsers = () => {
  let filtered = [...users.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Apply role filter
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Apply status filter
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }

  filteredUsers.value = filtered
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(filterUsers, 300)
  }
})()

const viewUser = (user: User) => {
  selectedUser.value = user
  showViewModal.value = true
}

const editUser = (user: User) => {
  selectedUser.value = user
  showEditModal.value = true
}

const resetPassword = (user: User) => {
  selectedUser.value = user
  showResetPasswordModal.value = true
}

const toggleStatus = async (user: User) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const { status, error } = await userService.toggleUserStatus(user.email, newStatus)
  
  if (error) {
    console.error('Error toggling status:', error)
    // Show error notification
  } else {
    // Update user in list
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].status = status as any
    }
    filterUsers()
    loadStatistics()
  }
}

const deleteUser = async (user: User) => {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
    return
  }

  const { success, error } = await userService.deleteUser(user.id)
  
  if (error) {
    console.error('Error deleting user:', error)
    // Show error notification
  } else {
    // Remove user from list
    users.value = users.value.filter(u => u.id !== user.id)
    filterUsers()
    loadStatistics()
  }
}

const handleUserCreated = (newUser: User) => {
  users.value.unshift(newUser)
  filterUsers()
  loadStatistics()
  showCreateModal.value = false
}

const handleUserUpdated = (updatedUser: User) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
  filterUsers()
  loadStatistics()
  showEditModal.value = false
}

const handlePasswordReset = () => {
  showResetPasswordModal.value = false
}

// Utility functions
const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getRoleColor = (role: string): string => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    sales_manager: 'bg-green-100 text-green-800',
    representative: 'bg-blue-100 text-blue-800'
  }
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Lifecycle
onMounted(() => {
  loadUsers()
  loadStatistics()
})
</script>

<style scoped>
/* Custom animations and effects */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* RTL Support */
[dir="rtl"] .space-x-2 > * + * {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .space-x-3 > * + * {
  margin-left: 0;
  margin-right: 0.75rem;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>

