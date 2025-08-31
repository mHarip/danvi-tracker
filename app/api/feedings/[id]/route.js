import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function DELETE(request, {params}) {
    try {
        const {id} = await params;

        await prisma.Feeding.delete({
            where: {id: parseInt(id, 10)}
        });

        return NextResponse.json({success: true}, {status: 200});
    } catch (error) {
        console.error("Error deleting feeding:", error);
        return NextResponse.json(
            {error: "Failed to delete feeding"},
            {status: 500}
        );
    }
}