import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const feedings = await prisma.feeding.findMany({
            orderBy: { createdAt: "desc" },
        });
        return Response.json(feedings);
    } catch (err) {
        console.error("Feedings fetch error:", err);
        return Response.json([], { status: 200 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const {type, amount, side, startTime, endTime} = data;

        const feeding = await prisma.feeding.create({
            data: {
                type,
                amount: type === "breast" ? null : amount ? parseFloat(amount) : null,
                side: type === "breast" ? side || null : null,
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