import { DsmOrgViewer } from './DsmOrgViewer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DSM-Org v1.0 | מדריך אבחוני קליני | COR-SYS',
  description: 'DSM-Org Clinical Reference — COR-SYS',
}

export default function DsmOrgPage() {
  return <DsmOrgViewer />
}
