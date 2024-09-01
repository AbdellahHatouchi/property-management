import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { propertySchema } from "@/schema";
import { PropertyType } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/properties/{propertyId}:
 *   patch:
 *     summary: Update an existing property for a business
 *     description: Updates the details of an existing property and its associated units. The property must be associated with the authenticated user's business.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: "property-id-123"
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
 *                 example: 120.00
 *               monthlyRentalCost:
 *                 type: number
 *                 example: 3500.00
 *               units:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     number:
 *                       type: string
 *                       example: "102"
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *               type:
 *                 type: string
 *                 enum: [Residential, Commercial, Industrial]
 *                 example: "Commercial"
 *     responses:
 *       200:
 *         description: Successfully updated the property and its units.
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
 *                   example: 120.00
 *                 monthlyRentalCost:
 *                   type: number
 *                   example: 3500.00
 *                 type:
 *                   type: string
 *                   example: "Commercial"
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
 *                         example: "102"
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
 *       404:
 *         description: Property or business not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
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
export async function PATCH(
    req: Request,
    { params }: { params: { businessId: string; propertyId: string } }
) {
    try {
        const user = await UserAuth();

        const body = await req.json();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        const validateFields = propertySchema.safeParse(body);
        console.log(validateFields.error?.errors);

        if (!validateFields.success) {
            return new NextResponse("Invalid Property Data!", { status: 400 });
        }

        const {
            name,
            address,
            dailyRentalCost,
            monthlyRentalCost,
            units,
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

        if (!params.propertyId) {
            return new NextResponse("Property id is required", { status: 400 });
        }

        const propertyById = await db.property.findUnique({
            where: {
                id: params.propertyId,
                businessId: params.businessId,
            },
        });

        if (!propertyById) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updatedProperty = await db.$transaction(async (tx) => {
            // Step 1: update the property itself
            const property = await tx.property.update({
                where: {
                    id: params.propertyId,
                    businessId: params.businessId,
                },
                data: {
                    name,
                    type: type as PropertyType,
                    dailyRentalCost,
                    monthlyRentalCost,
                    businessId: params.businessId,
                    address,
                },
            });
            if (property) {
                // Step 2: Delete all units associated with the property
                await tx.unit.deleteMany({
                    where: {
                        propertyId: params.propertyId,
                    },
                });
                // Step 3: create all new units associated with the property
                await tx.unit.createMany({
                    data: units.map((unit) => ({
                        propertyId: params.propertyId,
                        number: unit.number,
                        isAvailable: unit.isAvailable,
                    })),
                });
            }
            return property;
        });

        if (!updatedProperty) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(updatedProperty);
    } catch (error) {
        console.log("[PROPERTY_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

/**
 * @swagger
 * /api/{businessId}/properties/{propertyId}:
 *   delete:
 *     summary: Delete a property and its associated units and rentals
 *     description: Deletes a property, along with all units and rentals associated with it, for a specific business. The property must be associated with the authenticated user's business.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: "property-id-123"
 *     responses:
 *       200:
 *         description: Successfully deleted the property along with its associated units and rentals.
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
 *                   example: 120.00
 *                 monthlyRentalCost:
 *                   type: number
 *                   example: 3500.00
 *                 type:
 *                   type: string
 *                   example: "Commercial"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Business ID or Property ID is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       404:
 *         description: Property or business not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
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
export async function DELETE(
    _req: Request,
    { params }: { params: { businessId: string; propertyId: string } }
) {
    try {
        const user = await UserAuth();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

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

        if (!params.propertyId) {
            return new NextResponse("Property id is required", { status: 400 });
        }
        const deletedProperty = await db.$transaction(async (tx) => {
            // Step 1: Delete the property itself
            const property = await tx.property.delete({
                where: {
                    id: params.propertyId,
                    businessId: params.businessId,
                },
            });

            if (property) {
                // Step 2: Delete all units associated with the property
                await tx.unit.deleteMany({
                    where: {
                        propertyId: params.propertyId,
                    },
                });
                // Step 3: Delete all rental associated with the property
                await tx.rentalProperty.deleteMany({
                    where: {
                        propertyId: params.propertyId,
                    },
                });
            }
            return property;
        });

        if (!deletedProperty) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(deletedProperty);
    } catch (error) {
        console.log("[PROPERTY_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
