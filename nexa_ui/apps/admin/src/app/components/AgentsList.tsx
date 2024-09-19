import { MessageCircle, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { appFetch, BASE_URL } from '../utility';
import AgentCreatePopup from './AgentCreatePopup';

import {
  Card,
  CardContent,
  Button,
  Toaster,
  formatDate,
  Switch,
  toast,
} from '@nexa_ui/shared';

import { NavigateFunction, useNavigate } from 'react-router-dom';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Agent } from '../types';
import { setAgentAccess } from '../store';

const ExpandedAgentCard = ({
  agent,
  navigate,
}: {
  agent: Agent;
  navigate: NavigateFunction;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const [toggling, setToggling] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  async function toggleAccess() {
    try {
      setToggling(true);
      const response = await appFetch('/api/v1/agents/switch', {
        agent_name: 'admin',
        method: 'POST',
        body: JSON.stringify({
          agent_id: agent.agid,
          accessLevel: agent.access === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC',
        }),
      });
      if (response.ok) {
        console.log(await response.json());
        toast({
          title: 'Access switched',
          description: `${agent.name} access changed from ${
            agent.access === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
          } to ${agent.access}`,
          duration: 3000,
        });
        dispatch(setAgentAccess(agent.agid));
      }
      setToggling(false);
    } catch (error) {
      toast({
        title: 'Access switched',
        description: `Error switching`,
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  return (
    <div>
      <Card className={`w-full p-4 ${isExpanded ? 'rounded-b-none' : ''}`}>
        <CardContent className="flex items-center justify-between h-full">
          <h3 className="text-xl font-semibold">{agent.name}</h3>
          <div className="flex gap-2">
            <a href={BASE_URL`http://${agent.name}.localhost/chat`}>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="outline" onClick={() => navigate(`${agent.name}`)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={toggleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
        <CardContent className="py-0">
          <div className="flex justify-between text-xs text-muted-foreground select-none">
            <span className="capitalize">{agent.access}</span>
            <span>{formatDate(agent.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Expanded section with transition */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Card className="w-full p-4 rounded-t-none">
          <CardContent>
            <div className="flex mt-4 items-center justify-between">
              <span>Change access:</span>
              <Switch
                checked={agent.access === 'PUBLIC' ? true : false}
                onCheckedChange={toggleAccess}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {agent.access === 'PUBLIC'
                ? 'This agent is publicly accessible.'
                : 'This agent is private.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AgentsList() {
  const agents = useAppSelector((state) => state.agentsSlice.agents);
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-center mb-6 select-none">
          <h2 className="text-3xl font-bold">Nexabots</h2>
          <AgentCreatePopup />
        </div>

        <div className="flex flex-col gap-6">
          {agents &&
            agents.map((agent) => (
              <ExpandedAgentCard
                key={agent.agid}
                navigate={navigate}
                agent={agent}
              />
            ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
