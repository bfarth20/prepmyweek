import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendResetEmail(toEmail, resetLink) {
  try {
    const response = await resend.emails.send({
      from: "PrepMyWeek <staff@prepmyweek.com>",
      to: toEmail,
      subject: "Reset your PrepMyWeek password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: auto;
                border: 1px solid #dddddd;
                padding: 24px;
                border-radius: 8px;
              }
              h1 {
                color: #d95c23;
                font-size: 24px;
                margin-bottom: 8px;
              }
              p {
                font-size: 15px;
                line-height: 1.6;
              }
              .button {
                display: inline-block;
                margin-top: 16px;
                padding: 12px 20px;
                background-color: #d95c23;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              }
              .footer {
                font-size: 13px;
                color: #888888;
                margin-top: 40px;
                border-top: 1px solid #eeeeee;
                padding-top: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>Hello,</p>
              <p>You requested a password reset for your PrepMyWeek account.</p>
              <p>Click the button below to reset your password. This link will expire in 15 minutes.</p>
              <a href="${resetLink}" 
   style="display:inline-block;margin-top:16px;padding:12px 20px;
          background-color:#d95c23;color:#ffffff !important;
          text-decoration:none;border-radius:4px;font-weight:bold;">
   Reset Password
</a>
              <p>If you didn’t request this, you can safely ignore it.</p>
              <div class="footer">
                &copy; 2025 PrepMyWeek Inc. All rights reserved.<br />
                Built with care in Atlanta, GA
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
