import nodemailer from "nodemailer"
import { logger } from "./logger"

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Email templates
const emailTemplates = {
  welcome: (name: string, email: string, password: string) => ({
    subject: "Welcome to ZINWA Water Meter System",
    html: `
      <h1>Welcome to ZINWA Water Meter System</h1>
      <p>Dear ${name},</p>
      <p>Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please change your password after your first login for security reasons.</p>
      <p>Thank you for using our service.</p>
      <p>Best regards,</p>
      <p>ZINWA Team</p>
    `,
  }),

  tokenPurchase: (name: string, tokenValue: string, propertyAddress: string, amount: number) => ({
    subject: "ZINWA Water Meter Token Purchase Confirmation",
    html: `
      <h1>Token Purchase Confirmation</h1>
      <p>Dear ${name},</p>
      <p>Your token purchase was successful.</p>
      <p><strong>Token:</strong> ${tokenValue}</p>
      <p><strong>Property:</strong> ${propertyAddress}</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p>Thank you for using our service.</p>
      <p>Best regards,</p>
      <p>ZINWA Team</p>
    `,
  }),

  lowBalance: (name: string, propertyAddress: string, remainingUnits: number) => ({
    subject: "ZINWA Water Meter Low Balance Alert",
    html: `
      <h1>Low Balance Alert</h1>
      <p>Dear ${name},</p>
      <p>Your water meter balance is running low.</p>
      <p><strong>Property:</strong> ${propertyAddress}</p>
      <p><strong>Remaining Units:</strong> ${remainingUnits}</p>
      <p>Please purchase more tokens to avoid service interruption.</p>
      <p>Thank you for using our service.</p>
      <p>Best regards,</p>
      <p>ZINWA Team</p>
    `,
  }),
}

// Type definitions for email data
type EmailData = {
  welcome: { name: string; email: string; password: string };
  tokenPurchase: { name: string; tokenValue: string; propertyAddress: string; amount: number };
  lowBalance: { name: string; propertyAddress: string; remainingUnits: number };
};

// Send email function
const sendEmail = async <T extends keyof typeof emailTemplates>(
  to: string,
  template: T,
  data: EmailData[T]
) => {
  try {
    // Fixed the type error by using a conditional approach instead of spread
    let emailContent;
    
    if (template === 'welcome') {
      const { name, email, password } = data as EmailData['welcome'];
      emailContent = emailTemplates.welcome(name, email, password);
    } else if (template === 'tokenPurchase') {
      const { name, tokenValue, propertyAddress, amount } = data as EmailData['tokenPurchase'];
      emailContent = emailTemplates.tokenPurchase(name, tokenValue, propertyAddress, amount);
    } else if (template === 'lowBalance') {
      const { name, propertyAddress, remainingUnits } = data as EmailData['lowBalance'];
      emailContent = emailTemplates.lowBalance(name, propertyAddress, remainingUnits);
    } else {
      throw new Error(`Email template "${template}" not found`);
    }

    const { subject, html } = emailContent;

    const mailOptions = {
      from: `"ZINWA Water Meters" <${process.env.SMTP_FROM_EMAIL || "noreply@zinwa.co.zw"}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent: ${info.messageId}`)
    return info
  } catch (error) {
    logger.error("Error sending email:", error)
    throw error
  }
}

export { sendEmail }