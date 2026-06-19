import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~/api/endpoints'
import { useAuth } from '~/auth/AuthContext'
import { useOrg } from '~/auth/OrgContext'
import { QueryKeys } from './keys'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

// Mirrors the backend OrganizationInfo fields we display (saas-backend#525).
export type ManagedOrganization = {
  address: string
  website: string
  createdAt: string
  type: string
  size: string
  color: string
  subdomain: string
  country: string
  timezone: string
  active: boolean
  communications: boolean
}

export type IntegratorLimits = {
  maxManagedOrgs: number
  maxManagedProcesses: number
  maxManagedCensusSize: number
}

export type IntegratorUsage = {
  managedOrgs: number
  managedProcesses: number
  managedCensusSize: number
}

// GET /organizations/{address}/integrator. `limits` is present only when enabled.
export type IntegratorInfo = {
  enabled: boolean
  limits?: IntegratorLimits
  usage: IntegratorUsage
}

export type ManagedOrganizationsResponse = {
  pagination: {
    totalItems: number
    currentPage: number
    lastPage: number
    previousPage: number | null
    nextPage: number | null
  }
  organizations: ManagedOrganization[]
}

// Body of POST /organizations/{address}/managed. Only `type` is required.
export type CreateManagedOrganizationBody = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  communications?: boolean
  ownerEmail?: string
}

/**
 * Integrator quota/usage for the active organization. A non-integrator org returns
 * `{ enabled: false }`; errors (e.g. lacking the role) are treated as "not an integrator" so
 * detection never throws the dashboard into an error state.
 */
export const useIntegratorInfo = () => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()

  return useQuery<IntegratorInfo>({
    queryKey: QueryKeys.integrator.info(selectedAddress),
    enabled: !!selectedAddress,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      bearedFetch<IntegratorInfo>(ApiEndpoints.Integrator.replace('{address}', ensure0x(selectedAddress!))).catch(
        () => ({ enabled: false, usage: { managedOrgs: 0, managedProcesses: 0, managedCensusSize: 0 } })
      ),
  })
}

/** Paginated list of organizations managed by the active integrator. */
export const usePaginatedManagedOrganizations = (page: number, limit: number) => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()

  return useQuery<ManagedOrganizationsResponse>({
    queryKey: [...QueryKeys.integrator.managed(selectedAddress), page, limit],
    enabled: !!selectedAddress,
    queryFn: () => {
      const base = ApiEndpoints.ManagedOrganizations.replace('{address}', ensure0x(selectedAddress!))
      return bearedFetch<ManagedOrganizationsResponse>(`${base}?page=${page}&limit=${limit}`)
    },
  })
}

/** Creates a managed organization and refreshes both the list and the quota. */
export const useCreateManagedOrganization = () => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()
  const queryClient = useQueryClient()

  return useMutation<ManagedOrganization, Error, CreateManagedOrganizationBody>({
    mutationFn: (body) =>
      bearedFetch<ManagedOrganization>(
        ApiEndpoints.ManagedOrganizations.replace('{address}', ensure0x(selectedAddress!)),
        {
          method: 'POST',
          body,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.managed(selectedAddress) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.info(selectedAddress) })
    },
  })
}

export const ORGANIZATION_TYPES = [
  'association',
  'company',
  'cooperative',
  'government',
  'others',
  'political_party',
  'professional_body',
  'sports_club',
  'union',
] as const
