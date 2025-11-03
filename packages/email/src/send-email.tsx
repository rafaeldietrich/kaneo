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
  name: 'DietrichConsultoria', // essesncial para Hostgator funcionar default é localhost e aqui nao funciona!
  logger: true, // Habilitar logging
  debug: true,  // Habilitar debug
});



// Verificar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP] ❌ Erro na verificação:", error);
  } else {
    console.log("[SMTP] ✅ Conexão verificada com sucesso!");
  }
});

export const sendMagicLinkEmail = async (
  to: string,
  subject: string,
  data: MagicLinkEmailProps,
) => {
  console.log(`\n[MAGIC LINK] Iniciando envio para: ${to}`);
  
  try {
    const emailTemplate = await render(MagicLinkEmail(data));
    console.log("[MAGIC LINK] ✅ Template renderizado");

    console.log("[MAGIC LINK] Enviando via SMTP...");
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Kaneo"}" <${process.env.SMTP_FROM}>`,
      to: to.toLowerCase(),
      replyTo: process.env.SMTP_FROM || "",
      subject,
<<<<<<< HEAD
      // text : "Por favor, utilize um cliente de email que suporte HTML para visualizar este conteúdo.",
      html: emailTemplate,
=======
      text : "Por favor, utilize um cliente de email que suporte HTML para visualizar este conteúdo.",
      // html: emailTemplate,
>>>>>>> d3d5d16 (text)
      // CRÍTICO: Forçar Base64 ao invés de quoted-printable
      encoding: "base64",      
      headers: {
        "X-Mailer": "Kaneo/2.0",
        "X-Priority": "3 (Normal)",
        "Importance": "Normal",
        "X-MSMail-Priority": "Normal",
        "Precedence": "bulk",
      },
    });

    console.log(`\n✅ [MAGIC LINK] EMAIL ENVIADO COM SUCESSO!`);
    console.log(`[MAGIC LINK] Message ID: ${info.messageId}`);
    console.log(`[MAGIC LINK] Response: ${info.response}`);
    console.log(`[MAGIC LINK] Para: ${to}\n`);

    return info;
  } catch (error) {
    console.error(`\n❌ [MAGIC LINK] ERRO AO ENVIAR EMAIL`);
    console.error(`[MAGIC LINK] Para: ${to}`);
    console.error(`[MAGIC LINK] Erro:`, error);
    throw new Error(`Falha ao enviar email: ${error instanceof Error ? error.message : String(error)}`);
  }
};



<<<<<<< HEAD
=======

>>>>>>> c292da79d736a108f4658f6cb9ad29197a99945e
// ===================================
// Enviar Workspace Invitation Email
// ===================================

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
