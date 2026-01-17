"use client";

import { PdfDetail } from "@/database/schema";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { Loader } from "lucide-react";
import ViewPdfDialog from "./ViewPdfDialog";
import { useAuth } from "@clerk/nextjs";

const ChatHistoryTable = () => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<PdfDetail[]>([]);
    const {isLoaded} = useAuth()

    const router = useRouter();

    useEffect(() => {
        getChatHistory();
    }, []);

    const getChatHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/previousChat");
            if (res.status === 200) {
                setHistory(res.data);
            }
        } catch {
            toast.error("Failed to get Chat History");
        } finally {
            setLoading(false);
        }
    };


    if (loading || !isLoaded) {
        return (
          <div className="flex justify-center items-center h-[300px]">
            <Loader className="animate-spin text-white" />
          </div>
        );
      }

    return (
        <>
            <div className="relative w-full overflow-x-auto lg:px-20 md:px-10 px-4">
                <h3 className="text-center text-gray-50 mb-4 text-lg font-semibold">
                    Your chats
                </h3>

                <Table>
                    <TableCaption className="mt-4">
                        Previous Consultation Reports
                    </TableCaption>

                    <TableHeader>
                        <TableRow className="bg-zinc-400">
                            <TableHead>File Name</TableHead>
                            <TableHead>Last Used Date</TableHead>
                            <TableHead className="text-center">View PDF</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {history.map((record) => (
                            <TableRow
                                key={record.id}
                                className="cursor-pointer border-b-zinc-900 bg-zinc-800 hover:bg-zinc-900"
                            >
                                <TableCell className="font-medium text-gray-300 hover:text-blue-300" onClick={() => router.push(`/chat/${record.documentId}`)}>
                                    {record.fileName.replace(/_[a-zA-Z0-9]+(_[a-zA-Z0-9]+)?(?=\.[^.]+$)/,"")}
                                </TableCell>

                                <TableCell className="text-sm text-gray-400">
                                    {formatDate(record.updatedAt)}
                                </TableCell>

                                <TableCell className="text-center">
                                    <ViewPdfDialog pdfUrl={record?.imageUrl}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </>
    );
};

export default ChatHistoryTable;
