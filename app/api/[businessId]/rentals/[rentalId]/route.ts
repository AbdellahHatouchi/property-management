import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/rentals/{rentalId}:
 *   delete:
 *     summary: Delete a rental property
 *     description: Deletes a rental property for a given business. The business must belong to the authenticated user. Also updates the availability status of the associated unit and property.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: rentalId
 *         required: true
 *         schema:
 *           type: string
 *           example: "rental-id-123"
 *     responses:
 *       200:
 *         description: Successfully deleted the rental property and updated associated units and property.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "rental-id-123"
 *                 propertyId:
 *                   type: string
 *                   example: "property-id-123"
 *                 tenantId:
 *                   type: string
 *                   example: "tenant-id-123"
 *                 rentalCost:
 *                   type: number
 *                   example: 500.00
 *                 rentalNumber:
 *                   type: string
 *                   example: "R123456"
 *                 unit:
 *                   type: string
 *                   example: "A1"
 *                 totalAmount:
 *                   type: number
 *                   example: 1500.00
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-01"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-31"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *                 settled:
 *                   type: boolean
 *                   example: false
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Missing or invalid business or rental ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       404:
 *         description: Rental property or associated records not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
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
    { params }: { params: { businessId: string; rentalId: string } }
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

        if (!params.rentalId) {
            return new NextResponse("Rental id is required", { status: 400 });
        }
        const deletedRental = await db.$transaction(async (tx) => {
            // Step 1: Delete the rental itself
            const rental = await tx.rentalProperty.delete({
                where: {
                    id: params.rentalId,
                    businessId: params.businessId,
                },
            });

            if (rental) {
                const updateUnits = await tx.unit.updateMany({
                    where: {
                        number: rental.unit,
                        propertyId: rental.propertyId,
                    },
                    data: {
                        isAvailable: true,
                    },
                });
                const numberOfUnitUpdated = updateUnits.count;
                if (numberOfUnitUpdated === 1) {
                    const units = await tx.unit.findMany({
                        where: {
                            propertyId: rental.propertyId,
                        },
                    });
                    // Step 3: update property
                    const numberOfUnitAvailable = units.filter(
                        (u) => u.isAvailable
                    );
                    if (numberOfUnitAvailable.length === 1) {
                        await tx.property.update({
                            where: {
                                id: rental.propertyId,
                            },
                            data: {
                                isAvailable: true,
                            },
                        });
                    }
                }
            }
            return rental;
        });

        if (!deletedRental) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(deletedRental);
    } catch (error) {
        console.log("[PROPERTY_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
/**
 * @swagger
 * /api/{businessId}/rentals/{rentalId}:
 *   put:
 *     summary: Mark a rental property as settled
 *     description: Updates the status of a rental property to 'settled' and records the date of payment. The business must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: rentalId
 *         required: true
 *         schema:
 *           type: string
 *           example: "rental-id-123"
 *     responses:
 *       200:
 *         description: Successfully marked the rental property as settled and updated the date of payment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "rental-id-123"
 *                 propertyId:
 *                   type: string
 *                   example: "property-id-123"
 *                 tenantId:
 *                   type: string
 *                   example: "tenant-id-123"
 *                 rentalCost:
 *                   type: number
 *                   example: 500.00
 *                 rentalNumber:
 *                   type: string
 *                   example: "R123456"
 *                 unit:
 *                   type: string
 *                   example: "A1"
 *                 totalAmount:
 *                   type: number
 *                   example: 1500.00
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-01"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-31"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *                 settled:
 *                   type: boolean
 *                   example: true
 *                 datePaid:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-08-31T12:34:56Z"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Missing or invalid business or rental ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       404:
 *         description: Rental property not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
export async function PUT(
    _req: Request,
    { params }: { params: { businessId: string; rentalId: string } }
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

        if (!params.rentalId) {
            return new NextResponse("Rental id is required", { status: 400 });
        }

        const rental = await db.rentalProperty.update({
            where: {
                id: params.rentalId,
                businessId: params.businessId,
            },
            data: {
                settled: true,
                datePaid: new Date(),
            },
        });

        if (!rental) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(rental);
    } catch (error) {
        console.log("[PROPERTY_PUT]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}