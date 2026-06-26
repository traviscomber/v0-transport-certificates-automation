import { redirect } from 'next/navigation'

// Prevent static generation - this page performs a redirect at request time
export const dynamic = 'force-dynamic'

export default function TransportistaPage() {
  redirect('/dashboard/company')
}
