import { PropertyType } from "@prisma/client";
import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "password is required",
    }),
});

export const RegisterSchema = z.object({
    name: z.string().min(3, {
        message: "Name is required",
    }),
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "minimun 6 characters required",
    }),
});

export const UpdateUserInfoSchema = z.object({
    name: z
        .string()
        .min(3, "Le nom doit comporter au moins 3 caractères")
        .optional(),
    email: z.string().email("Format d'e-mail invalide").optional(),
    phoneNumber: z.string().optional(),
});

export const UpdatePasswordSchema = z.object({
    password: z
        .string()
        .min(6, "Le mot de passe doit comporter plus de 6 caractères"),
    confirmation: z
        .string()
        .min(6, "Le mot de passe doit comporter plus de 6 caractères"),
});

const MoroccanCINRegex = /^[A-Za-z]{2}\d{1,8}$/;

export const tenantSchema = z
    .object({
        name: z.string().min(3),
        email: z.string().email("Email is required"),
        cinOrPassport: z.string().min(4, "CIN / Passport is required"),
        isTourist: z.coerce.boolean().default(false),
        dateOfBirth: z.coerce.date({ message: "Date of Birth is required" }),
        phoneNumber: z.string().min(4, "Phone number is required"),
        address: z.string(),
    })
    .refine(
        (data) => {
            if (!data.isTourist) {
                if (
                    !data.cinOrPassport ||
                    !data.cinOrPassport.match(MoroccanCINRegex)
                ) {
                    return false;
                }
            }
            return true;
        },
        {
            message: "Invalid Moroccan CIN format",
            path: ["cinOrPassport"],
        }
    );
export const propertySchema = z
    .object({
        name: z.string().min(3),
        type: z.enum(Object.keys(PropertyType) as [string, ...string[]], {
            errorMap: () => ({ message: "Please select correct type" }),
        }),
        dailyRentalCost: z.coerce.number().min(0, "Daily cost is required"),
        monthlyRentalCost: z.coerce.number().min(0, "monthly cost is required"),
        address: z.string(),
        units: z
            .object({
                number: z.string().min(2, "Unit number is required"),
                isAvailable: z.boolean().default(true),
            })
            .array()
            .min(1, "One Unit is required"),
    })
    .refine(
        (data) => {
            if (data.type === PropertyType.HOUSE) {
                if (
                    data.units.length > 1
                ) {
                    return false;
                }
            }
            return true;
        },
        {
            message: "A property of type 'House' cannot create a multiple units.",
            path: ["units"],
        }
    );
export const SettingSchema = z.object({
    showAPIDoc: z.boolean()
})