import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  useToast,
  Toaster,
} from '@nexa_ui/shared';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../firebase.config';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setAppTitle } from '../store';
import { E_TITLES, EMAIL_VERIFICATION_REDIRECT_URL } from '../constants';
import VerificationPageGuard from '../guards/VerificationPageGuard';

const VerifyEmailPage = ({ oobCode }: { oobCode: string}) => {
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
        await applyActionCode(auth, oobCode);
        setEmailSentLoading(false);
        toast({
          title: 'Email Verified',
          description: 'Email Verification Successfull!',
          duration: 3000,
          type: 'background',
        });
        setTimeout(() => {
          window.location.href = EMAIL_VERIFICATION_REDIRECT_URL;
        }, 1000)
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
                <p>Click below to veify</p>
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
                    Verifying
                  </>
                ) : (
                  'Verify Email'
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
