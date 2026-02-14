// app/layout.tsx
// Minimal root layout — no html/body tags
// html/body are in [locale]/layout.tsx (guest pages) and portal layouts (admin/fleet/partner)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
