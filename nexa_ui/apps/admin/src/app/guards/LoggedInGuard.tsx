import React, { useEffect } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';

import { useAppSelector } from '../hooks';
import Spinner from '../components/Spinner';
import CheckAuthLoader from './CheckAuthLoader';

export default function LoginPageGuard({ children }: { children: React.ReactNode }) {
  const { loaded } = useAuth();
  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
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
