import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;

        // We can use the 'id' param as either the direct DB ID (UUID) or plateNumber
        // Let's first try to find by ID
        const { id } = resolvedParams;

        let log = await prisma.vehicleLog.findUnique({
            where: { id },
        });

        if (!log) {
            // Trying to find the most recent log by Plate Number if ID was actually a plate number
            log = await prisma.vehicleLog.findFirst({
                where: {
                    plateNumber: id,
                    exitTime: null, // Only close open entries
                },
                orderBy: {
                    entryTime: 'desc',
                },
            });
        }

        if (!log) {
            return NextResponse.json({ error: 'Log not found or already exited' }, { status: 404 });
        }

        const updatedLog = await prisma.vehicleLog.update({
            where: { id: log.id },
            data: {
                exitTime: new Date(),
            },
        });

        return NextResponse.json(updatedLog);
    } catch (error) {
        console.error('Error exiting log:', error);
        return NextResponse.json({ error: 'Failed to update exit time' }, { status: 500 });
    }
}
