export const ENTERPRISE22_TABLES = Object.freeze({
  probe: 'wae_enterprise22_connection_probe',
  tenants: 'wae_enterprise22_tenants',
  members: 'wae_enterprise22_members',
  companies: 'wae_enterprise22_companies',
  departmentState: 'wae_enterprise22_department_state',
  conversations: 'wae_enterprise22_conversations',
  messages: 'wae_enterprise22_messages',
} as const)

export type DatabaseConnectionState =
  | { status: 'connected'; serviceName: string; schemaVersion: number }
  | { status: 'unconfigured'; detail: string }
  | { status: 'error'; detail: string }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

function restUrl(table: string, query: string) {
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL no está configurada')
  return `${supabaseUrl}/rest/v1/${table}?${query}`
}

function publicHeaders() {
  if (!publishableKey) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY no está configurada')
  return {
    apikey: publishableKey,
    Accept: 'application/json',
  }
}

/**
 * Connectivity check intentionally restricted to the isolated, non-sensitive
 * Enterprise 22 probe table. It never queries shared WAE tables.
 */
export async function checkEnterprise22Database(): Promise<DatabaseConnectionState> {
  if (!supabaseUrl || !publishableKey) {
    return { status: 'unconfigured', detail: 'Conexión de base de datos no configurada' }
  }

  try {
    const response = await fetch(
      restUrl(ENTERPRISE22_TABLES.probe, 'select=service_name,schema_version&singleton=eq.true&limit=1'),
      { headers: publicHeaders(), method: 'GET', cache: 'no-store' },
    )

    if (!response.ok) {
      return { status: 'error', detail: `Supabase respondió HTTP ${response.status}` }
    }

    const rows = await response.json() as Array<{ service_name?: string; schema_version?: number }>
    const row = rows[0]
    if (!row) return { status: 'error', detail: 'Probe aislado sin respuesta' }

    return {
      status: 'connected',
      serviceName: row.service_name ?? 'WAE OS Enterprise 22',
      schemaVersion: Number(row.schema_version ?? 1),
    }
  } catch (error) {
    return {
      status: 'error',
      detail: error instanceof Error ? error.message : 'Error desconocido de conexión',
    }
  }
}

/**
 * Guardrail for authenticated persistence. All Enterprise22 persistence must
 * resolve through this explicit allow-list; shared WAE tables are rejected.
 */
export function assertEnterprise22Table(table: string) {
  const allowed = Object.values(ENTERPRISE22_TABLES) as string[]
  if (!allowed.includes(table)) {
    throw new Error(`Acceso bloqueado fuera del namespace WAE Enterprise 22: ${table}`)
  }
  return table
}
