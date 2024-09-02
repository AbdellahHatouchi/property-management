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
        .min(3, "name must be more than 3 characters long"),
    email: z.string().email("Email format invalide"),
    phoneNumber: z.string().optional(),
});

export const UpdatePasswordSchema = z.object({
    password: z
        .string()
        .min(6, "Password must be more than 6 characters long"),
    confirmation: z
        .string()
        .min(6, "Password must be more than 6 characters long"),
});

export const VerificationSchema = z.object({
    OTPVerify: z.string().length(6,{
      message: 'Please enter the valide OTP code'
    }),
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
                if (data.units.length > 1) {
                    return false;
                }
            }
            return true;
        },
        {
            message:
                "A property of type 'House' cannot create a multiple units.",
            path: ["units"],
        }
    );
export const SettingSchema = z.object({
    showAPIDoc: z.boolean(),
});

export const RentalPropertySchema = z.object({
    rentalNumber: z.string().min(2, "the rental number is required"),
    propertyId: z.string().uuid("Please select the Property"),
    unit: z.string().min(2, "the unit is required"),
    rentalType: z.enum(["Daily", "Monthly"]),
    tenantId: z.string().uuid("Please select the tenant"),
    rentalDateRange: z
        .object({
            from: z.coerce.date(),
            to: z.coerce.date(),
        })
        .refine((data) => data.to >= data.from, {
            message: "The 'to' date must be after or equal to the 'from' date",
            path: ["to"],
        }),
}).refine((data) => {
    if (data.rentalType === "Monthly") {
      const dayDiff = Math.ceil((data.rentalDateRange.to.getTime() - data.rentalDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff % 30 === 0;
    }
    return true; // If rentalType is not "Monthly", the validation passes
  }, {
    message: "For 'Monthly' rentals, the date range must be exactly 30, 60, 90 days, etc.",
    path: ["rentalDateRange"], // Specify that the error pertains to the 'to' field in the date range
  });;
