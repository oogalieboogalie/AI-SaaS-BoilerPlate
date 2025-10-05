import { createClient } from '@supabase/supabase-js'
import { Database, Json } from '@/types/supabase'

// Ensure these are set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a special Supabase client that uses the service role key
const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
)

type AuditLogAction = Database['public']['Enums']['audit_log_action']

type CreateAuditLogParams = {
  teamId: string
  userId?: string
  action: AuditLogAction
  details?: Json
}

/**
 * Creates an audit log entry.
 * This should only be called from server-side code.
 *
 * @param {CreateAuditLogParams} params - The parameters for the audit log entry.
 * @returns {Promise<void>}
 */
export async function createAuditLog({
  teamId,
  userId,
  action,
  details,
}: CreateAuditLogParams): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      team_id: teamId,
      user_id: userId,
      action,
      details,
    })

    if (error) {
      console.error('Failed to create audit log:', error)
      // Depending on the use case, you might want to throw the error
      // or handle it silently. For now, we'll just log it.
    }
  } catch (err) {
    console.error('An unexpected error occurred while creating audit log:', err)
  }
}
