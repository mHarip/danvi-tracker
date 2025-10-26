import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, {params}) {
    const id = parseInt(params.id);
    const data = await req.json();
    const updated = await prisma.diaper.update({
        where: {id},
        data: {
            type: data.type,
            time: data.time ? new Date(data.time) : null,
        },
    });
    return Response.json(updated);
}

export async function DELETE(req, {params}) {
    const id = parseInt(params.id);
    await prisma.diaper.delete({where: {id}});
    return Response.json({success: true});
}

export async function GET(req, {params}) {
    const id = parseInt(params.id);
    const record = await prisma.diaper.findUnique({where: {id}});
    return Response.json(record);
}