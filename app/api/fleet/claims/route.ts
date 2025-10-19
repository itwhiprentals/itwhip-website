// app/api/fleet/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// GET /api/fleet/claims - List all claims with filters (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const hostId = searchParams.get('hostId');
    const bookingId = searchParams.get('bookingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (hostId) where.hostId = hostId;
    if (bookingId) where.bookingId = bookingId;

    // Get claims with relations
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          booking: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              guestName: true,
              guestEmail: true
            }
          },
          policy: {
            select: {
              id: true,
              tier: true,
              policyNumber: true,
              provider: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // Pending first
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.claim.count({ where })
    ]);

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}