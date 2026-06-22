import { Alert, Button, Code, Field, HStack, Input, Spinner, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getApiErrorMessage } from '~/api/client'
import { useOrg } from '~/auth/OrgContext'
import { toaster } from '~/components/ui/toaster'
import { useOrganization, useUpdateOrganization, UpdateOrganizationBody } from '~/queries/organization'

const OrgDetailsTab = () => {
  const { isAdmin } = useOrg()
  const { data, isLoading, error } = useOrganization()
  const update = useUpdateOrganization()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateOrganizationBody>()

  // Pre-fill the form once the organization details load (and after a successful save).
  useEffect(() => {
    if (data) {
      reset({
        website: data.website,
        size: data.size,
        color: data.color,
        subdomain: data.subdomain,
        country: data.country,
        timezone: data.timezone,
      })
    }
  }, [data, reset])

  if (isLoading) return <Spinner />

  if (error || !data) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>Unable to load organization details</Alert.Title>
      </Alert.Root>
    )
  }

  const onSubmit = async (values: UpdateOrganizationBody) => {
    try {
      await update.mutateAsync(values)
      toaster.create({ type: 'success', title: 'Organization updated', closable: true })
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not update organization',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  return (
    <Stack as='form' gap={4} maxW='2xl' onSubmit={handleSubmit(onSubmit)}>
      {!isAdmin && (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Title>Only organization admins can edit these details.</Alert.Title>
        </Alert.Root>
      )}

      <Field.Root>
        <Field.Label>Address</Field.Label>
        <Code>{data.address}</Code>
      </Field.Root>

      <Field.Root>
        <Field.Label>Type</Field.Label>
        <Input value={data.type ? data.type.replace(/_/g, ' ') : '-'} readOnly disabled />
        <Field.HelperText>Type is set when the organization is created and can't be changed.</Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input placeholder='https://...' disabled={!isAdmin} {...register('website')} />
      </Field.Root>

      <HStack gap={4} align='start'>
        <Field.Root>
          <Field.Label>Subdomain</Field.Label>
          <Input disabled={!isAdmin} {...register('subdomain')} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Brand color</Field.Label>
          <Input placeholder='#RRGGBB' disabled={!isAdmin} {...register('color')} />
        </Field.Root>
      </HStack>

      <HStack gap={4} align='start'>
        <Field.Root>
          <Field.Label>Size</Field.Label>
          <Input placeholder='e.g. 10-50' disabled={!isAdmin} {...register('size')} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Country</Field.Label>
          <Input placeholder='e.g. ES' disabled={!isAdmin} {...register('country')} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Timezone</Field.Label>
          <Input placeholder='e.g. Europe/Madrid' disabled={!isAdmin} {...register('timezone')} />
        </Field.Root>
      </HStack>

      {isAdmin && (
        <Button type='submit' alignSelf='flex-start' loading={update.isPending} disabled={!isDirty}>
          Save changes
        </Button>
      )}
    </Stack>
  )
}

export default OrgDetailsTab
