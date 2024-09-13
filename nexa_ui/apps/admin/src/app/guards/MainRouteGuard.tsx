import React, { useEffect } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';
import { useAppSelector } from '../hooks';
import Spinner from '../components/Spinner';

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <h1 className="text-xl font-semibold">Checking Authentication Status</h1>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{user ? children : <DefaultComponent />}</>;
}
