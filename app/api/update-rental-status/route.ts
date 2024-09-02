import Email from "@/components/mail/rental-expired-template";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { formattedNumberToMAD } from "@/lib/utils";
import { Business, RentalProperty, Tenant, User } from "@prisma/client";
import { render } from "@react-email/render";
import { format } from "date-fns";
/**
 * @swagger
 * /api/update-rental-status:
 *   get:
 *     summary: Retrieve and process expired rental properties
 *     description: Fetches rental properties that have expired and are not settled, updates their statuses, and sends notifications to tenants and business users.
 *     responses:
 *       200:
 *         description: Rental statuses updated and notifications sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rental statuses updated and notifications sent successfully"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET() {
    try {
        let expiredRentals: (RentalProperty & {
            tenant: Tenant;
            business: Business & {
                User: User;
            };
        })[] = [];
        // Start a transaction
        await db.$transaction(async (tx) => {
            // Fetch rentals that have expired but are not settled
            expiredRentals = await tx.rentalProperty.findMany({
                where: {
                    endDate: { lte: new Date() },
                },
                include: {
                    tenant: true, // Include tenant information
                    business: {
                        include: {
                            User: true, // Include user information from the business
                        },
                    },
                },
            });

            for (const rental of expiredRentals) {
                if (rental.settled) {
                    // Mark the specific unit as available
                    await tx.unit.updateMany({
                        where: { number: rental.unit },
                        data: { isAvailable: true },
                    });

                    // Mark the property as available
                    await tx.property.update({
                        where: { id: rental.propertyId },
                        data: { isAvailable: true },
                    });
                }
            }
        });

        const emailPromises = expiredRentals.map(async (rental) => {
            const rentalsEmailData = {
                settled: rental.settled,
                datePaid: rental.datePaid
                    ? format(rental.datePaid, "MMMM do yyyy")
                    : "-----",
                rentalNumber: rental.rentalNumber,
                startDate: format(rental.startDate, "MMMM do yyyy"),
                endDate: format(rental.endDate, "MMMM do yyyy"),
                id: rental.id,
                businessId: rental.businessId,
                unit: rental.unit,
                totalAmount: formattedNumberToMAD(rental.totalAmount),
            };

            const tenantEmailContent = await render(
                Email({
                    rentals: [rentalsEmailData],
                    supportEmail: "rent-master.support.com",
                    username: rental.tenant.name || "Valued Customer", // The tenant's name or a fallback
                }),
                {
                    pretty: true,
                }
            );
            const userEmailContent = await render(
                Email({
                    rentals: [rentalsEmailData],
                    supportEmail: "rent-master.support.com",
                    username: rental.tenant.name || "Valued Customer", // The tenant's name or a fallback
                }),
                {
                    pretty: true,
                }
            );

            const tenantEmailData = {
                to: rental.tenant.email, // The tenant's email address
                subject: "Expired Rental Property Notification",
            };

            const userEmailData = {
                to: rental.business.User.email, // The user's email address
                subject: "Expired Rental Property Notification",
            };

            // Send email to both the tenant and the user
            return Promise.all([
                sendMail({
                    ...tenantEmailData,
                    emailContent: tenantEmailContent,
                }),
                sendMail({ ...userEmailData, emailContent: userEmailContent }),
            ]);
        });

        await Promise.all(emailPromises);

        return new Response(
            JSON.stringify({
                message:
                    "Rental statuses updated and notifications sent successfully",
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error updating rental statuses:", error);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
