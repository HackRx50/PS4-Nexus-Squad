import { Copy, Delete, DeleteIcon, Eye, EyeOff, MessageCircle, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { appFetch, BASE_URL } from '../utility';
import APIKeyPopup from '../components/APIKeyPopup';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Toaster,
  formatDate,
  useToast,
} from '@nexa_ui/shared';
import { useState } from 'react';
import { APIKey } from '../types';

import { Trash } from "lucide-react";
import { removeAPIKey } from '../store';

const APIKeyCard = ({ apiKey, agent_name }: { apiKey: APIKey, agent_name: string }) => {
  const [showKey, setShowKey] = useState(false);
  const {toast} = useToast();
  const [deleting, setDeleting] = useState(false);
  const toggleShowKey = () => setShowKey(!showKey);
  const dispatch = useAppDispatch();

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey.key).then(() => {
      toast({
        title: `${agent_name} API key copied!`,
        duration: 3000
      })
    });
  };

  async function onDeleteAction() {
    setDeleting(true);
    try {
      const response = await appFetch(`/api/v1/api_key/${apiKey.uakid}`, {
        agent_name: "admin",
        method: "DELETE"
      })
      if (response.ok) {
        const result = await response.json();
        console.log(result)
        toast({
          title: "API Key",
          description: result.message,
          duration: 3000
        })
        dispatch(removeAPIKey(apiKey.uakid));
      } else {
        const result = await response.json();
        toast({
          title: "API Key",
          description: result.detail,
          duration: 3000,
          variant: "destructive"
        })
      }
    } catch(error){
      toast({
        title: "Error Deleting API Key",
        description: `${agent_name} api key deletion error`
      })
    }
    setDeleting(false);
  }

  return (
    <Card className={`${deleting ? "opacity-70 select-none": ""}`} >
      <CardHeader>{agent_name} - {apiKey.description}</CardHeader>
      <CardContent className="flex items-center justify-between h-full">
        <p className="text-sm">{showKey ? apiKey.key : <span className='select-none'>••••••••••••••••</span>}</p>
        <div className="flex gap-2">
          <Button variant="ghost" className='select-none'>{apiKey.use_count}</Button>
          <Button onClick={toggleShowKey} variant={"ghost"} size="sm">
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
          <Button onClick={copyKey} variant={"ghost"} size="sm">
            <Copy size={16} />
          </Button>
          <Button onClick={onDeleteAction} disabled={deleting} className='bg-red-800' variant={"ghost"} size="sm">
            <Trash size={16} />
          </Button>
        </div>
      </CardContent>
      <CardContent className="pb-4">
        <div className="flex justify-between text-xs text-muted-foreground select-none">
          <span>{formatDate(apiKey.created_at)}</span>
          <span>{formatDate(apiKey.expires_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function APIKeysPage() {
  const apikeys = useAppSelector((state) => state.apikeysSlice.apikeys);
  const agents = useAppSelector((state) => state.agentsSlice.agents);

  function getAgentName(agent_id: string): string {
    const index = agents.findIndex((v) => (v.agid === agent_id));
    return agents[index].name;
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-center mb-6 select-none">
          <h2 className="text-3xl font-bold">API Keys</h2>
          <APIKeyPopup />
        </div>

        <div className="flex flex-col gap-6">
          {apikeys &&
            apikeys.map((apikey) => (
              <APIKeyCard agent_name={getAgentName(apikey.agent)} apiKey={apikey} key={apikey.uakid} />
            ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
