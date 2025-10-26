import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma";

export async function PUT(req, {params}) {
    try {
        const {id} = params;
        const data = await req.json();

        const updated = await prisma.belt.update({
            where: {id: parseInt(id)},
            data: {
                startTime: data.startTime ? new Date(data.startTime) : null,
                endTime: data.endTime ? new Date(data.endTime) : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Belt update error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

export async function DELETE(req, {params}) {
    try {
        const {id} = params;
        await prisma.belt.delete({where: {id: parseInt(id)}});
        return NextResponse.json({message: "Belt record deleted"});
    } catch (error) {
        console.error("Delete belt error:", error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}