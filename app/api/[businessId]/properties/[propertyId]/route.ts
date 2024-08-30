import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { propertySchema } from "@/schema";
import { PropertyType } from "@prisma/client";
import { NextResponse } from "next/server";

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
            // Step 2: Delete the property itself
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
