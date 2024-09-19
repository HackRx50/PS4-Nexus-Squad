import React, { useState, useEffect } from 'react';
import { useToast } from '@nexa_ui/shared';
import { Toaster } from '@nexa_ui/shared';
import ActionsForm from '../components/ActionsForm';
import ActionsList from '../components/ActionsList';
import { Action, DocumentMetaData } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addActions, addDocumentMetaData, setAppTitle } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import { appFetch, getActions, getDocuments } from '../utility';
import AgentDashBoardGurad from '../guards/AgentDashboardGuard';
import { E_TITLES } from '../constants';

type ToggleOption = 'action' | 'documents';

const AgentsPage: React.FC = () => {
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

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.DASHBOARD_PAGE_TITLE));
  }, []);

  const handleToggle = (option: ToggleOption) => {
    setSelectedToggle(option);
  };

  useEffect(() => {
    if (user) {
      appFetch(`/api/v1/agents/${agent_name}`, {
        agent_name: 'admin',
      }).then(async (result) => {
        const canWork = await result.json();
        if (canWork['agent'].owner !== user?.uid) {
          toast({
            title: 'Not Authorized',
            description: 'Agent Not Found',
            duration: 3000,
          });
          navigate('/agents');
        }
      });
    }
  }, [user, agent_name]);

  return (
    <AgentDashBoardGurad>
      <div className="flex h-screen">
        <ActionsList
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

export default AgentsPage;
