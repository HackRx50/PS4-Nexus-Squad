import { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Button, Toaster, useToast } from '@nexa_ui/shared';
import { Textarea } from '@nexa_ui/shared';
import { Card } from '@nexa_ui/shared';
import {
  ArrowRight,
  Hammer,
  Menu,
  Plus,
  UploadIcon,
  CheckIcon,
  XIcon,
  X,
  Loader2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Message, Session, ToolMessage } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks';
import { SessionList } from '../components/SessionList';
import { appFetch, BASE_URL } from '../utilities';
import { createId } from '@paralleldrive/cuid2';
import {
  addSession,
  setSessionDocuments,
  setSessionMessage,
  setSessionMessages,
  setSessionTitle,
} from '../store';
import { ActionCallList } from '../components/ActionCallList';

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [llmResponseLoading, setLLMResponseLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileuploadstatus, setfileuploadstatus] = useState(false);

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const sessions = useAppSelector((state) => state.sessionsSlice.sessions);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { toast } = useToast();

  let { session_id } = useParams<{ session_id: string }>();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

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
        const sessionData: { messages: Message[], documents: string[] } = await response.json();
        dispatch(
          setSessionMessages({
            sessionId: session_id,
            messages: sessionData['messages'],
          })
        );
        dispatch(setSessionDocuments({
          sessionId: session_id,
          documents: sessionData['documents'],
        }));
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
            (message) =>
              /^(human|ai)$/.test(message.type) && message.content != ''
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

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);

      const confirmUpload = window.confirm(
        `Are you sure you want to upload this document: ${file.name}?`
      );
      if (confirmUpload) {
        handleSendDocument(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendDocument = async (file: File) => {
    if (!file) return;

    try {
      setfileuploadstatus(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await appFetch(`/api/v1/chat/${session_id}/document`, {
        method: 'POST',
        body: formData,
        accessToken: accessToken!
      });

      if (response.ok) {
        const { data, message }: {data: string[], message: string} = await response.json();
        console.log('Document uploaded successfully');
        dispatch(setSessionDocuments({
          sessionId: session_id!,
          documents: data
        }));
        toast({
          description: message,
          duration: 3000
        });
        setFileSelected(null);
      } else {
        const data = await response.json();
        alert(`Error uploading document: ${data.detail}`);
      }
    } catch (error) {
      console.log('Error sending document:', error);
      alert(`Error sending document: ${error}`);
    } finally {
      setfileuploadstatus(false);
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

    setLLMResponseLoading(true);
    if (!session_id) {
      const newSessionID = createId();
      await createNewSession(newSessionID, inputText);
      session_id = newSessionID;
    }

    if (inputText.trim()) {
      setInputText('');

      try {
        const userMessage = { query: inputText };

        dispatch(
          setSessionMessage({
            sessionId: session_id,
            message: {
              type: 'human',
              id: '',
              additional_kwargs: {},
              content: userMessage.query,
              example: true,
              name: 'user',
              response_metadata: {},
            },
          })
        );

        if (messages.length < 2) {
          getTitle(session_id, inputText.trim())
            .then()
            .catch((err) => console.log(err));
        }
        const response = await appFetch(`/api/v1/chat/${session_id}`, {
          method: 'POST',
          accessToken: accessToken!,
          body: JSON.stringify(userMessage),
        });

        if (response.ok) {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const decodedValue = decoder.decode(value).trim();
            dispatch(
              setSessionMessage({
                sessionId: session_id,
                message: JSON.parse(decodedValue),
              })
            );
          }
        } else if (response.status === 403) {
          const data = await response.json();
          toast({
            title: 'Message Send Error',
            description: data['detail'],
            duration: 3000,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Message Send Error',
            description: 'Unknow Failure',
            duration: 3000,
            variant: 'destructive',
          });
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
    } else {
      setLLMResponseLoading(false);
    }
  };

  async function getTitle(sessionID: string, query: string) {
    const data = { query };
    try {
      const response = await appFetch(`/api/v1/chat/new/${sessionID}`, {
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
          console.log(decodedValue)
          responseData += decodedValue;
          dispatch(
            setSessionTitle({ sessionId: sessionID, title: responseData })
          );
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
        },
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
    if (window.innerWidth < 768) {
      setIsRightSidebarOpen(false);
      setShowSidebar(false);
    }
    setInnerWidth(window.innerWidth);
  }

  function handleShowSideMenu() {
    if (innerWidth < 768 && isRightSidebarOpen && !showSidebar) {
      setIsRightSidebarOpen(false);
    }
    setShowSidebar(!showSidebar);
  }

  const toggleRightSidebar = () => {
    if (innerWidth < 768 && showSidebar && !isRightSidebarOpen) {
      setShowSidebar(false);
    }
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <Card
        className={`border-r md:flex md:flex-col ${
          window.innerWidth < 768
            ? 'fixed top-0 left-0 h-full transition-transform duration-500 ease-in-out'
            : innerWidth < 1100 && innerWidth > 768
            ? 'w-[40%]'
            : 'w-1/4'
        } ${
          window.innerWidth < 768
            ? showSidebar
              ? 'translate-x-0 w-full z-50'
              : '-translate-x-full w-96'
            : ''
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          <div className="gap-2 flex">
            <Button
              onClick={toggleRightSidebar}
              variant="ghost"
              className="cursor-pointer"
            >
              <Hammer />
            </Button>
            <Button onClick={onNewSessionButtonClick} variant="ghost">
              <Plus />
            </Button>
            <Button
              onClick={handleShowSideMenu}
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

      {/* Central Panel */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
           ${isRightSidebarOpen ? 'w-1/2' : 'w-3/4'}`}
      >
        <div
          className={`p-4 flex justify-between items-center top-0 left-0 w-full z-10 ${
            innerWidth < 768 ? 'sticky top-[0] shadow-md' : 'hidden'
          }`}
        >
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          <div className="gap-2 flex">
            <Button
              onClick={toggleRightSidebar}
              variant="ghost"
              className="cursor-pointer"
            >
              <Hammer />
            </Button>
            <Button onClick={onNewSessionButtonClick} variant="ghost">
              <Plus />
            </Button>
            <Button
              onClick={handleShowSideMenu}
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
                className={`${
                  innerWidth < 768 || isRightSidebarOpen
                    ? 'max-w-[90%]'
                    : 'max-w-[70%]'
                } p-4 overflow-hidden rounded-lg ${
                  message.type === 'human'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted flex flex-col gap-4'
                } break-words`}
              >
                <div className="prose prose-sm max-w-none overflow-x-auto">
                  {message.type === 'human' ? (
                    message.content
                  ) : (
                    <div className="px-2">
                      <ReactMarkdown
                        components={{
                          code({ inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(
                              className || ''
                            );
                            return !inline && match ? (
                              <div className="overflow-x-auto">
                                <pre
                                  className={`p-2 bg-gray-100 dark:bg-gray-800 rounded ${className}`}
                                >
                                  <code
                                    className={`language-${match[1]}`}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code
                                className={`${className} bg-gray-100 dark:bg-gray-800 rounded px-1`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => (
                            <p className="mb-4">{children}</p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mb-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-bold mb-2">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6 mb-4">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-6 mb-4">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
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
        <div className="border-t p-4">
          <div className="flex space-x-2 items-center">
            {/* <button
              onClick={
                fileSelected && isHovered
                  ? handleRemoveFile
                  : handleFileInputClick
              }
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="p-2 border rounded-full hover:bg-gray-700"
              aria-label="Upload document"
            >
              {fileuploadstatus ? (
                <Loader2 size={24} className="animate-spin" />
              ) : fileSelected ? (
                isHovered ? (
                  <XIcon size={24} />
                ) : (
                  <CheckIcon size={24} />
                )
              ) : (
                <UploadIcon size={24} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            /> */}
            <Textarea
              ref={textareaRef}
              className="resize-none min-h-[40px] max-h-[400px]"
              placeholder="Type your message here."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              disabled={llmResponseLoading || !inputText.trim()}
              size="icon"
              onClick={handleSendMessage}
            >
              {llmResponseLoading ? (
                <Loader2
                  className={`transition-transform duration-300 animate-spin`}
                />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card
        className={`top-0 right-0 h-full transition-all duration-500 ease-in-out border-l
          ${
            isRightSidebarOpen ? ' w-1/4 translate-x-0' : 'w-0 translate-x-full'
          } overflow-hidden
            ${window.innerWidth < 768 ? 'fixed w-[100%] z-50' : 'relative'}
          `}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Action Calls</h2>
          <Button variant="ghost" size="icon" onClick={toggleRightSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <ActionCallList />
        </div>
      </Card>
      <Toaster />
    </div>
  );
}

export default ChatPanel;
