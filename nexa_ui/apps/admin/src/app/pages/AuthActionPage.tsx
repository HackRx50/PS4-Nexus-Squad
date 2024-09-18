import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import ResetPasswordPage from "./ResetPasswordPage";
import VerifyEmailPage from "./VerifyEmail";
import { useAppDispatch } from "../hooks";

export default function AuthActionPage() {
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<string>();
    const [oobCode, setoobCode] = useState<string>();

    const navigate = useNavigate();
    
    useEffect(() => {
        const mode = searchParams.get("mode");
        const apiKey = searchParams.get("apiKey");
        const oobCode = searchParams.get("oobCode");

        if (mode) {
            setMode(mode);
        }
        if (oobCode) {
            setoobCode(oobCode);
        }

        if (!mode || !oobCode) {
            window.location.href = "https://admin.nexaflow.co/login"
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