import React, { useEffect } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';
import { useAppSelector } from '../hooks';
import Spinner from '../components/Spinner';
import CheckAuthLoader from './CheckAuthLoader';

export default function MainRouteGuard({
  children,
  DefaultComponent,
}: {
  children: React.ReactNode;
  DefaultComponent: React.ComponentType;
}) {
  const { loaded } = useAuth()!;
  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded === AuthLoadStatus.IDLE && !user) {
      return;
    }
    if (loaded === AuthLoadStatus.LOADING) {
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, loaded, navigate]);

  if (!user && loaded === AuthLoadStatus.LOADING) {
    return (
      <CheckAuthLoader />
    );
  }

  return <>{user ? children : <DefaultComponent />}</>;
}
