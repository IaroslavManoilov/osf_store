import type { H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

export type AuditLogInput = {
  actor: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, unknown> | null
}

export const writeAdminAuditLog = async (event: H3Event, payload: AuditLogInput) => {
  const supabase = getSupabaseAdmin(event)

  const { error } = await supabase
    .from('admin_audit_log')
    .insert({
      actor: String(payload.actor || 'admin').trim() || 'admin',
      action: String(payload.action || 'unknown').trim() || 'unknown',
      target_type: payload.targetType ? String(payload.targetType).trim() : null,
      target_id: payload.targetId ? String(payload.targetId).trim() : null,
      details: payload.details || null
    })

  // Do not break main flow if audit table not initialized yet.
  if (error) {
    const message = String(error.message || '').toLowerCase()
    if (message.includes('relation') && message.includes('admin_audit_log')) return
    if (message.includes('does not exist')) return
  }
}

export const readAdminAuditLog = async (event: H3Event, limit = 150) => {
  const supabase = getSupabaseAdmin(event)
  const safeLimit = Math.max(1, Math.min(500, Math.floor(Number(limit) || 150)))

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, created_at, actor, action, target_type, target_id, details')
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    const message = String(error.message || '').toLowerCase()
    if ((message.includes('relation') && message.includes('admin_audit_log')) || message.includes('does not exist')) {
      return []
    }
    throw error
  }

  return Array.isArray(data) ? data : []
}

