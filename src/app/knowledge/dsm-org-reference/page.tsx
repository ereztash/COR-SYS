import { redirect } from 'next/navigation'

/**
 * DSM-Org Reference — redirects to the main DSM-Org knowledge page.
 * Original page removed due to persistent encoding pipeline issue
 * with Hebrew text from dsm-org-taxonomy.ts imports.
 */
export default function DsmOrgReferencePage() {
  redirect('/knowledge/dsm-org')
}
