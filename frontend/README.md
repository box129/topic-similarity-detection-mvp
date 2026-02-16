# Topic Similarity Frontend 🎨

React + Vite web interface for checking topic similarity against existing submissions.

![Tests](https://img.shields.io/badge/tests-74%2F74%20passing-brightgreen) ![Coverage](https://img.shields.io/badge/coverage-95.39%25-brightgreen) ![React](https://img.shields.io/badge/react-18-blue) ![Vite](https://img.shields.io/badge/vite-5.0+-green)

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Available Scripts](#available-scripts)
- [Environment Setup](#environment-setup)
- [Testing](#testing)
- [Styling](#styling)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running on port 3000

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

### Connect to Backend

Update `.env.local`:
```env
VITE_API_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── features/
│   │   │   ├── TopicInput/
│   │   │   │   ├── TopicForm.jsx         # Topic & keywords form
│   │   │   │   └── TopicForm.test.jsx    # Form tests
│   │   │   │
│   │   │   └── Results/
│   │   │       ├── ResultsDisplay.jsx     # Results UI
│   │   │       └── ResultsDisplay.test.jsx # Results tests
│   │   │
│   │   ├── Common/
│   │   │   ├── Header.jsx                # App header
│   │   │   ├── Footer.jsx                # App footer
│   │   │   └── LoadingSpinner.jsx        # Loading indicator
│   │   │
│   │   └── ErrorBoundary.jsx             # Error handling wrapper
│   │
│   ├── App.jsx                           # Root component
│   ├── App.test.jsx                      # App tests
│   ├── main.jsx                          # Entry point
│   ├── index.css                         # Global styles
│   └── api.js                            # API client
│
├── public/                               # Static assets
│   └── index.html                        # HTML entry point
│
├── tests/
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   └── __mocks__/                        # Mock data
│
├── .env.example                          # Environment template
├── vite.config.js                        # Vite configuration
├── vitest.config.js                      # Vitest configuration
├── tailwind.config.js                    # Tailwind CSS config
├── postcss.config.js                     # PostCSS config
├── eslint.config.js                      # ESLint rules
├── package.json                          # Dependencies
└── README.md                             # This file
```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App (root)
├── Header
├── Container
│   ├── TopicForm
│   │   ├── Input field (topic)
│   │   ├── Input field (keywords)
│   │   └── Submit button
│   │
│   └── ResultsDisplay (conditional)
│       ├── RiskLevelBadge
│       ├── AlgorithmScores
│       └── ResultTiers
│           ├── Tier1 (historical - top 5)
│           ├── Tier2 (current session - ≥60%)
│           └── Tier3 (under review - ≥60%)
│
└── Footer
```

### Component Descriptions

#### TopicForm.jsx
**Purpose:** Collect user input (topic & keywords)

**Props:** None (manages own state)

**State:**
- `topic` - Main topic text
- `keywords` - Comma-separated keywords
- `error` - Validation error message
- `isLoading` - Submission in progress

**Features:**
- Real-time input validation
- Word count display
- Character limit enforcement
- XSS protection via sanitization
- Helpful error messages

**Validation Rules:**
- Topic: 5-200 words required
- Keywords: max 500 characters
- Sanitization: Remove HTML tags

#### ResultsDisplay.jsx
**Purpose:** Display similarity check results with risk assessment

**Props:**
```javascript
{
  results: {
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW',
    max_similarity: 0.85,
    tier1_matches: [...],      // Top 5 historical
    tier2_matches: [...],      // Current session ≥60%
    tier3_matches: [...],      // Under review ≥60%
    sbert_available: true,
    algorithms: {
      jaccard: { score: 0.85, topResults: [...] },
      tfidf: { score: 0.82, topResults: [...] },
      sbert: { score: 0.88, topResults: [...] }
    }
  }
}
```

**Features:**
- Color-coded risk levels (Green/Yellow/Red)
- Algorithm score breakdown
- Three-tier result filtering
- Match cards with detailed info
- Responsive layout

#### App.jsx
**Purpose:** Root component coordinating form & results

**State:**
- `results` - API response data
- `error` - Error message
- `isLoading` - API call in progress

**Features:**
- Form submission handling
- API communication
- Error boundary integration
- Memory leak prevention (AbortController)
- Proper cleanup on unmount

---

## 📜 Available Scripts

### Development

```bash
# Start Vite dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run specific test file
npm test TopicForm.test.jsx

# Generate coverage report
npm run test:coverage

# Run without coverage
npm test -- --no-coverage
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Build & Deployment

```bash
# Build for production
npm run build

# Analyze bundle size
npm run build -- --analyze

# Preview production build
npm run preview
```

---

## ⚙️ Environment Setup

### Environment Variables

Create `.env.local`:
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Optional: Feature flags
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

### Configuration Files

#### vite.config.js
```javascript
export default {
  plugins: [react()],
  server: {
    port: 5173,
    hmr: true,
    cors: true
  }
}
```

#### tailwind.config.js
- Configured for responsive design
- Custom color scheme for risk levels
- Extended spacing & typography

#### vitest.config.js
- Uses jsdom for DOM testing
- Coverage threshold: 70%
- Watch mode support

---

## 🧪 Testing

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   │   ├── TopicForm.test.jsx        # 28 tests
│   │   ├── ResultsDisplay.test.jsx   # 24 tests
│   │   └── App.test.jsx              # 22 tests
│   │
│   └── utils/
│       └── validation.test.jsx       # Input validation tests
│
└── integration/
    └── user-flow.test.jsx            # End-to-end user flows
```

### Run Tests

```bash
# All tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Specific test file
npm test TopicForm.test.jsx

# Specific test pattern
npm test -- --testNamePattern="validation"

# Coverage report
npm run test:coverage

# Update snapshots
npm test -- -u
```

### Test Results

```
Test Files: 3 passed (3)
Tests:      74 passed (74)
Coverage:   95.39% statements, 94.8% branches
Time:       25.11s
```

### Writing Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import TopicForm from '../TopicForm';

describe('TopicForm', () => {
  test('renders form inputs', () => {
    render(<TopicForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
  });

  test('validates topic length', () => {
    render(<TopicForm onSubmit={jest.fn()} />);
    
    const input = screen.getByLabelText(/topic/i);
    fireEvent.change(input, { target: { value: 'too short' } });
    fireEvent.click(screen.getByText(/submit/i));
    
    expect(screen.getByText(/must be at least 5 words/i)).toBeInTheDocument();
  });
});
```

---

## 🎨 Styling

### Tailwind CSS

Application uses **Tailwind CSS** for all styling:

```bash
# Classes automatically applied
npm run build:css  # If needed for production
```

### Risk Level Colors

| Level | Color | Tailwind Class |
|-------|-------|-----------------|
| LOW | Green | `bg-green-100 text-green-800` |
| MEDIUM | Yellow | `bg-yellow-100 text-yellow-800` |
| HIGH | Red | `bg-red-100 text-red-800` |

### Custom Components

- **Badge:** Risk level indicator
- **Card:** Result match display
- **Spinner:** Loading indicator
- **Alert:** Error/warning messages

### Responsive Design

```css
/* Mobile first approach */
base styles: 320px+
sm:         640px+
md:         768px+
lg:        1024px+
xl:        1280px+
2xl:       1536px+
```

---

## 🔌 API Integration

### API Client

File: `src/api.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const checkSimilarity = async (topic, keywords) => {
  const response = await apiClient.post('/api/similarity/check', {
    topic,
    keywords
  });
  return response.data;
};
```

### Error Handling

```javascript
try {
  const result = await checkSimilarity(topic, keywords);
  setResults(result);
} catch (err) {
  if (err.response?.status === 400) {
    setError('Invalid input: ' + err.response.data.message);
  } else if (err.request) {
    setError('Cannot reach server. Check your connection.');
  } else {
    setError('An unexpected error occurred.');
  }
}
```

---

## 🚨 Error Handling

### User-Facing Errors

| Scenario | Message | Action |
|----------|---------|--------|
| No API response | Cannot reach server | Retry or check connection |
| Validation fails | Topic must be 5+ words | Fix input and resubmit |
| Server error | Server error (500) | Contact support |
| Network timeout | Request timeout | Retry submission |

### Developer Mode

Set `VITE_DEBUG_MODE=true` for:
- Detailed console logging
- Longer timeouts
- Full error stack traces

---

## 📱 Responsive Design

### Breakpoints

```javascript
// Mobile: < 640px
<div className="flex flex-col gap-4">

// Tablet: 640px - 1024px
<div className="md:grid md:grid-cols-2">

// Desktop: > 1024px
<div className="lg:grid lg:grid-cols-3">
```

### Touch-Friendly

- Buttons: min 44px × 44px
- Form inputs: full width on mobile
- Proper spacing on small screens

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to API"
```bash
# Verify backend is running
curl http://localhost:3000/health

# Check VITE_API_URL in .env.local
# Should be: http://localhost:3000
```

#### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Tests failing"
```bash
# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --reporter=verbose
```

#### "Port 5173 already in use"
```bash
# Use different port
npm run dev -- --port 5174

# Or kill existing process
lsof -i :5173 | grep node | awk '{print $2}' | xargs kill -9
```

#### "Hot reload not working"
```bash
# Ensure vite.config.js has HMR enabled
# Check firewall isn't blocking port 5173
# Try full page refresh (Ctrl+Shift+R)
```

---

## 📚 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend Setup](../backend/README.md) - Backend configuration
- [API Documentation](../backend/API-DOCUMENTATION.md) - API reference
- [Architecture Guide](../.github/copilot-instructions.md) - System design

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| [React Docs](https://react.dev) | React framework |
| [Vite Docs](https://vitejs.dev) | Build tool |
| [Tailwind Docs](https://tailwindcss.com) | CSS framework |
| [Vitest Docs](https://vitest.dev) | Test framework |
| [Axios Docs](https://axios-http.com) | HTTP client |

---

## 🎯 Performance Tips

### Optimization Best Practices

1. **Code Splitting**
   - Components lazy-loaded via `React.lazy()`
   - Routes use code splitting

2. **Bundle Size**
   - Tree-shake unused code
   - Minify in production
   - Target: < 500KB gzipped

3. **Rendering Performance**
   - Use `useMemo` for expensive computations
   - Memoize components with `React.memo`
   - Avoid inline objects/functions

4. **Network Performance**
   - Debounce API calls on form input
   - Cache API responses
   - Show loading states

---

## 📊 Development Workflow

### Feature Development Checklist

- [ ] Create feature branch
- [ ] Implement component
- [ ] Add tests (aim for 90%+ coverage)
- [ ] Update JSDoc comments
- [ ] Test in browser
- [ ] Run `npm test` - all passing
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - builds successfully
- [ ] Commit with clear message
- [ ] Create pull request

---

**Version:** v0.13.0  
**Last Updated:** February 16, 2026  
**Status:** ✅ Production Ready
