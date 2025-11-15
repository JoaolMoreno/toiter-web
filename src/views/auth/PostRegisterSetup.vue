<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { updateUserProfile, updateProfileImage, updateHeaderImage } from '@/services/userService.ts'
import { useAuthStore } from '@/stores/auth'
import EditImageModal from '../../components/EditImageModal.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const displayName = ref('')
const bio = ref('')
const profileImageFile = ref<File | null>(null)
const headerImageFile = ref<File | null>(null)
const profileImagePreview = ref<string>('')
const headerImagePreview = ref<string>('')
const isImageModalOpen = ref(false)
const imageEditType = ref<'profile' | 'header'>('profile')
const isLoading = ref(false)
const currentStep = ref(1)

const isFormValid = computed(() => {
  const nameValid = displayName.value.length >= 4 && displayName.value.length <= 30 && !displayName.value.endsWith(' ')
  const bioValid = bio.value.trim().length > 0
  return nameValid && bioValid
})

const handleEditProfileImage = () => {
  imageEditType.value = 'profile'
  isImageModalOpen.value = true
}

const handleEditHeaderImage = () => {
  imageEditType.value = 'header'
  isImageModalOpen.value = true
}

const handleUpdateImage = async (file: File) => {
  if (imageEditType.value === 'profile') {
    profileImageFile.value = file
    profileImagePreview.value = URL.createObjectURL(file)
  } else {
    headerImageFile.value = file
    headerImagePreview.value = URL.createObjectURL(file)
  }
  isImageModalOpen.value = false
}

const handleSave = async () => {
  if (!isFormValid.value) {
    toast.error('Preencha nome e bio corretamente')
    return
  }

  try {
    isLoading.value = true

    // Update profile
    await updateUserProfile({ displayName: displayName.value, bio: bio.value })

    // Update images if selected
    if (profileImageFile.value) {
      await updateProfileImage(profileImageFile.value)
    }
    if (headerImageFile.value) {
      await updateHeaderImage(headerImageFile.value)
    }

    toast.success('Perfil configurado com sucesso!')
    router.push('/feed')
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
    toast.error('Erro ao salvar perfil')
  } finally {
    isLoading.value = false
  }
}

const handleNextStep = () => {
  if (currentStep.value === 1 && displayName.value.length >= 4 && displayName.value.length <= 30 && !displayName.value.endsWith(' ')) {
    currentStep.value = 2
  } else if (currentStep.value === 2 && bio.value.trim().length > 0) {
    currentStep.value = 3
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.title = 'Configurar Perfil - Toiter'
  }

  // Set initial values from auth store
  displayName.value = authStore.user?.displayName || ''
  bio.value = authStore.user?.bio || ''
  profileImagePreview.value = authStore.user?.profileImage || ''
  headerImagePreview.value = authStore.user?.headerImage || ''
})

onUnmounted(() => {
  // Clean up references
  displayName.value = ''
  bio.value = ''
  profileImageFile.value = null
  headerImageFile.value = null
  if (profileImagePreview.value && profileImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(profileImagePreview.value)
  }
  if (headerImagePreview.value && headerImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(headerImagePreview.value)
  }
  profileImagePreview.value = ''
  headerImagePreview.value = ''
})
</script>

<template>
  <div class="container">
    <!-- Step 1: Ask for display name -->
    <div v-if="currentStep === 1" class="step-container">
      <div class="step-card">
        <h1 class="step-title">Me diga seu nome</h1>
        <p class="step-subtitle">Este será seu nome de exibição no Toiter</p>
        <div class="input-group">
          <input
            v-model="displayName"
            type="text"
            class="input"
            placeholder="Digite seu nome"
            required
          />
          <p v-if="displayName && (displayName.length < 4 || displayName.length > 30 || displayName.endsWith(' '))" class="error">
            Nome deve ter 4-30 caracteres
          </p>
        </div>
        <button
          type="button"
          class="next-button"
          :disabled="!displayName || displayName.length < 4 || displayName.length > 30 || displayName.endsWith(' ')"
          @click="handleNextStep"
        >
          Próximo
        </button>
      </div>
    </div>

    <!-- Step 2: Ask for bio -->
    <div v-else-if="currentStep === 2" class="step-container">
      <div class="step-card">
        <h1 class="step-title">Me fale sobre você</h1>
        <p class="step-subtitle">Esta será sua bio no perfil</p>
        <div class="input-group">
          <textarea
            v-model="bio"
            class="textarea"
            placeholder="Conte um pouco sobre você..."
            required
          />
          <p v-if="bio && !bio.trim()" class="error">
            Bio é obrigatória
          </p>
        </div>
        <button
          type="button"
          class="next-button"
          :disabled="!bio || !bio.trim()"
          @click="handleNextStep"
        >
          Próximo
        </button>
      </div>
    </div>

    <!-- Step 3: Profile preview -->
    <div v-else-if="currentStep === 3" class="profile-container">
      <div class="instructions">
        <p>Você pode alterar seu nome ou bio clicando neles. Escolha uma foto de perfil ou capa se quiser, ou deixe para depois.</p>
      </div>

      <!-- Profile Header -->
      <div class="profile-header" :style="{ backgroundImage: headerImagePreview ? `url(${headerImagePreview})` : 'none' }">
        <button class="edit-header-button" @click="handleEditHeaderImage">
          ✏️ Editar Imagem
        </button>
      </div>

      <!-- Profile Info -->
      <div class="profile-info">
        <button
          type="button"
          class="save-button"
          :disabled="!isFormValid || isLoading"
          @click="handleSave"
        >
          {{ isLoading ? 'Salvando...' : 'Salvar e continuar' }}
        </button>

        <div class="profile-image-wrapper">
          <div class="profile-image-container editable" @click="handleEditProfileImage">
            <img :src="profileImagePreview || '/default-profile.png'" alt="Profile" class="profile-image" />
          </div>
        </div>

        <div class="user-info">
          <input
            v-model="displayName"
            type="text"
            class="display-name-input"
            placeholder="Seu nome de exibição"
            required
          />
          <p v-if="displayName && (displayName.length < 4 || displayName.length > 30 || displayName.endsWith(' '))" class="error">
            Nome deve ter 4-30 caracteres
          </p>

          <p class="username">@{{ authStore.user?.username || 'username' }}</p>

          <textarea
            v-model="bio"
            class="bio-input"
            placeholder="Conte um pouco sobre você"
            required
          />
          <p v-if="bio && !bio.trim()" class="error">
            Bio é obrigatória
          </p>
        </div>
      </div>
    </div>

    <EditImageModal
      :is-open="isImageModalOpen"
      @close="isImageModalOpen = false"
      @submit="handleUpdateImage"
      :type="imageEditType"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  min-height: 100vh;
}

.step-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.step-card {
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px 24px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.step-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  text-align: center;
}

.input-group {
  width: 100%;
  margin-bottom: 16px;
}

.input,
.textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  color: var(--color-text);
  background-color: var(--color-background);
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus {
  border-color: var(--color-primary);
  outline: none;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.next-button {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--color-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.next-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.next-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.instructions {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 24px;
  padding: 16px;
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text);
  text-align: center;
}

.profile-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.profile-header {
  position: relative;
  background-size: cover;
  background-position: center;
  width: 100%;
  padding-bottom: 25%;
  max-height: 280px;
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--color-border);
  z-index: 1;
  margin-top: 25px;
}

.edit-header-button {
  position: absolute;
  top: 24px;
  right: 12px;
  background-color: var(--color-overlay);
  color: var(--color-button-text);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
  opacity: 1;
}

.edit-header-button:hover {
  background-color: var(--color-overlay-hover);
}

.profile-info {
  position: relative;
  background-color: var(--color-background-elevated);
  border: 1px solid var(--color-border);
  border-radius: 0 0 12px 12px;
  padding: 40px 24px 24px;
  margin-top: -12px;
}

.save-button {
  position: absolute;
  top: 30px;
  right: 20px;
  background-color: var(--color-primary);
  color: var(--color-button-text);
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-button-hover);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.profile-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: -80px auto 16px;
  width: 100px;
  height: 100px;
  border: 3px solid var(--color-background);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 3;
}

.profile-image-container.editable:hover::after {
  content: '✏️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-overlay-hover);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-button-text);
  z-index: 4;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  text-align: center;
  margin-top: 16px;
}

.display-name-input {
  font-size: 18px;
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-weight: 800;
  outline: none;
}

.display-name-input::placeholder {
  color: var(--color-text-secondary);
}

.username {
  font-size: 14px;
  color: var(--color-text-light);
}

.bio-input {
  margin: 8px 0;
  font-size: 13px;
  text-align: center;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text);
  resize: none;
  outline: none;
  min-height: 40px;
}

.bio-input::placeholder {
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 4px;
  text-align: center;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .step-container {
    padding: 16px;
  }

  .step-card {
    padding: 24px;
  }

  .step-title {
    font-size: 20px;
  }

  .step-subtitle {
    font-size: 13px;
  }

  .input,
  .textarea {
    font-size: 15px;
  }

  .next-button {
    font-size: 15px;
  }

  .instructions {
    padding: 12px;
    font-size: 13px;
  }

  .profile-container {
    padding: 24px;
    margin-bottom: 16px;
  }

  .profile-header {
    height: 80px;
  }

  .save-button {
    padding: 12px;
    font-size: var(--font-size-small);
  }

  .profile-image-wrapper {
    width: 100px;
    height: 100px;
  }

  .display-name-input {
    font-size: var(--font-size-small);
  }

  .bio-input {
    font-size: var(--font-size-small);
  }

  .username {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .step-container {
    padding: 12px;
  }

  .step-card {
    padding: 20px;
  }

  .step-title {
    font-size: 18px;
  }

  .step-subtitle {
    font-size: 12px;
  }

  .input,
  .textarea {
    font-size: 14px;
  }

  .next-button {
    font-size: 14px;
  }

  .instructions {
    padding: 10px;
    font-size: 12px;
  }

  .profile-container {
    padding: 20px;
  }

  .profile-header {
    height: 60px;
  }

  .save-button {
    padding: 10px;
    font-size: 0.875rem;
  }

  .profile-image-wrapper {
    width: 80px;
    height: 80px;
  }

  .display-name-input {
    font-size: 0.875rem;
  }

  .bio-input {
    font-size: 0.875rem;
  }

  .username {
    font-size: 0.625rem;
  }
}
</style>
