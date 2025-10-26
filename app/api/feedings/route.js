import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const feedings = await prisma.feeding.findMany({
            orderBy: {createdAt: "desc"},
            select: {
                id: true,
                type: true,
                amount: true,
                side: true,
                startTime: true,
                endTime: true,
                createdAt: true,
            },
        });
        return Response.json(feedings);
    } catch (error) {
        console.error("Error fetching feedings:", error);
        return Response.json({error: error.message}, {status: 500});
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const {type, amount, startTime, endTime} = data;

        // For breast feedings, store the side value instead of numeric amount
        const feeding = await prisma.feeding.create({
            data: {
                type,
                amount: type === "breast" ? null : amount ? parseFloat(amount) : null,
                side: type === "breast" ? amount : null,
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null,
            },
        });

        return Response.json(feeding);
    } catch (error) {
        console.error("Error creating feeding:", error);
        return Response.json({error: error.message}, {status: 500});
    }
}