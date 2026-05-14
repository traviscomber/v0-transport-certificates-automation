'use server'

import { redirect } from 'next/navigation'

export default function SubcontractorsPage() {
  // Redirect to login page for subcontractors
  redirect('/subcontractors/login')
}
