import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { tenantSchema } from "@/schema";
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
        const validateFields = tenantSchema.safeParse(body);

        if (!validateFields.success) {
            return new NextResponse("Invalid Tenant Data!", { status: 400 });
        }

        const {
            cinOrPassport,
            name,
            address,
            dateOfBirth,
            email,
            isTourist,
            phoneNumber,
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

        const tenant = await db.tenant.create({
            data: {
                cinOrPassport,
                email,
                name,
                isTourist,
                phoneNumber,
                businessId: params.businessId,
                address,
                dateOfBirth: new Date(dateOfBirth),
            },
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.log("[TENANTS_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
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

        const tenants = await db.tenant.findMany({
            where: {
                businessId: params.businessId,
            },
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.log("[TENANTS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
