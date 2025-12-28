export const content = `# AI Chatbot with RAG

An intelligent chatbot powered by large language models with Retrieval-Augmented Generation (RAG) capabilities.

## Features

### Core Capabilities
- **RAG Pipeline**: Retrieves relevant context from knowledge base
- **Context Management**: Maintains conversation history
- **Streaming Responses**: Real-time response generation
- **Multi-turn Conversations**: Coherent long-form dialogues

### Advanced Features
- **Semantic Search**: Vector similarity for context retrieval
- **Guardrails**: Content filtering and safety checks
- **Caching Layer**: Redis-based response caching
- **PII Protection**: Automatic detection and masking

## Architecture

\`\`\`
User Input → Preprocessing → Embedding Generation
                                    ↓
                            Vector Search (Pinecone)
                                    ↓
                            Context Augmentation
                                    ↓
                    LLM (GPT-4) → Guardrails → Response
                         ↓
                    Cache Layer (Redis)
\`\`\`

## Technical Stack

- **LLM**: OpenAI GPT-4
- **Vector DB**: Pinecone
- **Framework**: LangChain
- **API**: FastAPI
- **Cache**: Redis
- **Embeddings**: OpenAI text-embedding-3-small

## Pipeline Steps

1. **Input Processing**: Clean and validate user input
2. **Guardrails Check**: Verify content safety
3. **Cache Lookup**: Check for similar cached queries
4. **Embedding**: Generate query embeddings
5. **Vector Search**: Retrieve top-k relevant documents
6. **Prompt Augmentation**: Combine context with query
7. **LLM Inference**: Generate response
8. **Output Filtering**: Validate and filter response
9. **Cache Storage**: Store for future use

## Usage

Type \`run\` to start the chatbot and interact with the AI assistant.
Watch the backend logs to see the RAG pipeline in action!
`

export const metadata = {
  description: "Intelligent chatbot with RAG capabilities and advanced filtering",
  tags: ["AI", "RAG", "Python", "LangChain"],
  runnable: true,
  apiEndpoint: "/api/projects/chatbot",
}
