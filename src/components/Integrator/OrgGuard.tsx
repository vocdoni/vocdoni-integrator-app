import { Alert, Center, Spinner } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { useOrg } from '~/auth/OrgContext'
import { useIntegratorInfo } from '~/queries/integrator'

/**
 * Gates the dashboard content. Shows a clear empty state when the user administers no organization
 * or when the active organization is not enabled as an integrator. The surrounding layout (sidebar,
 * org switcher, logout) stays available so the user can switch orgs or sign out.
 */
const OrgGuard = () => {
  const { selectedAddress, candidates, isLoading: orgLoading } = useOrg()
  const { data, isLoading: infoLoading } = useIntegratorInfo()

  if (orgLoading) {
    return (
      <Center py={16}>
        <Spinner />
      </Center>
    )
  }

  if (!candidates.length || !selectedAddress) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>No organization to manage</Alert.Title>
          <Alert.Description>
            Your account does not administer any organization. Contact Vocdoni to be added to an integrator
            organization.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  if (infoLoading) {
    return (
      <Center py={16}>
        <Spinner />
      </Center>
    )
  }

  if (!data?.enabled) {
    return (
      <Alert.Root status='warning'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Not an integrator</Alert.Title>
          <Alert.Description>
            This organization is not enabled as an integrator. Contact Vocdoni to enable it, or switch to another
            organization.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  return <Outlet />
}

export default OrgGuard
