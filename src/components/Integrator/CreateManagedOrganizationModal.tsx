import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Icon,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Switch,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuPlus } from 'react-icons/lu'
import { getApiErrorCode, getApiErrorMessage } from '~/api/client'
import { ErrorCode } from '~/api/endpoints'
import { useOrg } from '~/auth/OrgContext'
import { toaster } from '~/components/ui/toaster'
import {
  CreateManagedOrganizationBody,
  ORGANIZATION_TYPES,
  useCreateManagedOrganization,
  useIntegratorInfo,
} from '~/queries/integrator'

type FormData = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  ownerEmail?: string
  communications?: boolean
}

// Drop empty optional fields so we don't send empty strings the backend would have to interpret.
const buildBody = (values: FormData): CreateManagedOrganizationBody => {
  const body: CreateManagedOrganizationBody = { type: values.type, communications: !!values.communications }
  if (values.website) body.website = values.website
  if (values.size) body.size = values.size
  if (values.color) body.color = values.color
  if (values.subdomain) body.subdomain = values.subdomain
  if (values.country) body.country = values.country
  if (values.timezone) body.timezone = values.timezone
  if (values.ownerEmail) body.ownerEmail = values.ownerEmail
  return body
}

/** Create-managed-org action: admin-only, disabled when the managed-orgs quota is exhausted. */
export const CreateManagedOrganizationButton = () => {
  const { isAdmin } = useOrg()
  const { data: integrator } = useIntegratorInfo()
  const [open, setOpen] = useState(false)
  const createManagedOrg = useCreateManagedOrganization()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { type: '' } })

  if (!isAdmin) return null

  const atLimit = !!integrator?.limits && integrator.usage.managedOrgs >= integrator.limits.maxManagedOrgs

  const onSubmit = async (values: FormData) => {
    try {
      await createManagedOrg.mutateAsync(buildBody(values))
      toaster.create({ type: 'success', title: 'Organization created successfully', closable: true })
      reset()
      setOpen(false)
    } catch (error) {
      const code = getApiErrorCode(error)
      let description = getApiErrorMessage(error)
      if (code === ErrorCode.MaxManagedOrgsReached) {
        description = "You've reached your managed-organization limit."
      } else if (code === ErrorCode.IntegratorQuotaExceeded) {
        description = "You've reached your integrator quota."
      }
      toaster.create({ type: 'error', title: 'Failed to create organization', description, closable: true })
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement='center'>
      <Dialog.Trigger asChild>
        <Button size='sm' disabled={atLimit} title={atLimit ? "You've reached your managed-organization limit." : undefined}>
          <Icon as={LuPlus} />
          Create organization
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content as='form' onSubmit={handleSubmit(onSubmit)}>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>Create managed organization</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.type} required>
                  <Field.Label>Type</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder='Select organization type'
                      {...register('type', { required: 'Type is required' })}
                    >
                      {ORGANIZATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Website</Field.Label>
                  <Input placeholder='https://...' {...register('website')} />
                </Field.Root>

                <HStack gap={4} align='start'>
                  <Field.Root>
                    <Field.Label>Subdomain</Field.Label>
                    <Input {...register('subdomain')} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Brand color</Field.Label>
                    <Input placeholder='#RRGGBB' {...register('color')} />
                  </Field.Root>
                </HStack>

                <HStack gap={4} align='start'>
                  <Field.Root>
                    <Field.Label>Country</Field.Label>
                    <Input placeholder='e.g. ES' {...register('country')} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Timezone</Field.Label>
                    <Input placeholder='e.g. Europe/Madrid' {...register('timezone')} />
                  </Field.Root>
                </HStack>

                <Field.Root>
                  <Field.Label>Size</Field.Label>
                  <Input placeholder='e.g. 0-100' {...register('size')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Owner email</Field.Label>
                  <Input
                    type='email'
                    placeholder='Existing user to own the org (optional)'
                    {...register('ownerEmail')}
                  />
                </Field.Root>

                <Controller
                  name='communications'
                  control={control}
                  render={({ field }) => (
                    <Switch.Root checked={!!field.value} onCheckedChange={(e) => field.onChange(e.checked)}>
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Switch.Label>Enable communications</Switch.Label>
                    </Switch.Root>
                  )}
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='ghost' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' loading={createManagedOrg.isPending}>
                Create organization
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
