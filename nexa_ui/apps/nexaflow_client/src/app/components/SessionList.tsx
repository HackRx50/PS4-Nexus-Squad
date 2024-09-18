import { useEffect } from 'react';
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
import { Edit, Trash2 } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useTheme } from './theme-provider';

export function SessionList() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const sessions = useAppSelector((state) => state.sessionsSlice.sessions);
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const { session_id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      getSessions(accessToken).then((sessions) => {
        if (sessions) {
          dispatch(setSessions(sessions));
        }
      });
    }
  }, [accessToken]);


  async function handleDeleteAction(id: string) {
    if (!accessToken) {
      toast({
        title: "Auth Required",
        duration: 3000
      })
      return;
    }
    
    try {
      const response = await appFetch(`/api/v1/chat/${id}`, {
        method: "DELETE",
        accessToken: accessToken!
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: "Delete Unsuccessfull",
          description: data.detail,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Delete Successfull",
          description: data.detail,
          variant: "destructive"
        });
        if (session_id === id) {
          navigate("/chat");
        }
        dispatch(removeSession(id));
      }
    } catch(err) {
      toast({
        title: "Delete Unsuccessfull",
        description: `${err}`,
        variant: "destructive"
      })
    }
  }

  return (
    <div className='overflow-hidden'>
      <ScrollArea className="h-full">
        {sessions.map((session) => (
          <Card key={session.cid} className={`w-full mb-4 relative group ${session_id === session.cid? (theme === "dark" ? "bg-zinc-900": "bg-gray-200"): ""}`}>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <Link
                to={`/chat/${session.cid}`}
                className="w-full p-0 hover:opacity-65"
                key={session.cid}
              >
                <CardTitle className={`text-sm font-medium break-all`}>
                <ReactMarkdown>
                    {session.title || session.cid}
                </ReactMarkdown>
                </CardTitle>
              </Link>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <Button variant="ghost" size="icon" className="hidden">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  className="scale-[.85]"
                  size="icon"
                  onClick={() => handleDeleteAction(session.cid)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-end text-xs text-muted-foreground">
                <span>{formatDate(session.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
