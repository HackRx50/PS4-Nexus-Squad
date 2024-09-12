import React, { useState, useEffect } from "react";
import { useToast } from "@nexa_ui/shared";
import { Toaster } from "@nexa_ui/shared";
import ActionsForm from "../components/ActionsForm";
import ActionsList from "../components/ActionsList";
import actionsDummyData from "./actions.json";
import documentsDummyData from "./documents.json";

interface Action {
  code: string;
  created_at?: string;
  description: string;
  aid: string;
  language: string;
  title: string;
  updated_at?: string;
}

interface Document {
  doc_id: string;
  title: string;
  description: string;
  file_type: string;
  size: string;
  created_at?: string;
  updated_at?: string;
}

type ToggleOption = 'action' | 'documents';

const SimpleCodeEditor: React.FC = () => {
  // action maker
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [actionTitle, setActionTitle] = useState("");
  const [requirements, setRequirements] = useState("requests");
  const [invalidPackages, setInvalidPackages] = useState<string[]>([]);
  const [selectedToggle, setSelectedToggle] = useState<ToggleOption>('action');

  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [actions, setActions] = useState<Action[]>([]); // Update the state type
  const [documents, setDocuments] = useState<Document[]>([]); // Update the state type
  const [editingActionID, setEditingActionID] = useState<string | null>(
    null
  );

  const { toast } = useToast();

  useEffect(()=>{
    setActions(actionsDummyData.actions)
    setDocuments(documentsDummyData.documents)
  },[])

  useEffect(() => {
    fetch("/api/v1/actions")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(JSON.stringify(data));
        setActions(data.actions);
      });
  }, []);


  // const handleActionClick = (index: number) => {
  //   setCode(actions[index].code);
  //   setSelectedActionIndex(index);
  // };

  const handleEditAction = (index: string) => {
    // setEditingActionID(index)
    setEditingAction(actions.filter((input)=> input.aid === index)[0]);
  };


  const handleDeleteAction = async (id: string) => {
    try {
      const response = await fetch(
        `/api/v1/actions/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const newActions = actions.filter((action) => action.aid !== id);
        setActions(newActions);

        toast({
          title: data.message,
          description: `The action with ${data.action.id} has been successfully deleted.`,
          duration: 3000,
        });
      } else {
        throw new Error("Failed to delete action");
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete the action. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleToggle = (option: ToggleOption) => {
    setSelectedToggle(option);
  };

  return (
    <>
      <div className="flex h-screen">
        <ActionsList 
          actions={actions}
          handleEditAction={handleEditAction}
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
          setActions={setActions}
          editingAction={editingAction}
          setEditingAction={setEditingAction}
          selectedToggle={selectedToggle}
        />
        
      </div>
      <Toaster />
    </>
  );
};

export default SimpleCodeEditor;
