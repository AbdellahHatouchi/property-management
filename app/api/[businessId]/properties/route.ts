import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { propertySchema } from "@/schema";
import { PropertyType } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/properties:
 *   post:
 *     summary: Create a new property for a business
 *     description: Adds a new property associated with the given business ID. The property must be associated with the authenticated user's business.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sunset Villa"
 *               address:
 *                 type: string
 *                 example: "123 Sunset Blvd, Los Angeles, CA"
 *               dailyRentalCost:
 *                 type: number
 *                 example: 100.00
 *               monthlyRentalCost:
 *                 type: number
 *                 example: 3000.00
 *               units:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     number:
 *                       type: string
 *                       example: "101"
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *               type:
 *                 type: string
 *                 enum: [Residential, Commercial, Industrial]
 *                 example: "Residential"
 *     responses:
 *       200:
 *         description: Successfully created the new property.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "property-id-123"
 *                 name:
 *                   type: string
 *                   example: "Sunset Villa"
 *                 address:
 *                   type: string
 *                   example: "123 Sunset Blvd, Los Angeles, CA"
 *                 dailyRentalCost:
 *                   type: number
 *                   example: 100.00
 *                 monthlyRentalCost:
 *                   type: number
 *                   example: 3000.00
 *                 type:
 *                   type: string
 *                   example: "Residential"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *                 units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "unit-id-123"
 *                       number:
 *                         type: string
 *                         example: "101"
 *                       isAvailable:
 *                         type: boolean
 *                         example: true
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Invalid property data or business ID is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid Property Data!"
 *       405:
 *         description: Unauthorized access to the business.
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
export async function POST(
    req: Request,
    { params }: { params: { businessId: string } }
) {
    try {
        const user = await UserAuth();

        const body = await req.json();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }
        const validateFields = propertySchema.safeParse(body);

        if (!validateFields.success) {
            return new NextResponse("Invalid Property Data!", { status: 400 });
        }

        const {
            name,
            address,
            dailyRentalCost,
            monthlyRentalCost,
            units: propertyUnits,
            type,
        } = validateFields.data;

        if (!params.businessId) {
            return new NextResponse("Business id is required", { status: 400 });
        }

        const businessByUserId = await db.business.findFirst({
            where: {
                id: params.businessId,
                userId: user.id,
            },
        });

        if (!businessByUserId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        const property = await db.property.create({
            data: {
                name,
                type: type as PropertyType,
                dailyRentalCost,
                monthlyRentalCost,
                businessId: params.businessId,
                address,
                units: {
                    createMany: {
                        data: propertyUnits,
                    },
                },
            },
        });

        return NextResponse.json(property);
    } catch (error) {
        console.log("[PROPERTY_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

/**
 * @swagger
 * /api/{businessId}/properties:
 *   get:
 *     summary: Retrieve properties for a business
 *     description: Fetches all properties associated with the given business ID. The business must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of properties.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "property-id-123"
 *                   name:
 *                     type: string
 *                     example: "Sunset Villa"
 *                   address:
 *                     type: string
 *                     example: "123 Sunset Blvd, Los Angeles, CA"
 *                   dailyRentalCost:
 *                     type: number
 *                     example: 100.00
 *                   monthlyRentalCost:
 *                     type: number
 *                     example: 3000.00
 *                   isAvailable:
 *                     type: boolean
 *                     example: true
 *                   businessId:
 *                     type: string
 *                     example: "business-id-123"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Business ID is required or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
export async function GET(
    _req: Request,
    { params }: { params: { businessId: string } }
) {
    try {
        const user = await UserAuth();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!params.businessId) {
            return new NextResponse("Business id is required", { status: 400 });
        }

        const propertys = await db.property.findMany({
            where: {
                businessId: params.businessId,
            },
        });

        return NextResponse.json(propertys);
    } catch (error) {
        console.log("[PROPERTY_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
