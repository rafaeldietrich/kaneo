import { render } from "@react-email/components";
import { config } from "dotenv-mono";
import * as nodemailer from "nodemailer";
import type { MagicLinkEmailProps } from "./templates/magic-link";
import MagicLinkEmail from "./templates/magic-link";
import WorkspaceInvitationEmail, {
  type WorkspaceInvitationEmailProps,
} from "./templates/workspace-invitation";

config();
// ===================================
// DEBUG: Validar variáveis no startup
// ===================================
console.log("[SMTP Config] Validando variáveis de ambiente...");
console.log(`[SMTP] HOST: ${process.env.SMTP_HOST}`);
console.log(`[SMTP] PORT: ${process.env.SMTP_PORT}`);
console.log(`[SMTP] USER: ${process.env.SMTP_USER}`);
console.log(`[SMTP] SECURE: ${process.env.SMTP_SECURE}`);
console.log(`[SMTP] FROM: ${process.env.SMTP_FROM}`);
console.log(`[SMTP] FROM_NAME: ${process.env.SMTP_FROM_NAME}`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  secure: process.env.SMTP_SECURE !== "false",
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true, // Habilitar logging
  debug: true,  // Habilitar debug
});

export const sendMagicLinkEmail = async (
  to: string,
  subject: string,
  data: MagicLinkEmailProps,
) => {
  const emailTemplate = await render(MagicLinkEmail(data));
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    });
  } catch (error) {
    console.error("Error sending magic link email", error);
  }
};

export const sendWorkspaceInvitationEmail = async (
  to: string,
  subject: string,
  data: WorkspaceInvitationEmailProps,
) => {
  const emailTemplate = await render(WorkspaceInvitationEmail({ ...data, to }));
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: emailTemplate,
  });
};
