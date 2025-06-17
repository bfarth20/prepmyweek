import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendResetEmail(toEmail, resetLink) {
  try {
    const response = await resend.emails.send({
      from: "PrepMyWeek <staff@prepmyweek.com>",
      to: toEmail,
      subject: "Reset your PrepMyWeek password",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset.</p>
        <p>
          Click <a href="${resetLink}">this link</a> to reset your password. This link expires in 15 minutes.
        </p>
        <p>If you didn’t request this, you can safely ignore it.</p>
      `,
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
