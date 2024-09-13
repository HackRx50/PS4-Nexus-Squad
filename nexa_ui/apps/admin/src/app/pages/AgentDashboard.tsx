import React, { useState, useEffect } from 'react';
import { useToast } from '@nexa_ui/shared';
import { Toaster } from '@nexa_ui/shared';
import ActionsForm from '../components/ActionsForm';
import ActionsList from '../components/ActionsList';
import { Action, DocumentMetaData } from '../types';
import MainRouteGuard from '../guards/MainRouteGuard';
import AgentDashBoardGurad from '../guards/AgentDashboardGuard';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addActions, addDocumentMetaData } from '../store';
import { useParams } from 'react-router-dom';
import { getActions, getDocuments } from '../utility';
import { BASE_URL } from '../constants';

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
  const actionsMap = useAppSelector((state) => state.actionsSlice.actions);
  const documentsMap = useAppSelector((state) => state.documentsSlice.documentMetaData);
  const [actions, setActions] = useState<Action[]>([]);
  const dispatch = useAppDispatch();

  const [documents, setDocuments] = useState<DocumentMetaData[]>([]);
  const [editingActionID, setEditingActionID] = useState<string | null>(null);

  const { toast } = useToast();
  const { agent_name } = useParams();

  useEffect(() => {
    if (agent_name && actionsMap[agent_name]) {
      setActions(actionsMap[agent_name]);
    }
  }, [agent_name, actionsMap]);
  
  useEffect(() => {
    if (agent_name && documentsMap[agent_name]) {
      setDocuments(documentsMap[agent_name]);
    }
  }, [agent_name, actionsMap]);

  useEffect(() => {
    getActions(agent_name!)
      .then(actions => dispatch(addActions({ agent_name: agent_name!, actions })));
    getDocuments(agent_name!)
      .then(documents => dispatch(addDocumentMetaData({ agent_name: agent_name!, documents })));
  }, []);



  const handleDeleteAction = async (id: string) => {
    try {
      const response = await fetch(
        BASE_URL`http://${agent_name!}.localhost/api/v1/actions/${id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
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

  return (
    <AgentDashBoardGurad>
      <div className="flex h-screen">
        <ActionsList
          actions={actions}
          handleDeleteAction={handleDeleteAction}
          handleToggle={handleToggle}
          selectedToggle={selectedToggle}
          documentsData={documents}
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
