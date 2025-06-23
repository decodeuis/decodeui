export const API = {
  auth: {
    autoSignInUrl: "/api/auth/autoSignIn",
    changePasswordUrl: "/api/auth/changePassword",
    // getUserUrl: "/api/auth/getUserRPC",
    signInUrl: "/api/auth/signin",
    logOutUrl: "/api/auth/logout",
    passwordReset: {
      completeUrl: "/api/auth/password-reset/complete",
      requestUrl: "/api/auth/password-reset/request",
      verifyOtpUrl: "/api/auth/password-reset/verifyOtp",
    },
    prepareAutoSignInUrl: "/api/auth/prepareAutoSignIn",
    profileUrl: "/api/auth/updateProfile",
    resendEmailConfirmationUrl: "/api/auth/resendEmailConfirmation",
    signUpUrl: "/api/auth/signup",
    updateProfileImageUrl: "/api/auth/updateProfileImage",
  },
  email: {
    auditUrl: "/api/email/audit",
  },
  file: {
    deleteFileUrl: "/api/file/delete",
    downloadCompanyRectangularLogoUrl:
      "/api/file/downloadCompanyRectangularLogo",
    downloadCompanySquareLogoUrl: "/api/file/downloadCompanySquareLogo",
    downloadFileUrl: "/api/file/download",
    replaceFileUrl: "/api/file/replace",
    uploadFileUrl: "/api/file/upload",
  },
  // Other endpoints
  // getInitialDataUrl: "/api/get/getInitialData",
  page: {
    deletePageUrl: "/api/page/delete",
  },
  permission: {
    deletePermissionUrl: "/api/permissions/delete",
  },
  role: {
    deleteRoleUrl: "/api/roles/delete",
    getRolesUrl: "/api/roles/list",
    getRoleUrl: "/api/roles/get",
    upsertRoleUrl: "/api/roles/upsert",
  },
  settings: {
    activity: {
      getUrl: "/api/settings/activity/list",
    },
    company: {
      getUrl: "/api/settings/company/get",
      updateLogoUrl: "/api/settings/updateCompanyLogo",
      updateUrl: "/api/settings/company/update",
    },
    email: {
      getUrl: "/api/settings/email/get",
      testUrl: "/api/settings/email/test",
      updateUrl: "/api/settings/email/update",
    },
    general: {
      getUrl: "/api/settings/general/get",
      updateUrl: "/api/settings/general/update",
    },
    theme: {
      deleteUrl: "/api/settings/theme/delete",
    },
  },
  subdomain: {
    activityUrl: "/api/subdomain/activity",
    createUrl: "/api/subdomain/create",
    deleteUrl: "/api/subdomain/delete",
    listUrl: "/api/subdomain/list",
    updateUrl: "/api/subdomain/update",
  },
  submitDataUrl: "/api/submit/submitData",
  support: {
    createTicketUrl: "/api/support/ticket/create",
    deleteTicketUrl: "/api/support/ticket/delete",
    getTicketsUrl: "/api/support/ticket/list",
    getTicketUrl: "/api/support/ticket/get",
    replyUrl: "/api/support/ticket/reply",
    upsertTicketUrl: "/api/support/ticket/upsert",
  },
  urls: {
    admin: {
      contact: "/support/contact",
      globalSettings: "/admin/GlobalSettings",
      signIn: "/auth/signin",
      // it's name is admin, but its for subdomains
      root: "/admin/",
      support: "/admin/support",
      userSettings: "/admin/UserSettings",
    },
    system: {
      globalSettings: "/system/GlobalSettings",
      projects: "/system/projects",
      root: "/system/projects",
      userSettings: "/system/UserSettings",
    },
    user: {
      forgotPassword: "/auth/forgotPassword",
      logout: "/auth/logout",
      signUp: "/auth/signup",
    },
  },
  user: {
    deleteUserUrl: "/api/users/delete",
    getUsersListUrl: "/api/users/list",
    inviteUserUrl: "/api/users/invite",
    selfDeleteUrl: "/api/users/self-delete",
    updateUserUrl: "/api/users/update",
  },
} as const;

export function generate401RedirectUrl(pathname: string): string {
  return `${API.urls.admin.signIn}?redirectUrl=${encodeURIComponent(pathname)}`;
}
