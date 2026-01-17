import { db } from "@/database/db";
import { pdfDetailTable } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/pinecone";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
    const { userId } = await auth()

    if (!userId)
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );

    try {
        const { documentId, userQuery } = await req.json()
        console.log(documentId, userQuery);


        if (!documentId || !userQuery)
            return NextResponse.json(
                { error: "Data missing" },
                { status: 400 }
            )

        const [pdfDetail] = await db.select().from(pdfDetailTable).where(and(
            eq(pdfDetailTable.documentId, documentId),
            eq(pdfDetailTable.userId, userId)
        ))

        if (!pdfDetail)
            return NextResponse.json(
                { error: "Pdf Detail not found" },
                { status: 404 }
            );

        const chatHistory = pdfDetail.chatHistory
        console.log("Got chat history");

        // Getting latest chat
        const trimmedHistory = chatHistory.slice(-3);

        // Update formate of chat so LLM can understand
        const rewriteHistory = [
            ...trimmedHistory.map((m) => ({
                role: m.role,
                parts: [{ text: m.content }],
            })),
            {
                role: "user",
                parts: [{ text: userQuery }],
            },
        ];
        console.log("Rewrriten the history");

        // Rewritting userQuery. So that LLM can understand follow up question 
        const rewriteResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: rewriteHistory,
            config: {
                systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user's latest Question" into a complete, standalone question that can be understood without the chat history.
            Only output the rewritten question and nothing else.`,
            },
        });

        const updatedQuery = rewriteResponse.text?.trim() || userQuery;
        console.log("Rewrritten query : ", updatedQuery);


        // Retrieve userQuery context from Pinecone
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });

        // search vector in pinecone
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

        const vectorStore = await PineconeStore.fromExistingIndex(
            embeddings,
            {
                pineconeIndex,
                namespace: `doc_${documentId}`,
            }
        );

        const docs = await vectorStore.similaritySearch(
            updatedQuery,
            2
        );

        console.log("Found the docs", docs);
        // Create context for LLM based on related doc
        const context = docs
            .map((doc) => doc.pageContent)
            .join("\n\n---\n\n");
        console.log("The context", context);

        const answerResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                role: "user",
                parts: [{ text: `Context: ${context} , Question : ${updatedQuery}` }]
            }],
            config: {
                systemInstruction: `You will be given a context of relevant information and a user question.
                                Your task is to answer the user's question based ONLY on the provided context. You can structure the context answer so it easy to understand.
                                Try to give short answer.
                                If the answer is not in the context, you must say "I could not find the answer in the provided document."
                                Keep your answers clear, concise, and educational.`,
            }
        });

        const answer = answerResponse.text?.trim() || "I could not find the answer in the provided document.";

        console.log("Got the ans", answer);

        await db
            .update(pdfDetailTable)
            .set({
                chatHistory: [
                    ...chatHistory,
                    { role: "user", content: userQuery },
                    { role: "model", content: answer },
                ],
                updatedAt: new Date(),
            })
            .where(eq(pdfDetailTable.documentId, documentId));

        return NextResponse.json(answer)
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Failed To generate Answer",
        }, { status: 500 })
    }

}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        const { searchParams } = new URL(req.url)
        const documentId = searchParams.get('documentId')
        console.log(documentId);

        if (!documentId)
            return NextResponse.json(
                { error: "Data missing" },
                { status: 400 }
            )

        const [res] = await db.select().from(pdfDetailTable).where(
            and(
                eq(pdfDetailTable.userId, userId),
                eq(pdfDetailTable.documentId, documentId)
            )
        )

        console.log("JJJJJ", res);
        if (!res) {
            return NextResponse.json({
                error: "No Pdf Found"
            }, { status: 404 })
        }

        return NextResponse.json(res)
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Failed To generate Answer",
        }, { status: 500 })
    }
}