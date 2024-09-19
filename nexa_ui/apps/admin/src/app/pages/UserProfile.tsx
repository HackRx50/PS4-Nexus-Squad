import { useEffect, useState } from 'react';
import { appFetch, decryptMessage } from '../utility';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setUserLimits } from '../store';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nexa_ui/shared';
import { CheckCircle, XCircle } from 'lucide-react';

export default function UserProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userReducer.user);

  async function getUserData() {
    const response = await appFetch('/api/v1/user', {
      agent_name: 'admin',
    });
    if (response.ok) {
      const userResp = await response.text();
      const userJSON = await decryptMessage(userResp);
      const user = JSON.parse(userJSON);
      dispatch(setUserLimits(user['user']['availableLimits']));
    }
  }

  useEffect(() => {
    getUserData();
  }, [user]);

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="mb-4">{user?.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verified:</span>
              {user?.emailVerified ? (
                <Badge variant="default" className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> Not Verified
                </Badge>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">
                Available Limits: <span>{user?.availbaleLimits}</span>
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
