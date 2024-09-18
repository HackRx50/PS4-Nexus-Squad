import React, { useEffect } from 'react';
import { AuthLoadStatus, useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@nexa_ui/shared';

import { useAppSelector } from '../hooks';
import Spinner from '../components/Spinner';
import CheckAuthLoader from './CheckAuthLoader';

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
    console.log(user)
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
    if (user && !user.emailVerified){
      navigate("/verify-email")
      return;
    }
  }, [user, loaded, navigate]);

  if (!user && loaded === AuthLoadStatus.LOADING) {
    return (
      <CheckAuthLoader />
    );
  }

  return <>{children}</>;
}
