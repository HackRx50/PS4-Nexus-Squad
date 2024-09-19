import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  Toaster,
  useToast,
} from '@nexa_ui/shared';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAppDispatch } from '../hooks';
import { setAppTitle } from '../store';
import { E_TITLES, PASSWORD_RESET_REDIRECT_URL, TOAST_MESSAGES } from '../constants';

import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase.config';


const ResetPasswordPage = ({ oobCode }: { oobCode: string }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toasts } = useToast();
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.RESET_PASSWORD_PAGE_TITLE));
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setFormSubmissionLoading(true);

      if (password === confirmPassword) {
        await confirmPasswordReset(auth, oobCode, password);
      }
      toasts.push({
        id: 'Reset Successful',
        title: TOAST_MESSAGES.RESET_SUCCESS.title,
        duration: 3000,
      });

      setTimeout(() => {
        window.location.href = PASSWORD_RESET_REDIRECT_URL;
      });
      setFormSubmissionLoading(false);
    } catch (err) {
      toasts.push({
        id: 'Error Resetting Password',
        title: TOAST_MESSAGES.ERROR_RESETTING_PASSWORD.title,
        duration: 3000,
        variant: "destructive",
      });

      console.log(err);
      setFormSubmissionLoading(false);
    }
  };

  return (
    <>
      {formSubmissionLoading ? <Loading message="" /> : ''}

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="scroll-m-20 text-sm font-semibold tracking-tight">
              Nexaflow
            </h2>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Reset Password
            </h4>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="my-4">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-500">
                    Log in
                  </Link>{' '}
                  {/* Add this line */}
                </p>
              </div>
              <Button type="submit" variant="default">
                Reset
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  );
};

export default ResetPasswordPage;
