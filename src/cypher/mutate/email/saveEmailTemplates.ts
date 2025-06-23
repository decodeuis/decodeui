import type { Transaction } from "neo4j-driver";

import { createAppState } from "~/createAppState";
import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { accountDeletionRequestForm } from "~/routes/internal/page/(email)/(templates)/(account)/accountDeletionSchema";
import { passwordResetForm } from "~/routes/internal/page/(email)/(templates)/(auth)/passwordResetSchema";
import { twoFactorAuthForm } from "~/routes/internal/page/(email)/(templates)/(auth)/twoFactorAuthSchema";
import { verificationCodeForm } from "~/routes/internal/page/(email)/(templates)/(auth)/verificationCodeSchema";
import { testEmailForm } from "~/routes/internal/page/(email)/(templates)/(other)/testEmailSchema";
import { emailChangedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailChangedSchema";
import { emailChangeSuccessfulForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailChangeSuccessfulSchema";
import { emailConfirmationForm } from "~/routes/internal/page/(email)/(templates)/(profile)/emailConfirmationSchema";
import { passwordChangedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/passwordChangedSchema";
import { profileUpdatedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/profileUpdatedSchema";
import { signupConfirmationForm } from "~/routes/internal/page/(email)/(templates)/(signup)/signupConfirmationSchema";
import { signupEmailVerificationForm } from "~/routes/internal/page/(email)/(templates)/(signup)/signupEmailVerificationSchema";
import { welcomeEmailForm } from "~/routes/internal/page/(email)/(templates)/(signup)/welcomeEmailSchema";
import { invitationEmailForm } from "~/routes/internal/page/(email)/(templates)/(user)/invitationEmailSchema";

const EMAIL_TEMPLATES = {
  AccountDeletionRequest: accountDeletionRequestForm,
  EmailChanged: emailChangedForm,
  EmailChangeSuccessful: emailChangeSuccessfulForm,
  EmailConfirmation: emailConfirmationForm,
  InvitationEmail: invitationEmailForm,
  PasswordChanged: passwordChangedForm,
  PasswordReset: passwordResetForm,
  ProfileUpdated: profileUpdatedForm,
  SignupConfirmation: signupConfirmationForm,
  SignupEmailVerification: signupEmailVerificationForm,
  TestEmail: testEmailForm,
  TwoFactorAuth: twoFactorAuthForm,
  VerificationCode: verificationCodeForm,
  WelcomeEmail: welcomeEmailForm,
} as const;

export function getEmailTemplateSchema(templateName: string) {
  return EMAIL_TEMPLATES[templateName as keyof typeof EMAIL_TEMPLATES];
}

export async function saveAllEmailTemplates(tx: Transaction) {
  for (const [templateName, schema] of Object.entries(EMAIL_TEMPLATES)) {
    const [graph, setGraph] = createAppState();
    const txnId = generateNewTxnId(graph, setGraph);

    const { error } = createMeta(
      schema,
      txnId,
      graph,
      setGraph,
      "EmailTemplate",
    );
    if (error) {
      throw new APIError(`Failed to create meta for ${templateName}`, 500);
    }

    const commitData = commitTxn(txnId, graph);
    if (!commitData) {
      throw new APIError(`Failed to upload ${templateName} template`, 500);
    }

    await mutateData(commitData, tx);
  }

  return { success: true };
}
