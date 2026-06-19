import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UnauthorizedApiError } from '~/api/client'
import { AuthProvider } from '~/auth/AuthContext'
import { OrgProvider } from '~/auth/OrgContext'
import { Toaster } from '~/components/ui/toaster'
import { AppRouter } from '~/Router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Auth failures won't fix themselves; don't hammer the API.
        if (error instanceof UnauthorizedApiError) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})

export const Providers = () => (
  <ChakraProvider value={defaultSystem}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrgProvider>
          <AppRouter />
        </OrgProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  </ChakraProvider>
)
