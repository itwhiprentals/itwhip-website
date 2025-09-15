// app/sys-2847/fleet/layout.tsx
export default function FleetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Parent layout handles theme and auth
  // This is just a pass-through
  return <>{children}</>
}