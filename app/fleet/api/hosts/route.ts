// app/sys-2847/fleet/api/hosts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
 try {
   const hosts = await prisma.rentalHost.findMany({
     orderBy: {
       name: 'asc'
     }
   })

   return NextResponse.json({
     success: true,
     data: hosts
   })
 } catch (error) {
   console.error('Error fetching hosts:', error)
   return NextResponse.json(
     { 
       success: false,
       error: 'Failed to fetch hosts' 
     },
     { status: 500 }
   )
 }
}