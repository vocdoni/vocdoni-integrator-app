import { Button, CloseButton, Dialog, Field, HStack, Icon, Input, NativeSelect, Portal, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuPlus } from 'react-icons/lu'
import { getApiErrorMessage } from '~/api/client'
import { useOrg } from '~/auth/OrgContext'
import { toaster } from '~/components/ui/toaster'
import { ORGANIZATION_TYPES } from '~/queries/integrator'
import { useCreateOrganization } from '~/queries/organization'

type FormData = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
}

const clean = (values: FormData) => {
  const body: FormData = { type: values.type }
  if (values.website) body.website = values.website
  if (values.size) body.size = values.size
  if (values.color) body.color = values.color
  if (values.subdomain) body.subdomain = values.subdomain
  if (values.country) body.country = values.country
  if (values.timezone) body.timezone = values.timezone
  return body
}

type CreateOrganizationButtonProps = {
  label?: string
}

/**
 * Self-serve "create your organization" action. The signed-in user becomes the new org's admin;
 * on success we select it as the active org so the dashboard switches to it immediately.
 */
export const CreateOrganizationButton = ({ label = 'Create organization' }: CreateOrganizationButtonProps) => {
  const [open, setOpen] = useState(false)
  const create = useCreateOrganization()
  const { setSelectedAddress } = useOrg()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { type: '' } })

  const onSubmit = async (values: FormData) => {
    try {
      const { address } = await create.mutateAsync(clean(values))
      toaster.create({ type: 'success', title: 'Organization created', closable: true })
      reset()
      setOpen(false)
      if (address) setSelectedAddress(address)
    } catch (error) {
      toaster.create({
        type: 'error',
        title: 'Could not create organization',
        description: getApiErrorMessage(error),
        closable: true,
      })
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement='center'>
      <Dialog.Trigger asChild>
        <Button size='sm'>
          <Icon as={LuPlus} />
          {label}
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
              <Dialog.Title>Create your organization</Dialog.Title>
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
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='ghost' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' loading={create.isPending}>
                Create organization
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
