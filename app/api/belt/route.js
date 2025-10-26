import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const belt = await prisma.belt.findMany({
            orderBy: { createdAt: "desc" },
        });
        return Response.json(belt);
    } catch (err) {
        console.error("Belt fetch error:", err);
        return Response.json([], { status: 200 }); // return empty array instead of error object
    }
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