import { db } from "@/database/db";
import { pdfDetailTable } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const res = await db.select().from(pdfDetailTable).where(eq(pdfDetailTable.userId, userId)).orderBy(desc(pdfDetailTable.updatedAt));;
        console.log("Res", res);

        return NextResponse.json(res)
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Failed To get Previous Chat History",
        }, { status: 500 })
    }
}