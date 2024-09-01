import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { tenantSchema } from "@/schema";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/tenants/{tenantId}:
 *   patch:
 *     summary: Update tenant information
 *     description: Updates information for a specific tenant within a given business. The business must belong to the authenticated user, and the tenant must be associated with the specified business.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           example: "tenant-id-123"
 *     requestBody:
 *       description: Updated tenant data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cinOrPassport:
 *                 type: string
 *                 example: "C1234567"
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               address:
 *                 type: string
 *                 example: "123 Main St, Anytown, AT 12345"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tenant@example.com
 *               isTourist:
 *                 type: boolean
 *                 example: false
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *             required:
 *               - cinOrPassport
 *               - name
 *               - address
 *               - dateOfBirth
 *               - email
 *               - isTourist
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: Tenant updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "tenant-id-123"
 *                 cinOrPassport:
 *                   type: string
 *                   example: "C1234567"
 *                 name:
 *                   type: string
 *                   example: "Jane Doe"
 *                 address:
 *                   type: string
 *                   example: "123 Main St, Anytown, AT 12345"
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   example: "1990-01-01"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: tenant@example.com
 *                 isTourist:
 *                   type: boolean
 *                   example: false
 *                 phoneNumber:
 *                   type: string
 *                   example: "+1234567890"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *       400:
 *         description: Missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid Tenant Data!"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       404:
 *         description: Tenant not found or unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
 *       405:
 *         description: Business ID does not belong to the authenticated user.
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

/**
 * @swagger
 * /api/{businessId}/tenants/{tenantId}:
 *   delete:
 *     summary: Delete a tenant
 *     description: Deletes a specific tenant and all associated rental properties within a given business. The business must belong to the authenticated user, and the tenant must be associated with the specified business.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           example: "tenant-id-123"
 *     responses:
 *       200:
 *         description: Tenant deleted successfully along with associated rental properties.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "tenant-id-123"
 *                 cinOrPassport:
 *                   type: string
 *                   example: "C1234567"
 *                 name:
 *                   type: string
 *                   example: "Jane Doe"
 *                 address:
 *                   type: string
 *                   example: "123 Main St, Anytown, AT 12345"
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   example: "1990-01-01"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: tenant@example.com
 *                 isTourist:
 *                   type: boolean
 *                   example: false
 *                 phoneNumber:
 *                   type: string
 *                   example: "+1234567890"
 *                 businessId:
 *                   type: string
 *                   example: "business-id-123"
 *       400:
 *         description: Missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       404:
 *         description: Tenant not found or unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
 *       405:
 *         description: Business ID does not belong to the authenticated user.
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
