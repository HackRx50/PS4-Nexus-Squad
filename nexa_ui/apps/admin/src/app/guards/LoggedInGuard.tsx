import React, { useEffect, useState } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';

import { useAppSelector } from '../hooks';
import CheckAuthLoader from './CheckAuthLoader';

export default function LoginPageGuard({ children }: { children: React.ReactNode }) {
  const { loaded } = useAuth();
  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectURL, setRedirectURL] = useState("")

  useEffect(() => {
    setRedirectURL(window.location.href);
  },[location])


  useEffect(() => {
    if (user) {
      const redirectURL = searchParams.get("redirect");
      const authURL = searchParams.get("auth");
      if (redirectURL && authURL && user.accessToken) {
        console.log(redirectURL, "Navigating")
        window.location.href = `${authURL}?accessToken=${user.accessToken}&redirectURL=${redirectURL}`
      }
      navigate('/agents');
    }
  }, [user]);

  if (!user && loaded === AuthLoadStatus.LOADING) {
    return (
      <CheckAuthLoader />
    );
  }

  return <>{children}</>;
}
