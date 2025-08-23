# NewsTracer - TraceFirst MVP

A sophisticated claim tracking and origin analysis system for news and information propagation. Built for the Amazon Q Hackathon 2025.

## ⚡ Quick Setup (Hackathon Ready!)

```bash
# Clone and setup
git clone <your-repo-url>
cd news-verifier
./setup.sh

# Start development
npm run dev
```

## 🎯 Overview

TraceFirst helps journalists, researchers, and analysts track the origin and propagation of claims across digital media. It provides:

- **Claim Clustering**: Groups similar articles using MinHash/LSH algorithms
- **Origin Tracking**: Identifies potential source articles with TraceScore algorithm
- **Visual Timeline**: Shows chronological propagation of claims
- **Interactive Mindmap**: Radial visualization of citation networks
- **Evidence Panel**: Transparent scoring with verifiable sources

## 🏗️ Architecture

```
newsTracer/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ClusterList/     # Cluster listing and search
│   │   ├── Timeline/        # Chronological view
│   │   ├── MindMap/         # Interactive network visualization
│   │   ├── Evidence/        # Score breakdown and verification
│   │   └── Layout/          # Responsive layout components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript definitions
│   └── app/                 # Next.js app router
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to project directory**
   ```bash
   cd "C:\Users\hk\Desktop\Amazon Q Hackathon 2025\newsTracer"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🧪 Demo Features

The current MVP includes:

### 1. **Cluster List** (Left Panel)
- Mock clusters with confidence indicators
- Source type badges (press/community/aggregator)
- Hover tooltips with article details

### 2. **Timeline View** (Center Panel)
- Chronological article progression
- Confidence-based color coding
- Source type icons and timestamps

### 3. **Mindmap Visualization** (Center Panel)
- Radial layout with origin candidates at center
- Node size based on TraceScore
- Citation edges with hover tooltips
- Filter controls for source types

### 4. **Evidence Panel** (Right Panel)
- TraceScore breakdown (T/X/B/A/S/C components)
- Timestamp analysis with confidence levels
- Verification links to sources

## 🔧 TraceScore Algorithm

```
TraceScore(i) = α·T + β·X + γ·B + δ·A - κ·S (+ μ·C)

Where:
- T = Temporal priority (earlier = higher score)
- X = Cross-verification (citations from different domains)
- B = Backlink strength (weighted citation count)
- A = Archive consistency (Wayback Machine verification)
- S = Syndication penalty (reduces score for aggregated content)
- C = Community origin bonus (optional boost for community sources)

Default weights: α=0.5, β=0.2, γ=0.2, δ=0.1, κ=0.3, μ=0.1
```

## 🎨 UI Components

Built with:
- **Next.js 14** - React framework with app router
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **D3.js** - Data visualization (for enhanced mindmap)

## 📊 Data Flow

1. **Ingestion**: RSS feeds, URL metadata, Wayback Machine
2. **Normalization**: URL canonicalization, timestamp standardization
3. **Clustering**: MinHash/LSH for similar content grouping
4. **Citation Analysis**: Extract and verify cross-references
5. **Scoring**: Apply TraceScore algorithm
6. **Visualization**: Real-time updates to UI components

## 🔮 Planned Features

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Export to PDF/CSV
- [ ] Watchlist and alerts
- [ ] Mobile-responsive design
- [ ] Backend API integration
- [ ] User authentication
- [ ] Case study bookmarking

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## 📝 License

This project is part of the Amazon Q Hackathon 2025 submission.

## 🤝 Contributing

This is a hackathon project. For questions or collaboration, please reach out to the development team.

---

**Built with ❤️ for Amazon Q Hackathon 2025**
