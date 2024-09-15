import React, { useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader, useToast, Toaster } from '@nexa_ui/shared';
import SignupPageGuard from '../guards/SignupPageGuard';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase.config';
import Loading from '../components/Loading';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);
  const { toast } = useToast();


  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      if (email) {
        setFormSubmissionLoading(true);
        await sendPasswordResetEmail(auth, email);
        setFormSubmissionLoading(false);
      }
      toast({ 
        title: "Mail Sent",
        description: "Reset link has been sent on the registered mail.",
        duration: 3000,
        type: 'background',
      })
    } catch(error) {
      toast({ 
        title: "Error Sending Mail",
        description: (error as any),
        duration: 3000,
        variant: "destructive"
      })
      setFormSubmissionLoading(false);
    }
  };

  return (
    <SignupPageGuard>
      { formSubmissionLoading ? <Loading message='' /> : "" }
      <div
        className="flex items-center justify-center min-h-screen"
      >
      {/* <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'rgb(14, 14, 15)' }}
      > */}
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
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="my-4">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-500">Log in</Link> {/* Add this line */}
                </p>
              </div>
              <Button type="submit"  variant="default">
                Send Mail
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </SignupPageGuard>
  );
};

export default ForgotPasswordPage;
