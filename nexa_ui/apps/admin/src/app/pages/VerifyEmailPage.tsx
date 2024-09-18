import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  useToast,
  Toaster,
} from '@nexa_ui/shared';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.config';
import { Loader2 } from 'lucide-react';
import VerificationPageGuard from '../guards/VerificationPageGuard';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setAppTitle } from '../store';
import { E_TITLES } from '../constants';

const VerifyEmailPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [emailSentLoading, setEmailSentLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.VERIFY_EMAIL_PAGE_TITLE))
  }, [])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        setEmailSentLoading(true);
        await sendEmailVerification(user);
        setEmailSentLoading(false);
        toast({
          title: 'Verification Email',
          description: 'Verification email has been sent again!',
          duration: 3000,
          type: 'background',
        });
      } else {
        toast({
          title: 'User not found',
          description: "Can't send verification email",
          duration: 3000,
          type: 'background',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Sending Mail',
        description: error as any,
        duration: 3000,
        variant: 'destructive',
      });
      setEmailSentLoading(false);
    }
  };

  return (
    <VerificationPageGuard>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="scroll-m-20 text-sm font-semibold tracking-tight">
              Nexaflow
            </h2>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Verify Email
            </h4>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <p>Please Check Your Email For Verification Mail</p>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button
                type="submit"
                variant="default"
                disabled={emailSentLoading}
              >
                {emailSentLoading ? (
                  <>
                    <Loader2
                      className={`transition-transform duration-300 animate-spin mr-2`}
                    />{' '}
                    Sending Mail
                  </>
                ) : (
                  'Send Mail'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </VerificationPageGuard>
  );
};

export default VerifyEmailPage;
