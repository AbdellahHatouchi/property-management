import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { calculateAmount } from "@/lib/utils";
import { RentalPropertySchema } from "@/schema";
import { format } from "date-fns";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/rentals:
 *   post:
 *     summary: Create a new rental property
 *     description: Creates a new rental property for a given business. The business must belong to the authenticated user, and the property must exist and have available units.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *                 example: "property-id-123"
 *               rentalDateRange:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-01"
 *                   to:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-31"
 *               rentalNumber:
 *                 type: string
 *                 example: "R123456"
 *               rentalType:
 *                 type: string
 *                 enum: [Daily, Monthly]
 *                 example: "Monthly"
 *               rentalPropertyId:
 *                 type: string
 *                 example: "rentalProperty-id-123"
 *               unit:
 *                 type: string
 *                 example: "A1"
 *             required:
 *               - propertyId
 *               - rentalDateRange
 *               - rentalNumber
 *               - rentalType
 *               - rentalPropertyId
 *               - unit
 *     responses:
 *       200:
 *         description: Rental property created successfully.
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
 *                 rentalPropertyId:
 *                   type: string
 *                   example: "rentalProperty-id-123"
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
 *       400:
 *         description: Missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid Rental Data!"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       404:
 *         description: Property or rentalProperty not found or unit not available.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Property Not Found"
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

        const getTenant = await db.tenant.findUnique({
            where: {
                id: tenantId,
                businessId: params.businessId,
            },
        });

        if (!getTenant) {
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

/**
 * @swagger
 * /api/{businessId}/rentals:
 *   get:
 *     summary: Retrieve rentals for a business
 *     description: Fetches a list of rentals associated with a specified business. The business must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     responses:
 *       200:
 *         description: List of rentals for the specified business.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "rentalProperty-id-123"
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
 *                     example: rentalProperty@example.com
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
        const { searchParams } = new URL(req.url);
        const user = await UserAuth();

        if (!user || !user.id) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!params.businessId) {
            return new NextResponse("Business id is required", { status: 400 });
        }
        const pageSize = parseInt(searchParams.get("pageSize") || "5"); // Default to 5 if not provided
        const pageIndex = parseInt(searchParams.get("pageIndex") || "0"); // Default to 0 if not provided

        // Calculate skip and take (limit) for pagination
        const skip = pageIndex * pageSize;
        const take = pageSize;

        // Fetch rentals data with pagination
        const rentals = await db.rentalProperty.findMany({
            where: {
                businessId: params.businessId,
            },
            include: {
                property: {
                    select: {
                        name: true,
                    },
                },
                tenant: {
                    select: {
                        name: true,
                        cinOrPassport: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip, // Skips records based on pageIndex
            take, // Limits the number of records per page (pageSize)
        });

        // Format the data as required
        const formattedData = rentals.map((rental) => ({
            id: rental.id,
            rentalNumber: rental.rentalNumber,
            unit: rental.unit,
            tenantName: rental.tenant.name,
            settled: rental.settled,
            tenantCinOrPassport: rental.tenant.cinOrPassport,
            propertyName: rental.property.name,
            totalAmount: rental.totalAmount,
            startDate: format(new Date(rental.startDate), "MMMM do, yyyy"),
            endDate: format(new Date(rental.endDate), "MMMM do, yyyy"),
            createdAt: format(new Date(rental.createdAt), "MMMM do, yyyy"),
        }));

        // Optionally: Get the total count of rentals for this businessId
        const totalTenants = await db.rentalProperty.count({
            where: { businessId: params.businessId },
        });

        // Return the paginated and formatted data along with total count
        return NextResponse.json({
            data: formattedData,
            total: totalTenants, // For frontend to calculate total pages
            pageSize,
            pageIndex,
        });

    } catch (error) {
        console.log("[RENTALS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
