import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAUIT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with the provided email and password. Returns a success message upon successful login or an error message if credentials are invalid.
 *     requestBody:
 *       description: User login credentials.
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
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful.
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
 *                   example: "Login successful"
 *       400:
 *         description: Invalid login data provided.
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
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials!"
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
 *                   example: "Internal Server Error"
 *                 success:
 *                   type: string
 *                   example: ""
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validateFields = LoginSchema.safeParse(body);

        if (!validateFields.success) {
            return NextResponse.json(
                { error: "Invalid fields!", success: "" },
                { status: 400 }
            );
        }

        const { email, password } = validateFields.data;

        // Attempt to sign in the user
        await signIn("credentials", {
            email,
            password,
            redirect:false
            // redirectTo: DEFAUIT_LOGIN_REDIRECT,
        });

        return NextResponse.json(
            { error: "", success: "Login successful" },
            { status: 200 }
        );
    } catch (error) {
        console.error("[LOGIN_POST]", error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return NextResponse.json(
                        { error: "Invalid credentials!", success: "" },
                        { status: 401 }
                    );
                default:
                    return NextResponse.json(
                        { error: "Something went wrong!", success: "" },
                        { status: 500 }
                    );
            }
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
