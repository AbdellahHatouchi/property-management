import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Create a new business
 *     description: Creates a new business associated with the authenticated user.
 *     requestBody:
 *       description: Business data to create.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My New Business"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Business created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "business-id-123"
 *                 name:
 *                   type: string
 *                   example: "My New Business"
 *                 userId:
 *                   type: string
 *                   example: "user-id-123"
 *       400:
 *         description: Bad request, name is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Name is required"
 *       403:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
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
