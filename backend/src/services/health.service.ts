/**
 * Data returned by the health-check endpoint.
 * Used by monitoring tools and orchestrators.
 */
export interface HealthStatus {
  status: string;
  service: string;
}

/**
 * Returns the current health status of the Taska API.
 *
 * In the future this can be extended to check:
 *  - Database connectivity (`await prisma.$queryRaw\`SELECT 1\``)
 *  - Redis / cache reachability
 *  - External service availability
 */
export const getHealthStatus = async (): Promise<HealthStatus> => {
  return {
    status: 'ok',
    service: 'Taska API',
  };
};
