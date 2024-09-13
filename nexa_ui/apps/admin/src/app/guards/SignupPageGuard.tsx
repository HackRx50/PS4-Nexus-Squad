import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';

export default function SignupPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(state => state.userReducer.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  return <>{children}</>;
}
