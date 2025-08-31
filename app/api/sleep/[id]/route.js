import {NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, context) {
    const {id} = await context.params;

    try {
        await prisma.Sleep.delete({
            where: {id: parseInt(id, 10)}
        });
        return NextResponse.json({success: true}, {status: 200});
    } catch (error) {
        console.error("Error deleting sleep record:", error);
        return NextResponse.json({error: "Failed to delete sleep record"}, {status: 500});
    }
}