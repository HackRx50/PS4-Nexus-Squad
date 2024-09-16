import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { setAccessToken } from "../store";

export default function AuthenticatePage() {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch()
    const navigate = useNavigate();
    
    useEffect(() => {
        const redirectURL = searchParams.get("redirectURL");
        const accessToken = searchParams.get("accessToken");
        if (accessToken && redirectURL) {
            const url = new URL(redirectURL);
            dispatch(setAccessToken({ accessToken }));
            navigate(url.pathname);
        }
    }, [])
    return <div>Authenticating...</div>
}