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
  Input,
  DialogFooter,
  useToast,
  Textarea,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@nexa_ui/shared';

import { setAgents, setAppTitle } from '../store';
import { useDispatch } from 'react-redux';
import {
  Loader2,
  PlusIcon,
} from 'lucide-react';
import { appFetch, getAgents } from '../utility';
import { E_TITLES, TOAST_MESSAGES } from '../constants';
import { Agent } from '../types';
import Loading from '../components/Loading';

export default function AgentCreatePopup() {
  const [openStatus, setOpenStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [newAgentInput, setNewAgentInput] = useState('');
  const [agentType, setAgentType] = useState('PRIVATE');
  const [description, setDescription] = useState('');

  const [agentCreationLoading, setAgentCreationLoading] = useState(false);

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.AGENTS_PAGE_TITLE));
  }, []);

  useEffect(() => {
    if (submitCount > 0) {
      isAvailable(newAgentInput);
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
      toast({
        title: TOAST_MESSAGES.NAME_CHECK_FAILED.title,
        description: TOAST_MESSAGES.NAME_CHECK_FAILED.description,
        duration: 3000,
        variant: 'destructive',
      });
      return false;
    }
  }

  async function onSubmit() {
    try {
      setAgentCreationLoading(true);
      if (await isAvailable(newAgentInput)) {
        const response = await appFetch('/api/v1/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          agent_name: 'admin',
          body: JSON.stringify({
            name: newAgentInput,
            type: agentType,
            description,
          }),
        });

        const data: { message: string; agent: Agent } = await response.json();
        setOpenStatus(false);

        const agents = await getAgents();
        dispatch(setAgents(agents));

        toast({
          title: data.message,
          duration: 3000,
        });
        setAgentCreationLoading(false);
      } else {
        setError('Agent name is not available.');
        setSubmitCount(submitCount + 1);
      }
    } catch (error) {
      setAgentCreationLoading(false);
      toast({
        title: 'Agent create error',
        description: error as string,
        duration: 3000,
      });
    }
  }

  return (
    <>
      {agentCreationLoading ? <Loading message="Creating Agent..." /> : ''}
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
                required={true}
                onChange={(e) => {
                  setNewAgentInput(e.target.value);
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-type" className="text-right">
                Access
              </Label>
              <div className="col-span-3">
                <Select value={agentType} onValueChange={setAgentType}>
                  <SelectTrigger id="agent-type" className="w-full">
                    <SelectValue placeholder="Select Agent Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter Agent Description (Optional)"
                className="col-span-3"
                required={false}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <p>{error}</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={agentCreationLoading} onClick={() => onSubmit()}>
              {
                agentCreationLoading ?
                  <>
                    <Loader2
                      className={`transition-transform duration-300 animate-spin mr-2`}
                    />{' '}
                    Creating
                  </> : <>Create</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}