// app/admin/dashboard/components/tabs/MessagesTab.tsx
'use client'

import MessageCenter from '@/app/admin/messages/MessageCenter'

export default function MessagesTab() {
  return <MessageCenter embedded={true} />
}