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
  // Subscribe the new org to the free integrator plan so it becomes an integrator
  // immediately, with no checkout (saas-backend#532).
  integrator: boolean
}

type CreatedOrganization = { address: string }

/**
 * Self-serve organization creation: the signed-in user becomes the org's admin. We always set
 * provisionAccount (on-chain account created server-side) and integrator (subscribe to the free
 * integrator tier), so a portal-created org is an integrator with no checkout. On success the
 * profile is refreshed so the new org shows up as an administrable organization.
 */
export const useCreateOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<CreatedOrganization, Error, Omit<CreateOrganizationBody, 'provisionAccount' | 'integrator'>>({
    mutationFn: (body) =>
      bearedFetch<CreatedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { ...body, provisionAccount: true, integrator: true } satisfies CreateOrganizationBody,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}
