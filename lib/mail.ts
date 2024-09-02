import nodemailer from "nodemailer";

export async function sendMail({
    to,
    subject,
    emailContent
}: {
    to: string;
    subject: string;
    emailContent: string;
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

    try {
        const sendResult = await transport.sendMail({
            from: SMTP_EMAIL,
            to,
            subject,
            html: emailContent,
        });
        console.log(sendResult);
    } catch (error) {
        console.log(error);
    }
}
