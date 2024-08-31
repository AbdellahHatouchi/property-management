import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { NextResponse } from "next/server";

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