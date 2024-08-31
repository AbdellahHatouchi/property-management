import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { Email } from "@/components/mail/rental-expired-template";

export async function sendMail({
    to,
    subject,
    rentals,
    username,
}: {
    to: string;
    subject: string;
    username: string;
    rentals: {
        settled: boolean;
        datePaid: string;
        businessId: string;
        rentalNumber: string;
        startDate: string;
        endDate: string;
        id: string;
        unit: string;
        totalAmount: string;
    }[];
}) {
    const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD,
        },
    });
    try {
        const testResult = await transport.verify();
        console.log(testResult);
    } catch (error) {
        console.error({ error });
        return;
    }

    const emailHtml = await render(
        Email({
            rentals,
            supportEmail: "rent-master.support.com",
            username,
        }),
        {
            pretty: true,
        }
    );

    try {
        const sendResult = await transport.sendMail({
            from: SMTP_EMAIL,
            to,
            subject,
            html: emailHtml,
        });
        console.log(sendResult);
    } catch (error) {
        console.log(error);
    }
}
