import { api } from '@/services/api'

export async function fetchProfile() {
  const { data } = await api.get('/profile/me')
  return data.data.user
}

// Always sent as multipart/form-data, matches multer's uploadProfileImage
// middleware on the server — same convention as menuItemService.js.
function buildProfileFormData({ fullName, phone }, imageFile) {
  const formData = new FormData()
  formData.append('fullName', fullName)
  formData.append('phone', phone)
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export async function updateProfile(payload, imageFile) {
  const { data } = await api.put('/profile/me', buildProfileFormData(payload, imageFile))
  return data.data.user
}

export async function changePassword(payload) {
  await api.put('/profile/me/password', payload)
}
