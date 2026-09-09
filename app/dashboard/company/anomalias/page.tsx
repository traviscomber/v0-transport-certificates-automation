import { redirect } from 'next/navigation'

export default function AnomaliesRedirect() {
  // Redirect to main dashboard where all alerts are now consolidated
  redirect('/dashboard/company')
}
