import { DsmOrgViewer } from './DsmOrgViewer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DSM-Org v1.0 | מדריך אבחוני קליני | COR-SYS',
  description: 'מסגרת קלינית לאבחון, סיווג, והתערבות בכשלים ארגוניים מבניים — COR-SYS Clinical Reference',
}

export default function DsmOrgPage() {
  return <DsmOrgViewer />
}
