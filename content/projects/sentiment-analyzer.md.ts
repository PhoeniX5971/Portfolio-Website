export const content = `# Sentiment Analyzer

A real-time sentiment analysis tool using state-of-the-art transformer models.

## Capabilities

### Sentiment Classification
- **Polarity**: Positive, Negative, Neutral
- **Confidence Scores**: Probability distributions
- **Multi-language Support**: 50+ languages

### Emotion Detection
- Joy, Sadness, Anger, Fear
- Surprise, Disgust, Trust
- Fine-grained emotional analysis

### Advanced Features
- **Aspect-based Sentiment**: Analyze sentiment per topic
- **Comparative Analysis**: Compare sentiment across texts
- **Batch Processing**: Analyze multiple texts efficiently
- **Time-series Analysis**: Track sentiment over time

## Models

### Primary Model
- **BERT-based** fine-tuned on sentiment datasets
- Custom trained on domain-specific data
- 95%+ accuracy on benchmark datasets

### Architecture
\`\`\`
Text → Tokenization → BERT Encoder → Classification Head
                            ↓
                    Feature Extraction
                            ↓
                    Emotion Detection
\`\`\`

## Technical Details

- **Framework**: PyTorch, Transformers
- **Model**: DistilBERT (optimized for speed)
- **API**: FastAPI
- **Preprocessing**: spaCy
- **Deployment**: Docker + Kubernetes

## Use Cases

- Social media monitoring
- Customer feedback analysis
- Brand sentiment tracking
- Product review analysis
- Support ticket prioritization

Type \`run\` to start analyzing text!
`

export const metadata = {
  description: "Real-time sentiment and emotion analysis using transformers",
  tags: ["NLP", "ML", "Transformers", "Analytics"],
  runnable: true,
  apiEndpoint: "/api/projects/sentiment",
}
