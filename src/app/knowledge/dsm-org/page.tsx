import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function DsmOrgPage() {
  redirect('/knowledge/dsm-v2')
}
