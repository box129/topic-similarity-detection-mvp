# Topic Similarity Frontend

React frontend application for the Topic Similarity Checker MVP.

## Features

- ✅ Topic input form with real-time validation
- ✅ Word count validation (7-24 words)
- ✅ Character count guideline (50-180 chars)
- ✅ Visual feedback (red/green borders)
- ✅ Loading states during API calls
- ✅ Error handling and display
- ✅ Responsive design with Tailwind CSS
- ✅ Results display with risk levels

## Tech Stack

- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Axios 1.6** - HTTP client
- **PropTypes** - Runtime type checking

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── features/
│   │       └── TopicInput/
│   │           └── TopicForm.jsx    # Main form component
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles with Tailwind
├── index.html                        # HTML template
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.js                 # PostCSS configuration
└── package.json                      # Dependencies and scripts
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 3. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

## Component Documentation

### TopicForm Component

The main form component for topic input with validation.

**Props:**
- `onSubmit` (function, required) - Callback when form is submitted
- `isLoading` (boolean, optional) - Loading state during API call

**Features:**
- Real-time word count validation (7-24 words)
- Character count guideline (50-180 chars)
- Visual feedback with colored borders
- Disabled submit button when invalid
- Loading spinner during submission
- Error message display
- Optional keywords input
- Help text with tips

**Usage:**

```jsx
import TopicForm from './components/features/TopicInput/TopicForm';

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Call API
      await checkSimilarity(data);
    } finally {
      setIsLoading(false);
    }
  };

  return <TopicForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
```

## Validation Rules

### Topic Input

1. **Required Field** - Cannot be empty
2. **Word Count** - Must be between 7-24 words
3. **Character Count** - Guideline of 50-180 characters (warning only)

### Visual Feedback

- **Gray Border** - No input yet
- **Red Border** - Invalid (too short or too long)
- **Green Border** - Valid input
- **Yellow Text** - Character count outside guideline

### Submit Button States

- **Disabled (Gray)** - Invalid input or loading
- **Enabled (Blue)** - Valid input and not loading
- **Loading** - Shows spinner and "Checking Similarity..." text

## API Integration

The frontend connects to the backend API at `http://localhost:3000` via Vite proxy.

**Endpoint:** `POST /api/similarity/check`

**Request:**
```json
{
  "topic": "Machine Learning Applications",
  "keywords": "neural networks, AI"
}
```

**Response:**
```json
{
  "topic": "Machine Learning Applications",
  "results": {
    "tier1_historical": [...],
    "tier2_current_session": [...],
    "tier3_under_review": [...]
  },
  "overallRisk": "HIGH",
  "algorithmStatus": {
    "jaccard": true,
    "tfidf": true,
    "sbert": true
  },
  "processingTime": 1234
}
```

## Styling

The app uses Tailwind CSS for styling with a custom configuration:

- **Primary Color:** Blue (blue-600)
- **Success Color:** Green (green-500)
- **Error Color:** Red (red-500)
- **Warning Color:** Yellow (yellow-500)
- **Background:** Gray (gray-100)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

No environment variables required. API proxy is configured in `vite.config.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Module Replacement (HMR)** - Changes reflect instantly
2. **React DevTools** - Install browser extension for debugging
3. **Tailwind IntelliSense** - Install VS Code extension for autocomplete
4. **ESLint** - Configured for React best practices

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### API Connection Issues

Ensure the backend server is running on port 3000. Check `vite.config.js` proxy settings.

### Tailwind Styles Not Working

1. Ensure PostCSS and Tailwind are installed
2. Check `tailwind.config.js` content paths
3. Verify `@tailwind` directives in `index.css`

### Build Errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright
- [ ] Implement results pagination
- [ ] Add topic history/favorites
- [ ] Add dark mode support
- [ ] Add accessibility improvements
- [ ] Add internationalization (i18n)
- [ ] Add PWA support

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Last Updated:** December 2024  
**Version:** 0.1.0
