import { redirect } from 'next/navigation'

export default function SubcontractorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Root subcontractors layout - redirect base path to login
  redirect('/subcontractors/login')
}
