import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/{businessId}/rentals:
 *   get:
 *     summary: Get expired rental properties
 *     description: Retrieves a list of rental properties for a given business that have expired and are not yet settled. The business must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           example: "business-id-123"
 *     responses:
 *       200:
 *         description: A list of expired rental properties.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "rental-id-123"
 *                   propertyId:
 *                     type: string
 *                     example: "property-id-123"
 *                   tenantId:
 *                     type: string
 *                     example: "tenant-id-123"
 *                   rentalCost:
 *                     type: number
 *                     example: 500.00
 *                   rentalNumber:
 *                     type: string
 *                     example: "R123456"
 *                   unit:
 *                     type: string
 *                     example: "A1"
 *                   totalAmount:
 *                     type: number
 *                     example: 1500.00
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-01"
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-31"
 *                   businessId:
 *                     type: string
 *                     example: "business-id-123"
 *                   settled:
 *                     type: boolean
 *                     example: false
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       400:
 *         description: Missing or invalid business ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Business id is required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
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

      const expiredRentals = await db.rentalProperty.findMany({
          where: {
              businessId: params.businessId,
              endDate: { lte: new Date() },
              settled: false,
          },
      });

      return NextResponse.json(expiredRentals);
  } catch (error) {
      console.log("[PROPERTY_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
  }
}