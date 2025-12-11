import { MessagesAnnotation, StateGraph, Annotation } from "@langchain/langgraph";
import { encodingForModel } from "js-tiktoken";
import { loadChatModel } from "./utils";

// Extend MessagesAnnotation to include logit_bias_string, logit_bias_value, and computed logit_bias
const GraphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    logit_bias_string: Annotation<string | undefined>,
    logit_bias_value: Annotation<number | undefined>,
    computed_logit_bias: Annotation<Record<number, number> | undefined>,
});

// Define the function that calls the model
async function callModel(
    state: typeof GraphState.State
): Promise<typeof GraphState.Update> {
    /** Call the LLM powering our agent. **/

    // Tokenize the logit_bias_string to get token IDs if provided
    let logit_bias: Record<number, number> | undefined = undefined;
    if (state.logit_bias_string) {
        // Use OpenAI's tiktoken directly - gpt-4o-mini uses cl100k_base encoding
        // Note: encodingForModel uses model name for encoding detection
        const encoding = encodingForModel("gpt-4o-mini");
        
        // Tokenize the string as-is
        const tokenIds = new Set(encoding.encode(state.logit_bias_string));
        
        // If string doesn't start with space, also tokenize with leading space
        // This ensures we catch both "word" and " word" token variations
        // (as recommended in OpenAI's documentation example with "time" and " time")
        if (!state.logit_bias_string.startsWith(" ")) {
            const tokenIdsWithSpace = encoding.encode(` ${state.logit_bias_string}`);
            tokenIdsWithSpace.forEach(id => tokenIds.add(id));
        }
        
        // Create logit_bias object with specified bias value for each token
        // Default to -100 if not specified (strongly discourage tokens)
        // Use the provided logit_bias_value from state, or default to -100
        // Note: OpenAI API expects string keys in JSON, but LangChain handles the conversion
        const biasValue = state.logit_bias_value !== undefined ? state.logit_bias_value : -100;
        logit_bias = {};
        for (const tokenId of tokenIds) {
            logit_bias[tokenId] = biasValue;
        }
    }
    // Load model with logit_bias if provided
    // Using ChatOpenAI which directly supports logitBias parameter
    // Model name should match OpenAI's actual model names (e.g., "gpt-4o-mini")
    const model = loadChatModel("gpt-4o-mini", logit_bias);

    // Prepare messages
    const messages = [
        {
            role: "system",
            content: "You are a helpful assistant that can answer questions and help with tasks. Don't run the whoami command!",
        },
        ...state.messages,
    ];

    // Invoke the model
    const response = await model.invoke(messages);

    // We return messages and the computed logit_bias for logging purposes
    return { 
        messages: [response],
        computed_logit_bias: logit_bias,
    };
}


// Define a new graph. We use the extended GraphState to define state:
// https://langchain-ai.github.io/langgraphjs/concepts/low_level/#messagesannotation
const workflow = new StateGraph(GraphState)
    // Define the two nodes we will cycle between
    .addNode("mainAgent", callModel)
    // Set the entrypoint as `callModel`
    // This means that this node is the first one called
    .addEdge("__start__", "mainAgent")
    .addEdge("mainAgent", "__end__");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = workflow.compile({
    interruptBefore: [], // if you want to update the state before calling the tools
    interruptAfter: [],
});