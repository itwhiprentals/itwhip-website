// app/partner/fleet/add/page.tsx
// Partner Fleet - Add Vehicle page (thin wrapper for AddCarWizard)
'use client'

import AddCarWizard from './AddCarWizard'

export default function PartnerFleetAddPage() {
  return <AddCarWizard mode="standalone" />
}
