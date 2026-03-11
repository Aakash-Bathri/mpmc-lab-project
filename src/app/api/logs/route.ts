import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const logs = await prisma.vehicleLog.findMany({
            orderBy: {
                entryTime: 'desc',
            },
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { plateNumber, ownerName, drivingLicense, isNITTExempt } = body;

        if (!plateNumber) {
            return NextResponse.json({ error: 'Plate number is required' }, { status: 400 });
        }

        // Check if the vehicle is currently inside the campus
        const activeLog = await prisma.vehicleLog.findFirst({
            where: {
                plateNumber: plateNumber.toUpperCase(),
                exitTime: null,
            },
            orderBy: {
                entryTime: 'desc',
            },
        });

        if (activeLog) {
            // Vehicle is inside, so this scan is an EXIT
            const updatedLog = await prisma.vehicleLog.update({
                where: { id: activeLog.id },
                data: { exitTime: new Date() },
            });
            return NextResponse.json({ type: 'EXIT', log: updatedLog }, { status: 200 });
        }

        // Vehicle not found or already exited, this scan is an ENTRY
        const newLog = await prisma.vehicleLog.create({
            data: {
                plateNumber: plateNumber.toUpperCase(),
                ownerName,
                drivingLicense,
                isNITTExempt: isNITTExempt || false,
            },
        });

        return NextResponse.json({ type: 'ENTRY', log: newLog }, { status: 201 });
    } catch (error) {
        console.error('Error creating log:', error);
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
    }
}
