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

// ===================================
// Verificar conexão ao iniciar
// ===================================
transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP] ❌ Erro na verificação de conexão:", error);
  } else {
    console.log("[SMTP] ✅ Conexão verificada com sucesso!");
  }
});


// ===================================
// Enviar Magic Link Email
// ===================================
export const sendMagicLinkEmail = async (
  to: string,
  subject: string,
  data: MagicLinkEmailProps,
) => {
  console.log(`\n[MAGIC LINK] Iniciando envio de email para: ${to}`);
  console.log(`[MAGIC LINK] Assunto: ${subject}`);
  
  try {
    // Renderizar template
    console.log("[MAGIC LINK] Renderizando template...");
    const emailTemplate = await render(MagicLinkEmail(data));
    console.log("[MAGIC LINK] ✅ Template renderizado");

    // Preparar dados do email
    const mailData = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      // text : "Por favor, utilize um cliente de email que suporte HTML para visualizar este conteúdo.",
      html: emailTemplate,
    };

    console.log("[MAGIC LINK] Enviando email via SMTP...");
    console.log(`[MAGIC LINK] De: ${mailData.from}`);
    console.log(`[MAGIC LINK] Para: ${mailData.to}`);

    // Enviar email
    const info = await transporter.sendMail(mailData);

    // LOG DE SUCESSO (DEPOIS do envio)
    console.log(`\n✅ [MAGIC LINK] EMAIL ENVIADO COM SUCESSO!`);
    console.log(`[MAGIC LINK] Message ID: ${info.messageId}`);
    console.log(`[MAGIC LINK] Response: ${info.response}`);
    console.log(`[MAGIC LINK] Para: ${to}\n`);

    return info;
  } catch (error) {
    console.error(`\n❌ [MAGIC LINK] ERRO AO ENVIAR EMAIL`);
    console.error(`[MAGIC LINK] Para: ${to}`);
    console.error(`[MAGIC LINK] Erro:`, error);
    
    // Re-lançar erro para Better Auth capturar
    throw new Error(`Falha ao enviar email: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// ===================================
// Enviar Workspace Invitation Email
// ===================================

// ===================================
// Enviar Workspace Invitation Email
// ===================================
export const sendWorkspaceInvitationEmail = async (
  to: string,
  subject: string,
  data: WorkspaceInvitationEmailProps,
) => {
  console.log(`\n[INVITATION] Iniciando envio de convite para: ${to}`);
  console.log(`[INVITATION] Assunto: ${subject}`);
  
  try {
    // Renderizar template
    console.log("[INVITATION] Renderizando template...");
    const emailTemplate = await render(WorkspaceInvitationEmail({ ...data, to }));
    console.log("[INVITATION] ✅ Template renderizado");

    // Preparar dados do email
    const mailData = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: emailTemplate,
    };

    console.log("[INVITATION] Enviando email via SMTP...");
    console.log(`[INVITATION] De: ${mailData.from}`);
    console.log(`[INVITATION] Para: ${mailData.to}`);

    // Enviar email
    const info = await transporter.sendMail(mailData);

    // LOG DE SUCESSO (DEPOIS do envio)
    console.log(`\n✅ [INVITATION] EMAIL ENVIADO COM SUCESSO!`);
    console.log(`[INVITATION] Message ID: ${info.messageId}`);
    console.log(`[INVITATION] Response: ${info.response}`);
    console.log(`[INVITATION] Para: ${to}\n`);

    return info;
  } catch (error) {
    console.error(`\n❌ [INVITATION] ERRO AO ENVIAR EMAIL`);
    console.error(`[INVITATION] Para: ${to}`);
    console.error(`[INVITATION] Erro:`, error);
    
    // Re-lançar erro para Better Auth capturar
    throw new Error(`Falha ao enviar email de convite: ${error instanceof Error ? error.message : String(error)}`);
  }
};