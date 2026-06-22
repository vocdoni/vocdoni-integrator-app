import { useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~/api/endpoints'
import { useAuth } from '~/auth/AuthContext'

export type IntegratorLimits = {
  maxManagedOrgs: number
  maxManagedProcesses: number
  maxManagedCensusSize: number
}

// Subset of the backend SubscriptionPlan we use here (saas-backend#532 exposes integratorLimits).
export type Plan = {
  id: number
  name: string
  monthlyPrice: number
  yearlyPrice: number
  default: boolean
  integratorLimits: IntegratorLimits
}

const isIntegratorPlan = (plan: Plan) => (plan.integratorLimits?.maxManagedOrgs ?? 0) > 0

/**
 * Integrator plans available for purchase: plans whose integrator limits grant at least one
 * managed org. The free tier (zero-priced) is filtered out — it's assigned automatically at org
 * creation, not bought here.
 */
export const useIntegratorPlans = () => {
  const { bearedFetch } = useAuth()

  return useQuery<Plan[], Error, Plan[]>({
    queryKey: ['plans'],
    staleTime: 10 * 60 * 1000,
    queryFn: () => bearedFetch<Plan[]>(ApiEndpoints.Plans),
    select: (plans) =>
      (plans ?? [])
        .filter(isIntegratorPlan)
        .filter((p) => p.monthlyPrice > 0 || p.yearlyPrice > 0)
        .sort((a, b) => a.monthlyPrice - b.monthlyPrice),
  })
}
