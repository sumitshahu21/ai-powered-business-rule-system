# 🧠 Business Rules Management System

A powerful, AI-driven business rules management application built with Next.js that transforms natural language input into structured, professional business rules. This system leverages OpenAI's GPT models to provide intelligent rule refinement, validation, and recommendations.

## ✨ Key Features

### 🤖 AI-Powered Rule Processing
- **Intelligent Rule Refinement**: Transform casual rule descriptions into professional, implementation-ready business rules
- **Context-Aware Suggestions**: AI understands your business domain (e-commerce, inventory, pricing, etc.) to provide relevant improvements
- **Smart Validation**: Automatic detection of rule conflicts, ambiguities, and business logic errors
- **Gibberish Detection**: Intelligent filtering of invalid or meaningless input

### 💼 Business Rule Management
- **Natural Language Input**: Write rules in plain English (e.g., "if order is above 100 get 10% discount")
- **Priority & Weight System**: Dynamically adjust rule importance and influence factors
- **Conflict Resolution**: Automated detection and suggestions for resolving rule conflicts
- **Rule Analytics**: Track rule performance and usage patterns

### 🎨 Modern User Interface
- **Responsive Design**: Built with Tailwind CSS for optimal experience across devices
- **Real-time Feedback**: Instant validation and suggestions as you type
- **Interactive Dashboard**: Comprehensive overview of all rules and their status
- **Export Functionality**: Download rules in structured JSON format

### 🔧 Technical Excellence
- **TypeScript**: Full type safety and developer experience
- **Modern React**: Using latest React 18 features and hooks
- **API-First Design**: Clean separation between frontend and AI processing
- **Error Handling**: Graceful fallbacks when AI services are unavailable

## 📁 Project Structure

```
business-rules-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Main dashboard
│   │   ├── rules/             # Rules management page
│   │   ├── analytics/         # Analytics dashboard
│   │   └── api/               # API routes
│   │       ├── ai/            # AI processing endpoints
│   │       │   ├── refine/    # Rule refinement API
│   │       │   ├── validate/  # Rule validation API
│   │       │   └── recommend/ # Recommendations API
│   │       └── rules/         # Rule CRUD operations
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── Dashboard.tsx     # Main dashboard component
│   │   ├── RuleInput.tsx     # Rule input with AI integration
│   │   ├── RuleCard.tsx      # Individual rule display
│   │   └── Navigation.tsx    # App navigation
│   ├── hooks/                # Custom React hooks
│   │   ├── useAI.ts         # AI service integration
│   │   ├── useRules.ts      # Rule management logic
│   │   └── useToast.ts      # Toast notifications
│   ├── lib/                  # Utility libraries
│   │   ├── ai.ts            # OpenAI integration & prompts
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Helper functions
│   └── store/               # State management
│       └── rules-context.tsx # Global rules state
├── public/                   # Static assets
├── .env.local               # Environment variables
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd business-rules-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   # OpenAI Configuration
   AI_API_KEY=your_openai_api_key_here
   
   # Optional: Database URL for persistent storage
   DATABASE_URL=your_database_connection_string_here
   
   # API Base URL for frontend calls
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage Examples

### Basic Rule Input
```
Input: "if order is above 100 get 10% discount"

AI Refinement Output:
"If order subtotal exceeds $100 (excluding taxes and shipping), apply a 10% discount to eligible regular-priced items, with a maximum discount of $50 per order"

Improvements Made:
✓ Specified exact monetary threshold ($100)
✓ Clarified calculation basis (subtotal excluding taxes/shipping)  
✓ Added eligibility constraints (regular-priced items only)
✓ Set maximum discount limit to prevent excessive discounts
```

### Advanced Rule Examples
- **Inventory**: "when inventory low send alert" → Detailed stock threshold rules
- **Customer Management**: "vip customers get free shipping" → Specific VIP criteria and benefits
- **Pricing**: "bulk orders get better rates" → Tiered pricing with exact quantities

## 🔧 API Endpoints

### Rule Refinement
```http
POST /api/ai/refine
Content-Type: application/json

{
  "rule": "if order is above 100 get 10% discount"
}
```

### Rule Validation
```http
POST /api/ai/validate
Content-Type: application/json

{
  "rules": ["rule1", "rule2", "rule3"]
}
```

### Recommendations
```http
POST /api/ai/recommend
Content-Type: application/json

{
  "rule": "new rule text",
  "existingRules": ["existing rule 1", "existing rule 2"]
}
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Development Guidelines

1. **AI Integration**: All AI calls include fallback logic for when the service is unavailable
2. **Error Handling**: Comprehensive error handling with user-friendly messages
3. **Type Safety**: Full TypeScript coverage with strict type checking
4. **Performance**: Optimized API calls with caching and request deduplication

### Adding New Business Domains

To extend the AI's understanding to new business domains:

1. Update the `PROJECT_CONTEXT` in `src/lib/ai.ts`
2. Add domain-specific fallback logic in `getSmartFallbackRefinement()`
3. Test with domain-specific rule examples

## 🔍 Troubleshooting

### Common Issues

**AI Service Unavailable**
- Check your OpenAI API key in `.env.local`
- Verify API quota and billing status
- The system provides smart fallbacks when AI is unavailable

**Rules Not Saving**
- Currently using in-memory storage (rules reset on server restart)
- For persistence, configure `DATABASE_URL` in environment variables

**Build Errors**
- Run `npm run type-check` to identify TypeScript issues
- Ensure all environment variables are properly set

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Docker
```bash
# Build the Docker image
docker build -t business-rules-app .

# Run the container
docker run -p 3000:3000 --env-file .env.local business-rules-app
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and TypeScript patterns
- Add tests for new features
- Update documentation as needed
- Ensure AI fallbacks are implemented for new AI features

## 📊 Performance & Monitoring

- **Response Times**: API endpoints typically respond within 2-5 seconds
- **AI Processing**: Rule refinement usually takes 1-3 seconds with OpenAI
- **Fallback Performance**: Smart fallbacks respond instantly when AI is unavailable
- **Error Rates**: Comprehensive error handling ensures 99%+ uptime for core features

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🔗 Related Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing [GitHub Issues](link-to-issues)
3. Open a new issue with detailed information about your problem

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and OpenAI**