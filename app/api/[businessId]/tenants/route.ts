import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { tenantSchema } from "@/schema";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/businessId/tenants:
 *   post:
 *     summary: Create a new tenant
 *     description: Registers a new tenant for a business owned by the authenticated user. Validates the provided tenant data and ensures the business ID belongs to the user.
 *     requestBody:
 *       description: Tenant data to create.
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
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     responses:
 *       200:
 *         description: Tenant created successfully.
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
 *         description: Invalid tenant data or missing business ID.
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
/**
 * @swagger
 * /api/{businessId}/tenants:
 *   get:
 *     summary: Retrieve tenants for a business
 *     description: Fetches a list of tenants associated with a specified business. The business must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     responses:
 *       200:
 *         description: List of tenants for the specified business.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "tenant-id-123"
 *                   cinOrPassport:
 *                     type: string
 *                     example: "C1234567"
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   address:
 *                     type: string
 *                     example: "123 Main St, Anytown, AT 12345"
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     example: "1990-01-01"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: tenant@example.com
 *                   isTourist:
 *                     type: boolean
 *                     example: false
 *                   phoneNumber:
 *                     type: string
 *                     example: "+1234567890"
 *                   businessId:
 *                     type: string
 *                     example: "business-id-123"
 *       400:
 *         description: Missing or invalid business ID.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
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
