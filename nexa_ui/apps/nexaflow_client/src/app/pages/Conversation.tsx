import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Button, Toaster, useToast } from '@nexa_ui/shared';
import { Textarea } from '@nexa_ui/shared';
import { Card } from '@nexa_ui/shared';
import { ArrowRight, Loader2, Menu, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Session } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SessionList } from '../components/SessionList';
import { appFetch, BASE_URL } from '../utilities';
import { createId } from '@paralleldrive/cuid2';
import { addSession, setSessionMessage, setSessionMessages, setSessionTitle } from '../store';

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [llmResponseLoading, setLLMResponseLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const sessions = useAppSelector((state) => state.sessionsSlice.sessions);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { toast } = useToast();

  let { session_id } = useParams<{ session_id: string }>();

  const fetchSessionData = async (session_id: string) => {
    try {
      const response = await appFetch(`/api/v1/chat/${session_id}`, {
        method: 'GET',
        accessToken: accessToken!,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const sessionData: { messages: Message[] } = await response.json();
        dispatch(
          setSessionMessages({
            sessionId: session_id,
            messages: sessionData['messages'],
          })
        );
      } else {
        if (response.status === 401) {
          const errorData = await response.json();
          toast({
            title: 'Unauthorized',
            description: 'Authentication Required!',
            duration: 3000,
          });
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const index = sessions.findIndex((value) => value.cid === session_id);
    if (index > -1 && session_id) {
      if (sessions[index].messages)
        setMessages(
          sessions[index].messages.filter(
            (message) => message.type !== 'tool' && message.content != ''
          )
        );
      else fetchSessionData(session_id);
    }
  }, [sessions, session_id]);

  useEffect(() => {
    if (accessToken) {
    } else {
      window.location.href = BASE_URL`http://admin.localhost/login?auth=http://${window.location.hostname}/auth&redirect=${window.location.href}`;
    }
  }, [accessToken, session_id]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 40 * 10);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY =
        textarea.scrollHeight > newHeight ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!accessToken) {
      toast({
        title: 'Not Authenticated',
        description: 'You have to login',
        duration: 3000,
        variant: 'destructive',
      });
      return;
    }

    if (!session_id) {
      const newSessionID = createId();
      await createNewSession(newSessionID, inputText);
      session_id = newSessionID;
    }


    if (inputText.trim()) {
      setInputText('');
      setLLMResponseLoading(true);

      try {
        const userMessage = { query: inputText };
        setMessages((prev) => [
          ...prev,
          {
            type: 'human',
            id: '',
            additional_kwargs: {},
            content: userMessage.query,
            example: true,
            name: 'fas',
            response_metadata: {},
          },
        ]);
        if (messages.length < 2) {
          getTitle(session_id, inputText.trim())
          .then().catch((err) => console.log(err));
        }
        const response = await appFetch(`/api/v1/chat/${session_id}`, {
          method: 'POST',
          accessToken: accessToken!,
          body: JSON.stringify(userMessage),
        });
        if (response.ok) {
          const data: Message[] = await response.json();
          data.forEach((message) => {
            if (message.content && message.type !== 'tool') {
              dispatch(setSessionMessage({ sessionId: session_id!, message }));
            }
          });
        } else {
          console.log(await response.text());
        }
      } catch (error) {
        console.error('Error fetching LLM response:', error);
        toast({
          title: 'Error Sending Message',
          description: 'Error fetching LLM response:' + error,
          duration: 3000,
          variant: 'destructive',
        });
      } finally {
        setLLMResponseLoading(false);
      }
    }
  };

  async function getTitle(sessionID: string, query: string) {
    const data = { query };
    try {
      const response = await appFetch(`http://clock.localhost:8000/api/v1/chat/new/${sessionID}`, {
        method: 'POST',
        accessToken: accessToken!,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let responseData = '';
      if (response.ok) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decodedValue = decoder.decode(value);
          responseData += decodedValue;
          dispatch(setSessionTitle({ sessionId: sessionID, title: responseData}));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function createNewSession(newSessionID: string, query: string = '') {
    const newSessionURL = `/chat/${newSessionID}`;
    try {
      const response = await appFetch(`/api/v1/chat/${newSessionID}`, {
        method: 'GET',
        accessToken: accessToken!,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const sessionData: Session = await response.json();
        dispatch(addSession(sessionData));
      }
      if (query) {
        await getTitle(newSessionID, query);
      }
      navigate(newSessionURL);
      return newSessionID;
    } catch (error) {}
  }

  async function onNewSessionButtonClick() {
    const newSessionID = createId();
    await createNewSession(newSessionID);
  }

  function onResize() {
    setInnerWidth(window.innerWidth);
  }

  function handleShowSideMenu() {
    setShowSidebar(!showSidebar);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card
        className={`border-r md:flex md:flex-col ${
          innerWidth < 768
            ? 'fixed top-0 left-0 h-full transition-transform duration-500 ease-in-out'
            : 'w-96'
        } ${
          innerWidth < 768
            ? showSidebar
              ? 'translate-x-0 w-full z-50'
              : '-translate-x-full w-96'
            : ''
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          <div className="gap-2 flex">
            <Button onClick={() => onNewSessionButtonClick()} variant="ghost">
              <Plus />
            </Button>
            <Button
              onClick={() => handleShowSideMenu()}
              variant="outline"
              className="cursor-pointer md:hidden"
            >
              <Menu />
            </Button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-scroll">
          <SessionList />
        </div>
      </Card>

      <div className="flex-1 flex flex-col">
        <div className="p-4 flex justify-between items-center top-0 left-0 w-full z-10  md:hidden">
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          <div className="gap-2 flex">
            <Button onClick={() => onNewSessionButtonClick()} variant="ghost">
              <Plus />
            </Button>
            <Button
              onClick={() => handleShowSideMenu()}
              variant="outline"
              className="cursor-pointer"
            >
              <Menu />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'human' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  message.type === 'human'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } break-words`}
              >
                {message.type === 'human' ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre
                            className={`p-2 bg-gray-800 rounded ${className} overflow-x-auto`}
                          >
                            <code className={`language-${match[1]}`} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {llmResponseLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-2 rounded-lg bg-muted flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 border-r-0">
          <div className="flex items-end space-x-2">
            <Textarea
              ref={textareaRef}
              className="resize-none min-h-[40px] max-h-[400px]"
              placeholder="Type your message here."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ChatPanel;
