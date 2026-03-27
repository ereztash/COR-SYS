import { DsmOrgViewer } from './DsmOrgViewer'

export const revalidate = 3600

export const metadata = {
  title: 'DSM-Org v1.0 | מדריך אבחוני קליני | COR-SYS',
  description: 'מסגרת קלינית לאבחון, סיווג, והתערבות בכשלים ארגוניים מבניים — COR-SYS Clinical Reference',
}

export default function DsmOrgPage() {
  return <DsmOrgViewer />
}
