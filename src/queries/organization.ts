import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~/api/endpoints'
import { useAuth } from '~/auth/AuthContext'
import { QueryKeys } from './keys'

export type CreateOrganizationBody = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  communications?: boolean
  // Ask the backend to provision the on-chain account eagerly so this self-serve portal
  // never needs a wallet/SDK signer step.
  provisionAccount: boolean
}

type CreatedOrganization = { address: string }

/**
 * Self-serve organization creation: the signed-in user becomes the org's admin. We always set
 * provisionAccount so the backend creates the on-chain account server-side. On success the profile
 * is refreshed so the new org shows up as an administrable organization.
 */
export const useCreateOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<CreatedOrganization, Error, Omit<CreateOrganizationBody, 'provisionAccount'>>({
    mutationFn: (body) =>
      bearedFetch<CreatedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { ...body, provisionAccount: true } satisfies CreateOrganizationBody,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}
