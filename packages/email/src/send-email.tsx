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
// DEBUG CONDICIONAL
// ===================================
export const debugEmail = process.env.DEBUG_EMAIL === "true";

const log = (message: string, data?: unknown) => {
  if (debugEmail) {
    if (data) {
      console.log(`[EMAIL DEBUG] ${message}`, data);
    } else {
      console.log(`[EMAIL DEBUG] ${message}`);
    }
  }
};

const logError = (message: string, error?: unknown) => {
  if (debugEmail) {
    if (error) {
      console.error(`[EMAIL ERROR] ${message}`, error);
    } else {
      console.error(`[EMAIL ERROR] ${message}`);
    }
  }
};

const logSuccess = (message: string, data?: unknown) => {
  if (debugEmail) {
    if (data) {
      console.log(`[EMAIL SUCCESS] ${message}`, data);
    } else {
      console.log(`[EMAIL SUCCESS] ${message}`);
    }
  }
};

// ===================================
// TRANSPORTER SETUP
// ===================================
log("Inicializando transporter com SMTP...");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  name: process.env.SMTP_HOST, // ✅ CRÍTICO: Evita 'localhost'
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: debugEmail, // ✅ Habilita logs nodemailer só se DEBUG ativo
  debug: debugEmail,  // ✅ Habilita debug nodemailer só se DEBUG ativo
});

// ===================================
// VERIFICAR CONEXÃO
// ===================================
transporter.verify((error, success) => {
  if (error) {
    logError("Erro na verificação de conexão SMTP:", error);
  } else {
    logSuccess("Conexão SMTP verificada com sucesso!");
  }
});

// ===================================
// ENVIAR MAGIC LINK EMAIL
// ===================================
export const sendMagicLinkEmail = async (
  to: string,
  subject: string,
  data: MagicLinkEmailProps,
) => {
  log(`Iniciando envio de magic link para: ${to}`);
  
  try {
    const emailTemplate = await render(MagicLinkEmail(data));
    log("✅ Template renderizado");

    log("Preparando dados do email...");
    const mailData = {
      from: `"${process.env.SMTP_FROM_NAME || "Kaneo"}" <${process.env.SMTP_FROM}>`,
      to: to.toLowerCase(),
      replyTo: process.env.SMTP_FROM || "",
      subject,
      html: emailTemplate,
      encoding: "base64", // ✅ HostGator requer base64
      headers: {
        "X-Mailer": "Kaneo/2.0",
        "X-Priority": "3 (Normal)",
        "Importance": "Normal",
        "X-MSMail-Priority": "Normal",
        "Precedence": "bulk",
      },
    };

    log("Enviando email via SMTP...", {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
    });

    const info = await transporter.sendMail(mailData);

    logSuccess("EMAIL ENVIADO COM SUCESSO!", {
      messageId: info.messageId,
      response: info.response,
      para: to,
    });

    return info;
  } catch (error) {
    logError("ERRO AO ENVIAR EMAIL", {
      para: to,
      erro: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Falha ao enviar email: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// ===================================
// ENVIAR WORKSPACE INVITATION EMAIL
// ===================================
export const sendWorkspaceInvitationEmail = async (
  to: string,
  subject: string,
  data: WorkspaceInvitationEmailProps,
) => {
  log(`Iniciando envio de convite para: ${to}`);
  
  try {
    const emailTemplate = await render(WorkspaceInvitationEmail({ ...data, to }));
    log("✅ Template renderizado");

    log("Preparando dados do email...");
    const mailData = {
      from: `"${process.env.SMTP_FROM_NAME || "Kaneo"}" <${process.env.SMTP_FROM}>`,
      to: to.toLowerCase(),
      replyTo: process.env.SMTP_FROM || "",
      subject,
      html: emailTemplate,
      encoding: "base64",
      headers: {
        "X-Mailer": "Kaneo/2.0",
        "X-Priority": "3 (Normal)",
        "Importance": "Normal",
        "X-MSMail-Priority": "Normal",
        "Precedence": "bulk",
      },
    };

    log("Enviando email via SMTP...", {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
    });

    const info = await transporter.sendMail(mailData);

    logSuccess("EMAIL DE CONVITE ENVIADO COM SUCESSO!", {
      messageId: info.messageId,
      response: info.response,
      para: to,
    });

    return info;
  } catch (error) {
    logError("ERRO AO ENVIAR EMAIL DE CONVITE", {
      para: to,
      erro: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Falha ao enviar email de convite: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
