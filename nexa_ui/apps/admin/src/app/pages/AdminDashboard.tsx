import { useEffect, useState } from 'react';
import { Card, CardContent, Button, cn } from '@nexa_ui/shared';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { setAgents, setAPIkeys } from '../store';
import { useDispatch } from 'react-redux';
import { Home, Users, KeyRoundIcon, BarChart } from 'lucide-react';
import { getAgents, getAPIKeys } from '../utility';
import AgentDashBoardGurad from '../guards/AgentDashboardGuard';

const AdminDashboard = () => {
  const user = useAppSelector((state) => state.userReducer.user);
  const agents = useAppSelector((state) => state.agentsSlice.agents);
  const apiKeys = useAppSelector((state) => state.apikeysSlice.apikeys);
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getAgents().then((agents) => {
        dispatch(setAgents(agents));
      }).then(() => {
        getAPIKeys().then((apikeys) => {
          dispatch(setAPIkeys(apikeys));
        })
      });
    }
  }, [user]);


  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Agents', icon: Users, path: '/agents' },
    { name: 'API Keys', icon: KeyRoundIcon, path: '/apikeys' },
    { name: 'Analytics', icon: BarChart, path: '/analytics' },
  ];

  return (
    <AgentDashBoardGurad>
      <div className="flex h-screen">
        <Card className="w-64 h-full rounded-none fixed left-0 top-0 bottom-0">
          <CardContent className="py-6 w-full flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-6">Nexaflow</h1>
            <nav className="space-y-4 flex-grow">
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    pathname === item.path
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>
        <div className="ml-64 flex-grow">
          <Outlet />
        </div>
      </div>
    </AgentDashBoardGurad>
  );
};

export default AdminDashboard;
