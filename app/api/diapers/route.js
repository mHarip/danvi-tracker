import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const diapers = await prisma.diaper.findMany({
            orderBy: { createdAt: "desc" },
        });
        return Response.json(diapers);
    } catch (err) {
        console.error("Diapers fetch error:", err);
        return Response.json([], { status: 200 });
    }
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