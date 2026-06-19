export const QueryKeys = {
  profile: ['profile'],
  integrator: {
    info: (address?: string) => ['integrator', 'info', address].filter(Boolean),
    managed: (address?: string) => ['integrator', 'managed', address].filter(Boolean),
  },
}
