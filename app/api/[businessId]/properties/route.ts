import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { propertySchema } from "@/schema";
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
