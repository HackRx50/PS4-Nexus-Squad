import { BASE_URL } from "./utility"

// Page Titles
export enum E_TITLES {
    ROOT_PAGE_TITLE = "Admin | Nexaflow",
    AGENTS_PAGE_TITLE = "Agents | Nexaflow",
    FORGOT_PAGE_TITLE = "Forgot Password? | Nexaflow",
    VERIFY_EMAIL_PAGE_TITLE = "Verify Email | Nexaflow",
    SIGNUP_PAGE_TITLE = "Signup | Nexaflow",
    LOGIN_PAGE_TITLE = "Login | Nexaflow",
    DASHBOARD_PAGE_TITLE = "Dashboard | Nexaflow",
    RESET_PASSWORD_PAGE_TITLE = "Reset Password | Nexaflow",
}
export const Domain = process.env.DOMAIN || "localhost";

export const AUTH_ACTION_DEFAULT_REDIRECT_URL = BASE_URL`http://localhost`;
export const EMAIL_VERIFICATION_REDIRECT_URL = BASE_URL`http://admin.localhost/agents`;
export const PASSWORD_RESET_REDIRECT_URL = BASE_URL`http://admin.localhost/login`;

export const TOAST_MESSAGES = {
    EMAIL_VERIFIED: {
        title: 'Email Verified',
        description: 'Email Verification Successful!',
    },
    USER_NOT_FOUND: {
        title: 'User not found',
        description: "Can't send verification email",
    },
    ERROR_SENDING_MAIL: {
        title: 'Error Sending Mail',
        description: '',
    },
    SIGNUP_SUCCESS: {
        title: 'User Signup successful',
        description: '',
    },
    EMAIL_VERIFICATION_SENT: {
        title: 'Verification email has been sent!',
        description: '',
    },
    VERIFICATION_EMAIL_SENT: {
        title: 'Verification Email',
        description: 'Verification email has been sent again!',
    },
    RESET_SUCCESS: {
        title: 'Password Reset Successful',
        description: '',
    },
    ERROR_RESETTING_PASSWORD: {
        title: 'Password Reset Unsuccessful',
        description: '',
    },
    LOGIN_SUCCESS: {
        title: 'Login Successful',
        description: '',
    },
    LOGIN_FAILED: {
        title: 'Login Failed',
        description: 'Invalid email or password.',
    },
    NAME_CHECK_FAILED: {
        title: 'Name Check Failed',
        description: 'Agent name is not available.',
    },
    API_KEY_SUCCESS: {
        title: "API Key Creation",
        description: "API Key Creation Succesfull"
    },
    API_KEY_FAILURE: {
        title: "API Key Creation Failure"
    }
};