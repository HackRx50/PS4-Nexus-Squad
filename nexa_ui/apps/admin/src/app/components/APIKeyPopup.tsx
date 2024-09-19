import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  DialogFooter,
  useToast,
  Textarea,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@nexa_ui/shared';

import { addAPIKey, setAppTitle } from '../store';
import { useDispatch } from 'react-redux';
import { Loader2, PlusIcon } from 'lucide-react';
import { appFetch, decryptMessage, getAgents } from '../utility';
import { E_TITLES, TOAST_MESSAGES } from '../constants';
import {  APIKey } from '../types';
import { useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';

export default function APIkeyPopup() {
  const [openStatus, setOpenStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const agents = useAppSelector((state) => state.agentsSlice.agents);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [description, setDescription] = useState('');

  const [apiCreationLoading, setApiCreationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.DASHBOARD_PAGE_TITLE));
  }, []);

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [selectedAgent]);

  async function onSubmit() {
    try {
      if (!selectedAgent) {
        setError("Please select an agent.")
        return;
      }
      setApiCreationLoading(true);
      const response = await appFetch('/api/v1/api_key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        agent_name: 'admin',
        body: JSON.stringify({
          description,
          agent_id: selectedAgent,
        }),
      });
      if (response.ok) {
        const data = await response.text();
        const decryptedData = await decryptMessage(data);
        const jsonData: APIKey = JSON.parse(decryptedData);
        dispatch(addAPIKey(jsonData));
        toast({
          title: TOAST_MESSAGES.API_KEY_SUCCESS.title,
          description: TOAST_MESSAGES.API_KEY_SUCCESS.description,
          duration: 3000,
        });
      }
      setApiCreationLoading(false);
      setOpenStatus(false);
    } catch (error) {
      console.log(error);
      toast({
        title: TOAST_MESSAGES.API_KEY_FAILURE.title,
        description: error as string,
        duration: 3000,
      });
      setApiCreationLoading(false);
    }
  }

  return (
    <>
      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpenStatus(true)}
            variant="outline"
            aria-label="Generate API Key"
          >
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate API key</DialogTitle>
            <DialogDescription>
              Generate API key to use in your app
            </DialogDescription>
          </DialogHeader>
          {
            agents.length > 0
            ? (
              <>
                <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-type" className="text-right">
                Agent
              </Label>
              <div className="col-span-3">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger id="agent-type" className="w-full">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.agid} value={agent.agid}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter API Key Description"
                className="col-span-3"
                required={true}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={apiCreationLoading} onClick={onSubmit}>
              {apiCreationLoading ? (
                <>
                  <Loader2
                    className={`transition-transform duration-300 animate-spin mr-2`}
                  />{' '}
                  Generating
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
              </>
            ) : (
              <div className='flex flex-col'>
                <span className='opacity-70'>No Agent Found</span>
                <Button>Create Agent</Button>
              </div>
            )

          }
        </DialogContent>
      </Dialog>
    </>
  );
}
