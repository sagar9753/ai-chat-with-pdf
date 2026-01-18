"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, UserStar, X } from 'lucide-react'
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


const MAX_SIZE = 5 * 1024 * 1024;

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_SIZE) {
            toast.error("File must be under 5MB");
            e.target.value = "";
            return;
        }

        if (selectedFile.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            e.target.value = "";
            return;
        }

        setFile(selectedFile);
    }

    const onUpload = async (file: any) => {
        if(!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post('/api/upload', formData)
            
            if (res.status != 200){
                toast.error("File Upload Faild")
                return
            }
            
            router.replace(`/chat/${res?.data?.documentId}`)

        } catch (error: any) {
            toast.error(error.response.data.error || "File Uploading Faild")
        } finally {
            setUploading(false)
            setFile(null)
        }
    }

    return (
        <Card className="max-w-sm mx-auto bg-zinc-800 border-zinc-900">
            <CardHeader>
                <CardTitle className="text-lg text-gray-50">Upload PDF</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {!file ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:bg-zinc-700 transition">
                        <Upload className="w-6 h-6 mb-2 text-gray-300" />
                        <span className="text-gray-300">
                            Click to upload PDF
                        </span>
                        <Input
                            type="file"
                            accept=".pdf,.txt,.docx"
                            hidden
                            onChange={handleFileChange}
                        />
                    </label>
                ) : (
                    <div className="flex items-center justify-between border rounded-lg border-gray-600 p-3">
                        <div className="flex items-center gap-2">
                            <FileText className="text-red-500" />
                            <div>
                                <p className="text-gray-50 font-medium">{file.name}</p>
                                <p className="text-xs text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="w-4 h-4 text-gray-200" />
                        </Button>
                    </div>
                )}

                <Button
                    className="w-full bg-zinc-200 hover:bg-gray-400 text-black"
                    disabled={!file || uploading}
                    onClick={() => onUpload(file)}
                >
                    {uploading ? "Uploading..." : "Upload PDF"}
                </Button>
            </CardContent>
        </Card>
    );
}
