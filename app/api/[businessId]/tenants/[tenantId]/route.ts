import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { tenantSchema } from "@/schema";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { businessId: string; tenantId: string } }
) {
    try {
        const user = await UserAuth();

        const body = await req.json();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        const validateFields = tenantSchema.safeParse(body);
        console.log(validateFields.error?.errors);

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

        if (!params.tenantId) {
            return new NextResponse("Tenant id is required", { status: 400 });
        }

        const tenantById = await db.tenant.findUnique({
            where: {
                id: params.tenantId,
                businessId: params.businessId,
            },
        });

        if (!tenantById) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const tenant = await db.tenant.update({
            where: {
                id: params.tenantId,
            },
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
        console.log("[TENANT_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { businessId: string; tenantId: string } }
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

        if (!params.tenantId) {
            return new NextResponse("Tenant id is required", { status: 400 });
        }
        const deletedTenant = await db.$transaction(async (tx) => {
            const tenant = await tx.tenant.delete({
                where: {
                    id: params.tenantId,
                    businessId: params.businessId,
                },
            });
            if (tenant) {
                await tx.rentalProperty.deleteMany({
                    where:{
                        tenantId: tenant.id,
                    }
                })
            }
            return tenant;
        });

        if (!deletedTenant) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(deletedTenant);
    } catch (error) {
        console.log("[TENANT_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
