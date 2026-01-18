"use client";

import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-border bg-muted/50 text-sm text-black">
          <Sparkles className="w-4 h-4" />
          AI-powered PDF Intelligence
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Chat with your PDFs <br />
          <span className="text-blue-500">
            using AI
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-gray-300">
          Upload PDFs and ask questions in natural language.
          AskMyPdf uses AI-powered Retrieval-Augmented Generation (RAG)
          to give accurate answers with full document context.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Upload PDF
            </Button>
          </Link>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] 
            -translate-x-1/2 -translate-y-1/2 
            rounded-full bg-primary/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
