import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAUIT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

export async function POST(req:NextRequest) {
    try {
        const body = await req.json();
        const validateFields = LoginSchema.safeParse(body);

        if (!validateFields.success) {
            return NextResponse.json({ error: "Invalid fields!" , success: ""}, { status: 400 });
        }

        const { email, password } = validateFields.data;

        // Attempt to sign in the user
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAUIT_LOGIN_REDIRECT,
        });

        return NextResponse.json({ error: "", success: "Login successful" }, { status: 200 });
    } catch (error) {
        console.error("[LOGIN_POST]",error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return NextResponse.json({ error: "Invalid credentials!", success: "" }, { status: 401 });
                default:
                    return NextResponse.json({ error: "Something went wrong!", success: "" }, { status: 500 });
            }
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
