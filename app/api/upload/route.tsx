import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { db } from "@/database/db";
import { pdfDetailTable } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid'


export async function POST(req: NextRequest) {
    const { userId } = await auth();

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        console.log("hhhh", file);

        if (!userId) {
            throw new Error("Unauthorized");
        }
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File must be under 5MB" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log("BBBB", buffer);


        const uploadRes = await imagekit.upload({
            file: buffer,
            fileName: file.name,
            folder: "/ai-chat-with-doc",
            useUniqueFileName: true,
        })
        console.log("uuuu", uploadRes);

        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, uploadRes.name);
        await fs.writeFile(tempFilePath, buffer);

        const pdfLoader = new PDFLoader(tempFilePath);
        const rawDocs = await pdfLoader.load();
        console.log("Pdf loaded", rawDocs);

        // Creating chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

        const documentId = uuidv4()

        const docWithMetadata = chunkedDocs.map((doc) => ({
            ...doc,
            metadata: {
                ...doc.metadata,
                userId,
                documentId,
                fileName: uploadRes.name
            }
        }))
        console.log("chunking with meta completed", docWithMetadata);

        // Creating embeddings
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        console.log("Embedding model");

        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
        console.log("Pinecone configured");

        // langchain(chunks, embedding_model, db)
        const res = await PineconeStore.fromDocuments(docWithMetadata, embeddings, {
            pineconeIndex,
            maxConcurrency: 5,
            namespace: `doc_${documentId}`
        });
        console.log("Chunks saved", res);

        await fs.unlink(tempFilePath);

        await db.insert(pdfDetailTable).values({
            userId: userId,
            documentId: documentId,
            fileName: uploadRes.name,
            imageUrl: uploadRes.url,
            chatHistory: []
        }).returning()

        return NextResponse.json({
            success: true,
            documentId,
            fileName: uploadRes.name,
            imageUrl: uploadRes.url,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to upload Pdf" },
            { status: 500 }
        );
    }
}