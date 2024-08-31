import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { calculateAmount } from "@/lib/utils";
import { RentalPropertySchema } from "@/schema";
import { PropertyType } from "@prisma/client";
import { NextResponse } from "next/server";

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
        const validateFields = RentalPropertySchema.safeParse(body);

        if (!validateFields.success) {
            return new NextResponse("Invalid Rental Data!", { status: 400 });
        }

        const {
            propertyId,
            rentalDateRange,
            rentalNumber,
            rentalType,
            tenantId,
            unit,
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

        const propertyById = await db.property.findUnique({
            where: {
                id: propertyId,
                businessId: params.businessId,
            },
            include: {
                units: true,
            },
        });

        if (!propertyById) {
            return new NextResponse("Property Not Found", { status: 404 });
        }

        const foundUnit = propertyById.units.find((u) => u.number === unit);

        if (!foundUnit) {
            return new NextResponse("Unit Not Found", { status: 404 });
        }
        if (!foundUnit.isAvailable) {
            return new NextResponse("Unit Not Available", { status: 400 });
        }

        const tenantById = await db.tenant.findUnique({
            where: {
                id: tenantId,
                businessId: params.businessId,
            },
        });

        if (!tenantById) {
            return new NextResponse("Tenant Not Found", { status: 400 });
        }

        const rentalCost =
            rentalType === "Daily"
                ? propertyById.dailyRentalCost
                : propertyById.monthlyRentalCost;

        const totalAmount = calculateAmount({
            dailyRentalCost: propertyById.dailyRentalCost,
            dateRange: rentalDateRange,
            monthlyRentalCost: propertyById.monthlyRentalCost,
            rentalType,
        });

        if (!totalAmount) {
            return new NextResponse("Invalid data!", { status: 404 });
        }

        const rental = await db.$transaction(async (tx) => {
            // Step 1: create rental property
            const rental = await tx.rentalProperty.create({
                data: {
                    propertyId,
                    tenantId,
                    rentalCost,
                    rentalNumber,
                    unit,
                    totalAmount,
                    startDate: rentalDateRange.from,
                    endDate: rentalDateRange.to,
                    businessId: params.businessId,
                },
            });
            // Step 2: update unit associated with the property in rental
            await tx.unit.updateMany({
                where: {
                    number: unit,
                    propertyId,
                },
                data: {
                    isAvailable: false,
                },
            });
            // Step 3: update property
            const numberOfUnitAvailable = propertyById.units.filter(
                (u) => u.isAvailable
            );
            if (numberOfUnitAvailable.length === 1) {
                await tx.property.update({
                    where: {
                        id: propertyId,
                    },
                    data: {
                        isAvailable: false,
                    },
                });
            }

            return rental;
        });

        return NextResponse.json(rental);
    } catch (error) {
        console.log("[RENTAL_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

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

        const rentals = await db.rentalProperty.findMany({
            where: {
                businessId: params.businessId,
            },
        });

        return NextResponse.json(rentals);
    } catch (error) {
        console.log("[PROPERTY_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
