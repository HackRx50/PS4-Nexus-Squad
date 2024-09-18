import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  Input,
  DialogFooter,
  useToast,
  Toaster,
  formatDate,
} from '@nexa_ui/shared';

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { setAgents, setAppTitle } from '../store';
import { useDispatch } from 'react-redux';
import { PlusIcon, MessageCircle, Settings } from 'lucide-react';
import { appFetch, BASE_URL, getAgents } from '../utility';
import AgentDashBoardGurad from '../guards/AgentDashboardGuard';
import { E_TITLES } from '../constants';

type Agent = {
  owner: string;
  name: string;
  access: string;
  agid: string;
};

function AgentCreatePopup() {
  const user = useAppSelector((state) => state.userReducer.user);
  const [openStatus, setOpenStatus] = useState(false);
  const [newAgentInput, setNewAgentInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.AGENTS_PAGE_TITLE))
  }, [])

  useEffect(() => {
    if (submitCount > 0) {
      console.log('Checking...');
      isAvailable(newAgentInput).then((result) => {
        if (!result) {
          setError('Agent name is not available');
        } else {
          setError(null);
        }
      });
    }
  }, [newAgentInput]);

  async function isAvailable(name: string) {
    try {
      const response = await appFetch('/api/v1/agents/check-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        agent_name: 'admin',
        body: JSON.stringify({ name: newAgentInput }),
      });
      const data = await response.json();
      return data.data.result as boolean;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function onSubmit() {
    try {
      if (await isAvailable(newAgentInput)) {
        const response = await appFetch('/api/v1/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          agent_name: 'admin',
          body: JSON.stringify({ name: newAgentInput }),
        });

        // {
        //   "message": "Agent Created Successfully",
        //   "agent_id": "cm1157jce00009usbmoklko6h"
        // }
        const data = await response.json();
        setOpenStatus(false);
        getAgents().then((agents) => {
          dispatch(setAgents(agents));
        });
        toast({
          title: data.message,
          duration: 1500,
        });
      } else {
        setError('Agent name is not available.');
        setSubmitCount(submitCount + 1);
      }
    } catch (error) {
      toast({
        title: 'Agent create error',
        description: error as string,
        duration: 3000,
      });
    }
  }

  return (
    <Dialog open={openStatus} onOpenChange={(bool) => setOpenStatus(bool)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpenStatus(true)}
          variant="outline"
          aria-label="Create New Agent"
        >
          <PlusIcon /> {/* Using the Plus icon from lucide-react */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
          <DialogDescription>
            Enter the unique name for the agent
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Agent name"
              className="col-span-3"
              value={newAgentInput}
              onChange={(e) => {
                setNewAgentInput(e.target.value);
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue={user?.uid}
              className="col-span-3"
              disabled={true}
            />
          </div>
          <p>{error}</p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => onSubmit()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const AgentsPage = () => {
  const agents = useAppSelector((state) => state.agentsSlice.agents);
  const user = useAppSelector((state) => state.userReducer.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getAgents().then((agents) => {
        dispatch(setAgents(agents));
      });
    }
  }, [user]);


  return (
    <AgentDashBoardGurad>
      <div className="p-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Nexaflow</h1>
          <AgentCreatePopup />
        </div>

        <div className="flex flex-col items-center gap-6">
          {agents &&
            agents.map((agent) => (
              <Card key={agent.agid} className="w-full max-w-[1000px] p-4">
                <CardContent className="flex items-center justify-between h-full">
                  <h1 className="text-xl font-semibold">{agent.name}</h1>
                  <div className="flex gap-2">
                    <a href={BASE_URL`http://${agent.name}.localhost/chat`}>
                      <Button variant={'outline'}>
                        <MessageCircle />
                      </Button>
                    </a>
                    <Button
                      variant={'outline'}
                      onClick={() => navigate(`${agent.name}`)}
                    >
                      <Settings />
                    </Button>
                  </div>
                </CardContent>
                <CardContent className='py-0'>
                  <div className="flex justify-end text-xs text-muted-foreground">
                    <span>{formatDate(agent.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        <Toaster />
      </div>
    </AgentDashBoardGurad>
  );
};

export default AgentsPage;
