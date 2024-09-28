import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { appFetch, getSessions } from '../utilities';
import { removeSession, setSessions } from '../store';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  formatDate,
  useToast,
} from '@nexa_ui/shared';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useTheme } from './theme-provider';
import { Message, ToolMessage } from '../types';

export function ActionCallList() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const sessions = useAppSelector((state) => state.sessionsSlice.sessions);
  const dispatch = useAppDispatch();
  const { session_id } = useParams<{session_id: string}>();
  const [internalTools, setTools] = useState<ToolMessage[]>([]);


  useEffect(() => {
    if (accessToken) {
      getSessions(accessToken).then((sessions) => {
        if (sessions) {
          dispatch(setSessions(sessions));
        }
      });
    }
  }, [accessToken]);

  useEffect(() => {
    const index = sessions.findIndex(s => s.cid === session_id);
    if (index > -1 && sessions[index].messages) {
      setTools(sessions[index].messages.filter(message => message.type === "tool") as any);
    }
  }, [session_id, sessions]);

  if (!session_id) {
    return <></>
  }

  return (
    <div className='overflow-hidden'>
      <ScrollArea className="h-full">
        {
          internalTools.map((tool) => (
            <Card key={tool.id} className={`w-full mb-4 relative group`}>
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className={`text-sm font-medium break-all`}>
                  <ReactMarkdown>
                    {tool.name}
                  </ReactMarkdown>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{tool.status}</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </ScrollArea>
    </div>
  );
}
