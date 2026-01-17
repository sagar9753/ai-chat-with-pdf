"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, Copy, ThumbsUp, ThumbsDown, Loader } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { PdfDetail } from "@/database/schema";
import { Button } from "@/components/ui/button";
import ViewPdfDialog from "@/components/ViewPdfDialog";
import { useAuth } from "@clerk/nextjs";

type Chat = {
    role: "user" | "model";
    content: string;
};

export default function ChatPage() {
    const { documentId } = useParams<{ documentId: string }>();
    // @ts-ignore
    const [chat, setChat] = useState<Chat[]>()
    const [loading, setLoading] = useState(false)
    const [chatloading, setChatLoading] = useState(false)
    const [pdfDetail,setPdfDetail] = useState<PdfDetail>()
    const [userQuery, setUserQuery] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null);
    const {isLoaded} = useAuth()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [chat, loading]);
    useEffect(()=>{
        documentId && getChatHistory()
    },[])

    const getChatHistory = async()=>{
        setChatLoading(true)
        try {
            const res = await axios.get(`/api/chat?documentId=${documentId}`);
            console.log("RRR",res);
            
            if(res.statusText == 'OK'){
                setChat(res?.data?.chatHistory)
                setPdfDetail(res.data)
            }
        } catch (error) {
            console.log("In get error",error);
        }finally{
            setChatLoading(false)
        }
    }

    const onSend = async () => {
        if (loading) return
        setChat((chat)=>[...chat!, {
            role: "user",
            content: userQuery
        }])
        setUserQuery("")
        setLoading(true)

        try {
            const res = await axios.post('/api/chat',{
                documentId,userQuery
            })
            console.log(chat);
            
            setChat((chat)=>[...chat!,{
                role:"model",
                content:res.data
            },])
            
        } catch (error) {
            console.log("In Post error", error);
        }finally{
            setLoading(false)
        }
    }

    if (chatloading || !isLoaded) {
        return (
          <div className="flex justify-center items-center h-[300px]">
            <Loader className="animate-spin text-white" />
          </div>
        );
      }
    return (
        <div className="flex h-[90vh] flex-col text-white">

            {/* HEADER */}
            <div className="px-4 py-3 flex justify-between">
                <h3 className="sm:text-xl">Chat with Document</h3>
                <ViewPdfDialog pdfUrl={pdfDetail?.imageUrl} />
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto px-2 py-6 space-y-6">
                
                {chat?.map((msg, idx) => {
                    const isUser = msg.role === "user";

                    return (
                        <div
                            key={idx}
                            className={`w-full flex ${isUser ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div className="max-w-[720px] w-full px-4">
                                {/* Message text */}
                                <div
                                    className={`text-sm leading-relaxed ${isUser
                                        ? "ml-auto w-fit rounded-2xl bg-zinc-800 px-4 py-2"
                                        : "text-zinc-100"
                                        }`}
                                >
                                    {msg.content}
                                </div>

                            </div>
                        </div>
                    );
                })}

                {/* Loading */}
                {loading && (
                    <div className="px-4 text-sm text-zinc-500">
                        AI is thinking…
                    </div>
                )}
                <div ref={bottomRef} />

            </div>

            {/* userQuery */}
            <div className="border-t border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3">
                    <input
                        className="flex-1 bg-transparent py-3 text-sm outline-none"
                        placeholder="Send a message…"
                        value={userQuery}
                        onChange={e => setUserQuery(e.target.value)}
                        onKeyDown={e => e.key == "Enter" && onSend()}
                    />
                    <Send
                        onClick={onSend}
                        className="h-4 w-4 cursor-pointer text-zinc-400 hover:text-white"
                    />
                </div>
            </div>
        </div>
    );
}
