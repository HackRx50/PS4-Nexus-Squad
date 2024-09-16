import React, { useState, useEffect } from 'react';
import { useToast } from '@nexa_ui/shared';
import { Toaster } from '@nexa_ui/shared';
import ActionsForm from '../components/ActionsForm';
import ActionsList from '../components/ActionsList';
import { Action, DocumentMetaData } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addActions, addDocumentMetaData } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import { appFetch, getActions, getDocuments } from '../utility';
import AgentDashBoardGurad from '../guards/AgentDashboardGuard';

type ToggleOption = 'action' | 'documents';

const AgentDashboard: React.FC = () => {
  // action maker
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [actionTitle, setActionTitle] = useState('');
  const [requirements, setRequirements] = useState('requests');
  const [invalidPackages, setInvalidPackages] = useState<string[]>([]);
  const [selectedToggle, setSelectedToggle] = useState<ToggleOption>('action');
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const { agent_name } = useParams();
  const actionsMap = useAppSelector((state) => state.actionsSlice.actions);
  const actions = actionsMap[agent_name!];

  const user = useAppSelector((state) => state.userReducer.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { toast } = useToast();

  const handleDeleteAction = async (id: string) => {
    try {
      const response = await appFetch(`/api/v1/actions/${id}`, {
        method: 'DELETE',
        agent_name,
      });
      if (response.ok) {
        const data = await response.json();
        const newActions = actions.filter((action) => action.aid !== id);
        dispatch(addActions({ agent_name: agent_name!, actions: newActions }));

        toast({
          title: data.message,
          description: `The action with ${data.action_id} has been successfully deleted.`,
          duration: 3000,
        });
      } else {
        throw new Error('Failed to delete action');
      }
    } catch (error) {
      console.error('Error deleting action:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the action. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleToggle = (option: ToggleOption) => {
    setSelectedToggle(option);
  };


  useEffect(() => {
    if (user) {
      appFetch(`/api/v1/agents/${agent_name}`, {
        agent_name: "admin"
      }).then(async (result) => {
        const canWork = await result.json();
        if (canWork.owner !== user?.uid) {
          toast({
            title: "Not Authorized",
            description: "Agent Not Found",
            duration: 3000
          })
          navigate("/agents");
        }
      })
    }
  }, [user, agent_name])

  return (
    <AgentDashBoardGurad>
      <div className="flex h-screen">
        <ActionsList
          handleDeleteAction={handleDeleteAction}
          handleToggle={handleToggle}
          selectedToggle={selectedToggle}
        />

        <ActionsForm
          code={code}
          language={language}
          actionTitle={actionTitle}
          requirements={requirements}
          invalidPackages={invalidPackages}
          setCode={setCode}
          setLanguage={setLanguage}
          setActionTitle={setActionTitle}
          setRequirements={setRequirements}
          actions={actions}
          setActions={(actions) =>
            dispatch(addActions({ agent_name: agent_name!, actions }))
          }
          editingAction={editingAction}
          setEditingAction={setEditingAction}
          selectedToggle={selectedToggle}
        />
      </div>
      <Toaster />
    </AgentDashBoardGurad>
  );
};

export default AgentDashboard;
