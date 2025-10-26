import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma";

export async function PUT(req, {params}) {
    try {
        const {id} = params;
        const data = await req.json();

        const updated = await prisma.feeding.update({
            where: {id: parseInt(id)},
            data: {
                type: data.type,
                side: data.side || null,
                amount: data.amount ? parseFloat(data.amount) : null,
                startTime: data.startTime ? new Date(data.startTime) : null,
                endTime: data.endTime ? new Date(data.endTime) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Feeding update error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function DELETE(req, {params}) {
    try {
        const {id} = params;
        await prisma.feeding.delete({where: {id: parseInt(id)}});
        return NextResponse.json({message: "Feeding deleted"});
    } catch (error) {
        console.error("Delete feeding error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}