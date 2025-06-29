# 🚀 Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sumitshahu21/AI-Powered-Business--Rules--Management--System)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variables:
   - `AI_API_KEY`: Your OpenAI API key
4. Deploy!

## Manual Deployment

### Prerequisites
- Node.js 18+
- OpenAI API key
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/sumitshahu21/AI-Powered-Business--Rules--Management--System.git
   cd AI-Powered-Business--Rules--Management--System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your OpenAI API key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```bash
# Required
AI_API_KEY=your_openai_api_key_here

# Optional
DATABASE_URL=your_database_url_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Features Demo

Try these example rules to see the AI in action:

1. **Basic Discount Rule**:
   - Input: `"if order is above 100 get 10% discount"`
   - AI will refine it to include specific thresholds, eligibility criteria, and business constraints

2. **Inventory Management**:
   - Input: `"when inventory low send alert"`
   - AI will add specific quantity thresholds, notification methods, and target recipients

3. **Customer Management**:
   - Input: `"vip customers get free shipping"`
   - AI will define VIP criteria, eligibility constraints, and implementation details

## API Usage

### Rule Refinement
```javascript
const response = await fetch('/api/ai/refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rule: 'your rule here' })
});

const data = await response.json();
console.log(data.refinement.improvedRule);
```

## Support

- 📖 [Documentation](./README.md)
- 🐛 [Issues](https://github.com/sumitshahu21/AI-Powered-Business--Rules--Management--System/issues)
- 💬 [Discussions](https://github.com/sumitshahu21/AI-Powered-Business--Rules--Management--System/discussions)
