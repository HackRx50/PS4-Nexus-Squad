import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { AUTH_ACTION_DEFAULT_REDIRECT_URL } from '../constants';

export default function VerificationPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(state => state.userReducer.user);
  const navigate = useNavigate();
  const { search } = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<string>();
  const [oobCode, setoobCode] = useState<string>();
  const [apiKey, setAPIKey] = useState<string>();

  useEffect(() => {
    if (user) {
      if (user.emailVerified) 
        navigate('/');
    } else {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");
      const apiKey = searchParams.get("apiKey");
      if (mode) {
        setMode(mode);
      }
      if (apiKey) {
        setAPIKey(apiKey);
      }
      if (oobCode) {
        setoobCode(oobCode);
      }
      if (!mode || !oobCode) {
        navigate("/login");
      } else {
        navigate(`/login${search}`)
      }
    }
  }, [user]);

  return <>{children}</>;
}
