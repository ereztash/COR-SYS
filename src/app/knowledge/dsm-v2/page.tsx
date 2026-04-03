import { DsmOrgViewer } from '../dsm-org/DsmOrgViewer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DSM-Org v1.0 | \u05DE\u05D3\u05E8\u05D9\u05DA \u05D0\u05D1\u05D7\u05D5\u05E0\u05D9 \u05E7\u05DC\u05D9\u05E0\u05D9 | COR-SYS',
  description: 'DSM-Org Clinical Reference \u2014 COR-SYS',
}

export default function DsmOrgV2Page() {
  return <DsmOrgViewer />
}
