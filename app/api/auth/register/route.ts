import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

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
