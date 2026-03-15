import { createClient } from '@/lib/supabase/server'
import type { ClientBusinessPlan } from '@/types/database'

export async function getPlanByClientId(clientId: string): Promise<ClientBusinessPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('client_business_plans').select('*').eq('client_id', clientId).maybeSingle()
  if (error) {
    console.error('[data/plans] getPlanByClientId', clientId, error.message)
    return null
  }
  return data
}
