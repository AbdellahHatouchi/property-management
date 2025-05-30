import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";
import { auth } from "@/auth";
import { UpdateUserInfoSchema } from "@/schema"; // Ensure this schema is correctly imported
import { sendVerificationOTP } from "@/lib/send-verification-otp";

/**
 * @swagger
 * /api/update-user-info:
 *   put:
 *     summary: Update user information
 *     description: Updates the information of the authenticated user.
 *     requestBody:
 *       description: User information to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *             required:
 *               - email
 *               - phoneNumber
 *               - name
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ""
 *                 success:
 *                   type: string
 *                   example: "User information updated successfully"
 *       400:
 *         description: Invalid fields in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid fields!"
 *                 success:
 *                   type: string
 *                   example: ""
 *       401:
 *         description: Unauthorized access or invalid user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 success:
 *                   type: string
 *                   example: ""
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *                 success:
 *                   type: string
 *                   example: ""
 *       409:
 *         description: Email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already exists"
 *                 success:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong!"
 *                 success:
 *                   type: string
 *                   example: ""
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const validateFields = UpdateUserInfoSchema.safeParse(body);

        // Authenticate the user
        const session = await auth();
        const user = session?.user;
        let isEmailUpdate = null;

        if (!user || !user.id) {
            return NextResponse.json(
                { error: "Unauthorized", success: "", isEmailUpdate },
                { status: 401 }
            );
        }

        const existingUser = await db.user.findUnique({
            where: { id: user.id },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "Unauthorized", success: "", isEmailUpdate },
                { status: 401 }
            );
        }

        if (!validateFields.success) {
            return NextResponse.json(
                { error: "Invalid fields!", success: "", isEmailUpdate },
                { status: 400 }
            );
        }

        const { email, phoneNumber, name } = validateFields.data;

        const userToUpdate = await getUserById(user.id);

        if (!userToUpdate) {
            return NextResponse.json(
                { error: "User not found", success: "", isEmailUpdate },
                { status: 404 }
            );
        }

        // If email is being updated, check if it's already in use
        isEmailUpdate = false;
        if (email && email !== userToUpdate.email) {
            const emailInUse = await db.user.findUnique({
                where: { email },
            });
            
            if (emailInUse) {
                return NextResponse.json(
                    { error: "Email already exists", success: "" },
                    { status: 409 }
                );
            }

            // Set emailVerified to null since the email is being changed
            isEmailUpdate = true;
            await sendVerificationOTP(email)
        }

        await db.user.update({
            where: { id: user.id },
            data: {
                email: email,
                name: name,
                phoneNumber: phoneNumber,
                emailVerified: isEmailUpdate
                    ? null
                    : userToUpdate.emailVerified,
            },
        });

        if (isEmailUpdate) {
            // Redirect to /verify-email or return a response that informs the user
            return NextResponse.json(
                {
                    error: "",
                    success:
                        "Email updated. Please verify your new email address.",
                    isEmailUpdate,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                error: "",
                success: "User information updated successfully",
                isEmailUpdate,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: "Something went wrong!",
                success: "",
                isEmailUpdate: null,
            },
            { status: 500 }
        );
    }
}
