import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const diapers = await prisma.diaper.findMany({orderBy: {createdAt: "desc"}});
    return Response.json(diapers);
}

export async function POST(req) {
    const data = await req.json();
    const diaper = await prisma.diaper.create({
        data: {
            type: data.type,
            time: data.time ? new Date(data.time) : new Date(),
        },
    });
    return Response.json(diaper);
}