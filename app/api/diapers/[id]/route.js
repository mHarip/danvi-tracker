import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function DELETE(request, {params}) {
    try {
        const {id} = params;

        await prisma.Diaper.delete({
            where: {id: parseInt(id, 10)}
        });

        return NextResponse.json({success: true}, {status: 200});
    } catch (error) {
        console.error(`Error deleting Diaper with id ${params?.id}:`, error);
        return NextResponse.json(
            {error: "Failed to delete Diaper"},
            {status: 500}
        );
    }
}