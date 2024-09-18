import { BASE_URL } from "./utility"

// Page Titles
export enum E_TITLES {
    ROOT_PAGE_TITLE = "Admin | Nexaflow",
    AGENTS_PAGE_TITLE = "Agents | Nexaflow",
    FORGOT_PAGE_TITLE = "Forgot Password? | Nexaflow",
    VERIFY_EMAIL_PAGE_TITLE = "Verify Email | Nexaflow",
    SIGNUP_PAGE_TITLE = "Signup | Nexaflow",
    LOGIN_PAGE_TITLE = "Signup | Nexaflow",
    DASHBOARD_PAGE_TITLE = "Dashboard | Nexaflow",
    RESET_PASSWORD_PAGE_TITLE = "Reset Password | Nexaflow",
}

export const EMAIL_VERIFICATION_REDIRECT_URL = BASE_URL`http://admin.nexaflow.co/agents`;
export const PASSWORD_RESET_REDIRECT_URL = BASE_URL`http://admin.nexaflow.co/login`;

export const Domain = process.env.DOMAIN || "localhost";
