import type { Session } from "neo4j-driver";

import juice from "juice";
import nodemailer from "nodemailer";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

import { useEmail } from "./functions/getEmailService";
import type { Vertex } from "~/lib/graph/type/vertex";

interface EmailOptions {
  attachmentName?: string;
  attachmentPath?: string;
  content: string;
  subDomain: string;
  subject: string;
  to: string;
}

export async function sendEmail(options: EmailOptions) {
  const { attachmentName, attachmentPath, content, subDomain, subject, to } =
    options;

  // Process HTML content with juice to inline CSS
  const processedContent = juice(content);

  const dbSettings = await getEmailSettings(subDomain);
  let emailInfo;
  try {
    if (dbSettings?.P.active && dbSettings.P.active !== "smtp") {
      // Use email service provider if active
      const emailService = useEmail(dbSettings);
      emailInfo = await emailService.send({
        // Not supported yet
        // attachments: attachmentPath && attachmentName ? [{
        //   filename: attachmentName,
        //   path: attachmentPath,
        // }] : undefined,
        from: dbSettings.P.from,
        html: processedContent,
        subject,
        to,
      });
    } else {
      // Fall back to SMTP if no active provider
      const transporter = nodemailer.createTransport({
        auth: {
          pass: dbSettings?.P.smtpPassword || process.env.SMTP_PASS,
          user: dbSettings?.P.smtpUsername || process.env.SMTP_USER,
        },
        host: dbSettings?.P.smtpHost || process.env.SMTP_HOST,
        port: dbSettings?.P.smtpPort || Number(process.env.SMTP_PORT),
        secure:
          (dbSettings?.P.secure ?? process.env.SMTP_SECURE)
            ? process.env.SMTP_SECURE === "true"
            : false,
        tls: {
          rejectUnauthorized: false,
        },
        // debug: true,
        // logger: true,
      });

      const emailOptions: nodemailer.SendMailOptions = {
        attachments:
          attachmentPath && attachmentName
            ? [
                {
                  filename: attachmentName,
                  path: attachmentPath,
                },
              ]
            : undefined,
        from: dbSettings?.P.from || process.env.SMTP_FROM,
        html: processedContent,
        subject,
        to,
      };

      emailInfo = await transporter.sendMail(emailOptions);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    // Continue execution to save to database even if email fails
  }

  await saveEmailToDatabase(subDomain, {
    attachmentName,
    attachmentPath,
    content: processedContent, // Save the processed content
    dbSettings,
    emailInfo,
    subject,
    to,
  });

  return emailInfo;
}

async function getEmailSettings(subDomain: string): Promise<null | Vertex> {
  const driver = await getDriver();
  const dbSession = driver.session({ database: subDomain });

  try {
    const emailSettingVertex = await getEmailSettingVertex(
      subDomain,
      dbSession,
    );
    return emailSettingVertex || getEnvEmailSettings();
  } finally {
    await dbSession.close();
  }
}

async function getEmailSettingVertex(
  subDomain: string,
  dbSession: Session,
): Promise<null | Vertex> {
  if (subDomain === ADMIN_DB_NAME) {
    return await getSystemEmailSettings(subDomain, dbSession);
  }

  return (
    (await getSubdomainEmailSettings(dbSession)) ||
    (await getParentAccountEmailSettings(subDomain))
  );
}

function getEnvEmailSettings(): null | Vertex {
  if (
    !(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
    )
  ) {
    return null;
  }

  return {
    id: "EmailSetting",
    IN: {},
    L: [],
    OUT: {},
    P: {
      active: "smtp",
      from: process.env.SMTP_FROM,
      secure: process.env.SMTP_SECURE === "true",
      smtpHost: process.env.SMTP_HOST,
      smtpPassword: process.env.SMTP_PASS,
      smtpPort: Number(process.env.SMTP_PORT),
      smtpUsername: process.env.SMTP_USER,
    },
  };
}

async function getParentAccountEmailSettings(
  subDomain: string,
): Promise<null | Vertex> {
  const driver = await getDriver();
  const systemSession = driver.session({ database: ADMIN_DB_NAME });

  try {
    return await getSystemEmailSettings(subDomain, systemSession);
  } finally {
    await systemSession.close();
  }
}

async function getSubdomainEmailSettings(
  dbSession: Session,
): Promise<null | Vertex> {
  const result = await dbSession.run(
    `MATCH (e:EmailSetting)
     WHERE e.active IS NOT NULL AND e.active <> ''
     RETURN e as settings
     LIMIT 1`,
  );

  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("settings"))
    : null;
}

async function getSystemEmailSettings(
  subDomain: string,
  dbSession: Session,
): Promise<null | Vertex> {
  const result = await dbSession.run(
    `MATCH (s:SubDomain {key: $subDomain})<-[:AccountSubdomain]-(a:Account)
     MATCH (a)-[:AccountEmailSetting]->(e:EmailSetting)
     WHERE e.active IS NOT NULL AND e.active <> ''
     RETURN e as settings
     LIMIT 1`,
    { subDomain },
  );

  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("settings"))
    : null;
}

async function saveEmailToDatabase(
  subDomain: string,
  {
    attachmentName,
    attachmentPath,
    content,
    dbSettings,
    emailInfo,
    subject,
    to,
  }: {
    attachmentName?: string;
    attachmentPath?: string;
    content: string;
    dbSettings: null | Vertex;
    emailInfo: nodemailer.SentMessageInfo | undefined;
    subject: string;
    to: string;
  },
) {
  const dbSession = (await getDriver()).session({ database: subDomain });
  try {
    await dbSession.run(
      `CREATE (e:Email {
        from: $from,
        to: $to,
        subject: $subject,
        content: $content,
        attachmentName: $attachmentName,
        attachmentPath: $attachmentPath,
        messageId: $messageId,
        sentAt: datetime(),
        status: $status
      })`,
      {
        attachmentName: attachmentName || null,
        attachmentPath: attachmentPath || null,
        content,
        from: dbSettings?.P.from || process.env.SMTP_FROM || null,
        messageId:
          emailInfo && "messageId" in emailInfo ? emailInfo.messageId : null,
        status: emailInfo ? "sent" : "failed",
        subject,
        to,
      },
    );
  } finally {
    await dbSession.close();
  }
}
