// app/(guest)/payments/page.tsx
import { redirect } from 'next/navigation'

export default function PaymentsPage() {
  redirect('/payments/methods')
}
