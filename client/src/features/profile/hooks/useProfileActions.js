import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as profileService from '@/features/profile/services/profileService'

// "View Profile" reads straight from AuthContext's `user` (already loaded
// at app start by AuthProvider) — no redundant GET here. This hook only
// owns the two mutations (edit profile, change password) and the
// loading/error/success state each needs, shared by both page components
// that render the same forms in different chrome (dashboard vs standalone
// — same split as OrdersPage/MyOrdersPage sharing useOrders in Part 12).
export function useProfileActions() {
  const { updateUser } = useAuth()

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState([])
  const [profileSuccess, setProfileSuccess] = useState('')

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function saveProfile(form, imageFile) {
    setIsSavingProfile(true)
    setProfileErrors([])
    setProfileSuccess('')
    try {
      const updated = await profileService.updateProfile(form, imageFile)
      updateUser(updated)
      setProfileSuccess('Profile updated successfully.')
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setProfileErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function submitPasswordChange(form) {
    setIsChangingPassword(true)
    setPasswordErrors([])
    setPasswordSuccess('')
    try {
      await profileService.changePassword(form)
      setPasswordSuccess('Password changed successfully.')
      return true
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setPasswordErrors(details && details.length > 0 ? details : [message])
      return false
    } finally {
      setIsChangingPassword(false)
    }
  }

  return {
    saveProfile,
    isSavingProfile,
    profileErrors,
    profileSuccess,
    submitPasswordChange,
    isChangingPassword,
    passwordErrors,
    passwordSuccess,
  }
}
