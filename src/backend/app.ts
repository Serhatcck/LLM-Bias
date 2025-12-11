import * as z from "zod";
import express, { Request, Response } from "express";
import path from "path";
import { graph } from "./react_agent/graph";


const app = express();
const uiDir = path.resolve(process.cwd(), "src/ui");
const appHtmlPath = path.join(uiDir, "app.html");
app.use(express.json());

// Request validation schema
const requestSchema = z.object({
    content: z.string(),
    logit_bias_string: z.string().optional(),
    logit_bias_value: z.number().min(-100).max(100).optional(),
});

// Type for request body
type RequestBody = z.infer<typeof requestSchema>;


// API endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData: RequestBody = requestSchema.parse(req.body);
        const { content, logit_bias_string, logit_bias_value } = validatedData;

        const messages = [
            { role: "user", content: content },
        ];

        // Invoke agent
        const result = await graph.invoke({
            messages: messages,
            logit_bias_string: logit_bias_string,
            logit_bias_value: logit_bias_value,
        });


        
        // Return response with full result data for logging
        // Check if messages array is not empty before accessing last element
        const lastMessage = result.messages && result.messages.length > 0 
            ? result.messages[result.messages.length - 1] 
            : null;
        
        res.json({
            success: true,
            result: lastMessage?.content || "",
            logs: {
                fullResult: result,
                messages: result.messages || [],
                logitBiasString: logit_bias_string,
                logitBiasValue: logit_bias_value,
                computedLogitBias: result.computed_logit_bias || undefined,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error in /api/chat:", error);

        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: "Invalid request format",
                details: error.issues,
            });
        } else {
            const errorMessage = error instanceof Error ? error.message : "Internal server error";
            res.status(500).json({
                success: false,
                error: errorMessage,
            });
        }
    }
});

// Static assets & HTML served at /app
app.use("/", express.static(uiDir));
app.get("/", (_req: Request, res: Response) => {
    res.sendFile(appHtmlPath);
});

// Start server
const PORT: number = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});