// CSS-in-JS versions of the constants
export const SETTINGS_CONSTANTS = {
  FORM_CSS: `return \`._id {
      padding: 10px;
      display: grid;
      gap: 20px;
    }\`;`,
  FORM_GRID_CSS: `return [
    \`._id {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;
    }\`,
    \`@media (min-width: 480px) {
      ._id {
        grid-template-columns: auto 1fr;
        gap-y: 24px;
        gap-x: 32px;
      }
    }\`
  ];`,
  GRID_ITEM_CSS: `return \`._id {
      display: grid;
      grid-template-columns: 200px 400px;
      align-items: center;
      gap: 8px;
    }\`;`,
  GRID_ITEM_NARROW_CSS: `return \`._id {
      display: grid;
      grid-template-columns: 150px 500px;
      align-items: center;
      gap: 8px;
    }\`;`,
  HEADER_MENU_CSS: `return \`._id {
      display: flex;
      background-color: \${args.theme.var.color.background_light_100};
      justify-content: space-between;
      border-radius: 7px;
    }\`;`,
  LABEL_CSS: `return \`._id {
      color: \${args.theme.var.color.text};
      font-weight: 500;
      font-size: 15px;
    }\`;`,
  MODAL: {
    BODY: {
      CSS: `return \`._id {
          padding: 16px;
        }\`;`,
      TEXT_CSS: `return \`._id {
          font-size: 18px;
          font-weight: 500;
          color: \${args.theme.var.color.text};
        }\`;`,
    },
    BUTTONS: {
      CANCEL_CSS: `return \`._id {
          background-color: \${args.theme.var.color.background_light_200};
          color: \${args.theme.var.color.text_dark_400};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid \${args.theme.var.color.border};
        }\`;`,
      DELETE_CSS: `return \`._id {
          background-color: \${args.theme.var.color.error};
          color: \${args.theme.var.color.error_text};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }\`;`,
      SAVE_CSS: `return \`._id {
          background-color: \${args.theme.var.color.primary};
          color: \${args.theme.var.color.primary_text};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }\`;`,
    },
    CONTAINER_CSS: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        border-radius: 4px;
        padding: 0;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: \${args.theme.var.color.background_light_100};
      }\`;`,
    FOOTER: {
      CSS: `return \`._id {
          display: flex;
          padding: 16px;
          gap: 6px;
          border-top: 1px solid \${args.theme.var.color.border};
          background-color: \${args.theme.var.color.background_light_100};
        }\`;`,
    },
    HEADER: {
      CSS: `return \`._id {
          padding: 16px;
          border-bottom: 1px solid \${args.theme.var.color.border};
        }\`;`,
      TEXT_CSS: `return \`._id {
          font-size: 18px;
          font-weight: 500;
          color: \${args.theme.var.color.text};
        }\`;`,
    },
    OVERLAY_CSS: `return \`._id {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: \${args.theme.var.color.background};
        opacity: 0.7;
      }\`;`,
  },
  SAVE_BUTTON_CSS: `return \`._id {
      background-color: \${args.theme.var.color.primary};
      color: \${args.theme.var.color.primary_text};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      margin-right: 8px;
    }\`;`,
  SECONDARY_BUTTON_CSS: `return \`._id {
      background-color: \${args.theme.var.color.primary_light_200};
      color: \${args.theme.var.color.primary_light_200_text};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
    }\`;`,
  SECTION_DIVIDER_CSS: `return \`._id {
      margin-top: 2rem;
      margin-bottom: 2rem;
      border-top: 1px solid \${args.theme.var.color.border};
    }\`;`,
  TITLE_CSS: `return \`._id {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: \${args.theme.var.color.text};
    }\`;`,
} as const;

// CSS-in-JS functions for standalone constants
export const headerIconButtonCss = `return \`._id {
    border: 1px solid \${args.theme.var.color.border};
    background-color: \${args.theme.var.color.background_light_100};
    color: \${args.theme.var.color.text_light_300};
    justify-content: center;
    padding: 0.25rem;
    border-radius: 5px;
    &:hover:not(:disabled) {
      color: \${args.theme.var.color.primary};
    }
    &:disabled {
      color: \${args.theme.var.color.text_light_100};
      cursor: not-allowed;
      opacity: 0.5;
    }
  }\`;`;

export const toolBarCss = `return \`._id {
    display: flex;
    background-color: \${args.theme.var.color.background_light_100};
    gap: 2px;
    border-radius: 5px;
  }\`;`;

export const profileImage = "/images/profile.png";
export const rectangleLogoImage = "/images/logo.svg";
export const squareLogoImage = "/images/logo_square.svg";

export const EMAIL_TEMPLATES = {
  AccountDeletionRequest: "AccountDeletionRequest",
  EmailChanged: "EmailChanged",
  EmailChangeSuccessful: "EmailChangeSuccessful",
  EmailConfirmation: "EmailConfirmation",
  InvitationEmail: "InvitationEmail",
  PasswordChanged: "PasswordChanged",
  PasswordReset: "PasswordReset",
  ProfileUpdated: "ProfileUpdated",
  SignupConfirmation: "SignupConfirmation",
  SignupEmailVerification: "SignupEmailVerification",
  TestEmail: "TestEmail",
  TwoFactorAuth: "TwoFactorAuth",
  VerificationCode: "VerificationCode",
  WelcomeEmail: "WelcomeEmail",
} as const;

export const isDev = false;

// CSS-in-JS version of CONSTANTS
export const CONSTANTS = {
  fullWidthCss: `return \`._id {
      width: 100%;
    }\`;`,
  inputBorderRadiusCss: `return \`._id {
      border-radius: 6px;
    }\`;`,
  inputFieldBorderCss: `return \`._id {
      border: 1px solid \${args.theme.var.color.border};
    }\`;`,
  inputFieldPaddingCss: `return \`._id {
      padding: 7px;
    }\`;`,
};

// CSS-in-JS version of PROPERTIES
export const PROPERTIES = {
  Css: {
    CheckBoxCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        background-color: \${args.theme.var.color.background_light_100};
        padding: 7px;
        border-radius: 6px;
        width: 20px;
        height: 20px;
      }\`;`,
    RadioButtonCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        background-color: \${args.theme.var.color.background_light_100};
        padding: 7px;
        border-radius: 6px;
      }\`;`,
    TextFieldCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        background-color: \${args.theme.var.color.background_light_100};
        color: \${args.theme.var.color.text};
        width: 100%;
        padding: 7px;
        min-width: 50px;
        border-radius: 6px;
      }\`;`,
  },
};

// CSS-in-JS version of STYLES
export const STYLES = {
  // Common button styles
  buttonCss: `return \`._id {
      cursor: pointer;
      transition: transform 0.2s linear;
    }\`;`,
  button2Css: `return \`._id {
      background-color: \${args.theme.var.color.primary};
      color: \${args.theme.var.color.primary_text};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
    }\`;`,

  // Container styles
  container: {
    baseCss: `return \`._id {
        display: flex;
        width: 100%;
      }\`;`,
    sectionCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        padding: 5px 10px;
        width: 100%;
      }\`;`,
    withBorderCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        border-radius: 5px;
      }\`;`,
  },

  iconButtonCss: `return \`._id {
      align-items: center;
      display: inline-flex;
    }\`;`,

  // Input styles
  input: {
    baseCss: `return \`._id {
        border: 1px solid \${args.theme.var.color.border};
        background-color: \${args.theme.var.color.background_light_100};
        color: \${args.theme.var.color.text};
        outline: none;
        border-radius: 6px;
        width: 100%;
      }\`;`,
    colorCss: `return \`._id {
        border: none;
        font-size: 14px;
        outline: none;
        width: 100%;
      }\`;`,
    textCss: `return \`._id {
        font-size: 14px;
        padding: 10px;
      }\`;`,
  },

  // Label styles
  labelCss: `return \`._id {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      gap: 5px;
      white-space: nowrap;
    }\`;`,

  overflowCss: `return \`._id {
      overflow: auto;
      scrollbar-color: \${args.theme.var.color.border} \${args.theme.var.color.background_light_300};
      scrollbar-width: thin;
    }\`;`,

  // Tooltip styles
  tooltip: {
    arrowCss: `return \`._id {
        background-color: \${args.theme.var.color.background_dark_800};
      }\`;`,
    contentCss: `return \`._id {
        text-align: center;
        background-color: \${args.theme.var.color.background_dark_800};
        color: \${args.theme.var.color.background_dark_800_text};
        font-size: 13px;
        font-family: poppins;
        font-weight: 300;
        max-width: fit-content;
        min-width: fit-content;
        padding: 3px 10px;
        border-radius: 5px;
        text-wrap: nowrap;
        width: 100%;
        z-index: 1;
      }\`;`,
  },
} as const;

export const APP_VERSION = "1.0.0";
export const APP_NAME = "DecodeUI";

// CSS-in-JS version of ICON_BUTTON_STYLES
export const ICON_BUTTON_STYLES = {
  baseCss: `return \`._id {
      cursor: pointer;
      transition: color 0.2s;
      padding: 0;
    }\`;`,
  defaultCss: `return \`._id {
      color: \${args.theme.var.color.text_light_200};
    }
    ._id:hover {
      color: \${args.theme.var.color.primary_dark_600};
    }\`;`,
  deleteCss: `return \`._id {
      color: \${args.theme.var.color.error};
    }
    ._id:hover {
      color: \${args.theme.var.color.error_light_200};
    }\`;`,
  spacingCss: `return \`._id {
      margin-right: 0.125rem;
    }\`;`,
} as const;
