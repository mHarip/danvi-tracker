import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const belt = await prisma.belt.findMany({orderBy: {createdAt: "desc"}});
    return Response.json(belt);
}

export async function POST(req) {
    const data = await req.json();
    const belt = await prisma.belt.create({
        data: {
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
        },
    });
    return Response.json(belt);
}