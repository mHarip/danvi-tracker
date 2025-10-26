import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const sleep = await prisma.sleep.findMany({
            orderBy: { createdAt: "desc" },
        });
        return Response.json(sleep);
    } catch (err) {
        console.error("Sleep fetch error:", err);
        return Response.json([], { status: 200 });
    }
}

export async function POST(req) {
    const data = await req.json();
    const sleep = await prisma.sleep.create({
        data: {
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
        },
    });
    return Response.json(sleep);
}