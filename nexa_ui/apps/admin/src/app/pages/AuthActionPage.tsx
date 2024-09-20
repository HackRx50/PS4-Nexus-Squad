import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import ResetPasswordPage from "./ResetPasswordPage";
import VerifyEmailPage from "./VerifyEmail";
import { AUTH_ACTION_DEFAULT_REDIRECT_URL } from "../constants";

export default function AuthActionPage() {
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<string>();
    const [oobCode, setoobCode] = useState<string>();
    
    useEffect(() => {
        const mode = searchParams.get("mode");
        const oobCode = searchParams.get("oobCode");

        if (mode) {
            setMode(mode);
        }
        if (oobCode) {
            setoobCode(oobCode);
        }

        if (!mode || !oobCode) {
            window.location.href = AUTH_ACTION_DEFAULT_REDIRECT_URL;
        }
    }, []);

    if (mode === "resetPassword" && oobCode) {
        return <ResetPasswordPage oobCode={oobCode} />
    } 
    if (mode==="verifyEmail" && oobCode) {
        return <VerifyEmailPage oobCode={oobCode} />
    }

    return (
        <>
        </>
    )
}