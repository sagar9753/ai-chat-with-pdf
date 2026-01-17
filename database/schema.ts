import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const pdfDetailTable = pgTable("pdfDetail", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Clerk user ID
    userId: text("user_id").notNull(),

    // Same documentId used for Pinecone namespace
    documentId: uuid("document_id").notNull(),

    // File metadata
    fileName: text("file_name").notNull(),
    imageUrl: text("image_url").notNull(),

    // Chat history (JSON)
    chatHistory: jsonb("chatHistory")
        .$type<
            {
                role: "user" | "model";
                content: string;
            }[]
        >().notNull().default([]),

    topicStack: jsonb("topicStack")
        .$type<string[]>()
        .default([]),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PdfDetail = typeof pdfDetailTable.$inferSelect;