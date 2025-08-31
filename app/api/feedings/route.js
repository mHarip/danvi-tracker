import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const feedings = await prisma.feeding.findMany({orderBy: {createdAt: "desc"}});
    return Response.json(feedings);
}

export async function POST(req) {
    const data = await req.json();
    const feeding = await prisma.feeding.create({
        data: {
            type: data.type,
            amount: data.amount || null,
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
        },
    });
    return Response.json(feeding);
}