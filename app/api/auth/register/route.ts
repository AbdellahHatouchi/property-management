import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided email, password, and name. Ensures the email is unique and hashes the password before storing it.
 *     requestBody:
 *       description: User registration data.
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
 *               password:
 *                 type: string
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *             required:
 *               - email
 *               - password
 *               - name
 *     responses:
 *       201:
 *         description: User registered successfully and a confirmation has been sent to the provided email.
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
 *                   example: "A confirmation has been sent to your email!"
 *       400:
 *         description: Invalid registration data provided.
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
 *       409:
 *         description: Email already exists in the database.
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
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validateFields = RegisterSchema.safeParse(body);

        if (!validateFields.success) {
            return NextResponse.json(
                { error: "Invalid fields!", success: "" },
                { status: 400 }
            );
        }

        const { email, password, name } = validateFields.data;

        // Check if the user already exists
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists", success: "" },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Create the new user in the database
        const user = await db.user.create({
            data: {
                email,
                password: hashedPwd,
                name,
                phoneNumber: "",
            },
        });

        return NextResponse.json(
            {
                error: "",
                success: "A confirmation has been sent to your email!",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong!", success: "" },
            { status: 500 }
        );
    }
}
