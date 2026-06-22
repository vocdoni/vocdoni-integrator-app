import { Alert, Box, Center, Spinner, Stack } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { useOrg } from '~/auth/OrgContext'
import { useIntegratorInfo } from '~/queries/integrator'
import { CreateOrganizationButton } from './CreateOrganizationModal'

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
      <Stack gap={4} align='flex-start'>
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Create your organization</Alert.Title>
            <Alert.Description>
              You don't have an organization yet. Create one to get started — then subscribe to an integrator plan to
              unlock managed organizations.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <CreateOrganizationButton label='Create your organization' />
      </Stack>
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
      <Stack gap={4} align='flex-start'>
        <Alert.Root status='warning'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Not an integrator yet</Alert.Title>
            <Alert.Description>
              This organization isn't on an integrator plan. Subscribe to a plan that includes managed organizations to
              unlock the integrator dashboard — no manual approval needed. If you administer another organization, you
              can switch to it from the sidebar.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Box fontSize='sm' color='fg.muted'>
          Plan subscription &amp; checkout is coming to this portal; until then, manage your subscription from the main
          Vocdoni dashboard.
        </Box>
      </Stack>
    )
  }

  return <Outlet />
}

export default OrgGuard
