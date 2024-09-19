import React, { useEffect, useState } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';

import { useAppSelector } from '../hooks';
import CheckAuthLoader from './CheckAuthLoader';
import { appFetch, BASE_URL } from '../utility';
import Loading from '../components/Loading';

export default function LoginPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loaded } = useAuth();
  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectURL, setRedirectURL] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    setRedirectURL(window.location.href);
  }, [location]);

  function getSubdomain(url: string): [string, string, string] | null {
    try {
      const { hostname } = new URL(url);
      const [subdomain, mainDomain, TLDs] = hostname.split('.', 3);
      return [subdomain, mainDomain, TLDs];
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  }

  async function onUserCheck() {
    if (user) {
      const redirectURL = searchParams.get('redirect');
      const authURL = searchParams.get('auth');
      if (redirectURL && authURL && user.accessToken) {
        setCheckingAccess(true);
        const result = getSubdomain(redirectURL);
        if (result) {
          const [subdomain, mainDomain, tld] = result;
          if (
            mainDomain === 'localhost' ||
            (mainDomain === 'nexaflow' && tld === 'co')
          ) {
            const response = await appFetch(`/api/v1/agents/${subdomain}`, {
              accessToken: user.accessToken,
            });
            const data = await response.json();
            if (data.agent) {
              console.log(redirectURL, 'Navigating');
              setCheckingAccess(false);
              window.location.href = `${authURL}?accessToken=${user.accessToken}&redirectURL=${redirectURL}`;
            } else {
              return navigate('/error');
            }
          }
        }
      }
      setCheckingAccess(false);
      navigate('/agents');
    }
  }

  useEffect(() => {
    onUserCheck();
  }, [user]);

  if (!user && loaded === AuthLoadStatus.LOADING) {
    return <CheckAuthLoader />;
  }

  if (checkingAccess) {
    return <Loading message="Checking Access..." />;
  }

  return <>{children}</>;
}
