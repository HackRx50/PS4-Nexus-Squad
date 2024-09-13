import React, { useEffect } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';

import { useAppSelector } from '../hooks';
import Spinner from '../components/Spinner';

export default function AgentDashBoardGurad({ children }: { children: React.ReactNode }) {
  const { loaded } = useAuth();
  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();
  const { agent_name } = useParams();

  useEffect(() => {
    if (agent_name == "") {
        navigate("/agents")
    }
  }, [agent_name])

  useEffect(() => {
    if (!user && loaded !== AuthLoadStatus.IDLE) {
      navigate('/');
    }
  }, [user]);

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

  return <>{children}</>;
}
