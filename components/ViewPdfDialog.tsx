"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from './ui/button';
const ViewPdfDialog = ({pdfUrl}:any) => {

    const [open, setOpen] = useState(false);
    const openPdf = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button className="bg-zinc-200 hover:bg-gray-400 text-black" size="sm"
                    onClick={(e) => openPdf(e)}
                    disabled={!pdfUrl}
                >
                    View PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] h-[90vh] sm:w-[90vw] sm:h-[90vh] lg:w-[65vw] lg:h-[90vh] xl:w-[60vw] !max-w-none p-0 overflow-hidden flex flex-col" >
                {/* Header */}
                {/* <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h2 className="text-sm font-semibold">PDF Preview</h2>
                </div> */}
                <DialogTitle className='pt-4 text-center'>PDF Preview</DialogTitle>

                {/* PDF Viewer */}
                {pdfUrl && (
                    <iframe
                        src={pdfUrl}
                        className="flex-1 w-full"
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ViewPdfDialog