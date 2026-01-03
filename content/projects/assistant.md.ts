export const content = `# Document QA System

Ask questions about your documents and get accurate, cited answers.

## Features

- **Multi-format Support**: PDF, DOCX, TXT, Markdown
- **Smart Chunking**: Semantic text splitting
- **Citation Tracking**: Source attribution for answers
- **Multi-document**: Query across document collections

## Pipeline

1. Document ingestion and parsing
2. Intelligent chunking
3. Embedding generation
4. Vector storage
5. Query processing
6. Context retrieval
7. Answer generation with citations

Type \`run\` to start asking questions!
`

export const metadata = {
  description: "Question answering system over your documents",
  tags: ["AI", "RAG", "QA", "Documents"],
  runnable: true,
  apiEndpoint: "/api/projects/document-qa",
}
