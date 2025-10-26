import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, {params}) {
    const id = parseInt(params.id);
    const data = await req.json();

    const updated = await prisma.feeding.update({
        where: {id},
        data: {
            type: data.type,
            amount: data.amount ? parseFloat(data.amount) : null,
            side: data.side || null,
            startTime: data.startTime ? new Date(data.startTime) : null,
            endTime: data.endTime ? new Date(data.endTime) : null,
        },
    });
    return Response.json(updated);
}

export async function DELETE(req, {params}) {
    const id = parseInt(params.id);
    await prisma.feeding.delete({where: {id}});
    return Response.json({success: true});
}

export async function GET(req, {params}) {
    const id = parseInt(params.id);
    const record = await prisma.feeding.findUnique({where: {id}});
    return Response.json(record);
}