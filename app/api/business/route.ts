import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const user = session?.user
        const body = await req.json();

        const { name } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const business = await db.business.create({
            data: {
                name,
                userId: user.id,
            },
        });

        return NextResponse.json(business);
    } catch (error) {
        console.log("[BUSINESS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
