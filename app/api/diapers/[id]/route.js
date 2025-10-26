import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma";

export async function PUT(req, {params}) {
    try {
        const {id} = params;
        const data = await req.json();

        const updated = await prisma.diaper.update({
            where: {id: parseInt(id)},
            data: {
                type: data.type,
                time: data.time ? new Date(data.time) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Diaper update error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function DELETE(req, {params}) {
    try {
        const {id} = params;
        await prisma.diaper.delete({where: {id: parseInt(id)}});
        return NextResponse.json({message: "Diaper deleted"});
    } catch (error) {
        console.error("Delete diaper error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}