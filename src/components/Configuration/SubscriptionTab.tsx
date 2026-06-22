import { Alert, Box, Button, Card, Center, Flex, SimpleGrid, Spinner, Stack, Stat, Text } from '@chakra-ui/react'
import { getApiErrorMessage } from '~/api/client'
import { toaster } from '~/components/ui/toaster'
import { UpgradePlansButton } from '~/components/Integrator/UpgradeDialog'
import { usePortalSession, useSubscription } from '~/queries/subscription'

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const SubscriptionTab = () => {
  const { data, isLoading, error } = useSubscription()
  const portal = usePortalSession()

  const openPortal = async () => {
    try {
      const { portalURL } = await portal.mutateAsync()
      if (portalURL) window.open(portalURL, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not open billing portal',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  // GET subscription is admin-gated; managers get a 401.
  if (error || !data) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Subscription is admin-only</Alert.Title>
          <Alert.Description>Only organization admins can view subscription details.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const { plan, subscriptionDetails, usage } = data
  const isPaid = !plan.default && (plan.monthlyPrice > 0 || plan.yearlyPrice > 0)

  return (
    <Stack gap={6}>
      <Card.Root>
        <Card.Body>
          <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
            <Stack gap={1}>
              <Text fontSize='sm' color='fg.muted'>
                Current plan
              </Text>
              <Text fontSize='2xl' fontWeight='bold'>
                {plan.name}
              </Text>
              <Text fontSize='sm' color='fg.muted'>
                {subscriptionDetails.active ? 'Active' : 'Inactive'} · Renews{' '}
                {formatDate(subscriptionDetails.renewalDate)}
              </Text>
            </Stack>
            <Flex gap={2} wrap='wrap'>
              <UpgradePlansButton label='Change plan' />
              {isPaid && (
                <Button variant='outline' onClick={openPortal} loading={portal.isPending}>
                  Billing details
                </Button>
              )}
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>

      <Box>
        <Text fontSize='sm' fontWeight='medium' mb={3}>
          Usage
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <Stat.Root>
            <Stat.Label>Sub-organizations</Stat.Label>
            <Stat.ValueText>{usage.subOrgs}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Team members</Stat.Label>
            <Stat.ValueText>{usage.users}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Processes</Stat.Label>
            <Stat.ValueText>{usage.processes}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Emails sent</Stat.Label>
            <Stat.ValueText>{usage.sentEmails}</Stat.ValueText>
          </Stat.Root>
        </SimpleGrid>
      </Box>
    </Stack>
  )
}

export default SubscriptionTab
