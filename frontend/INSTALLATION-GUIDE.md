# Frontend Testing Installation Guide

## Current Status

✅ **Test files created**
✅ **Configuration files updated**
⏳ **Dependencies installation pending** (network issues)

## Installation Steps

### Step 1: Install Dependencies

Due to network connectivity issues, you may need to try one of these approaches:

#### Option A: Standard Installation
```bash
cd frontend
npm install
```

#### Option B: With Legacy Peer Deps (Recommended for React 19)
```bash
cd frontend
npm install --legacy-peer-deps
```

#### Option C: Clear Cache and Retry
```bash
cd frontend
npm cache clean --force
npm install --legacy-peer-deps
```

#### Option D: Install with Increased Timeout
```bash
cd frontend
npm install --legacy-peer-deps --timeout=60000
```

### Step 2: Verify Installation

Check if all testing dependencies are installed:

```bash
npm list @testing-library/react @testing-library/user-event vitest
```

Expected output should show:
- @testing-library/react@16.1.0
- @testing-library/user-event@14.5.2
- vitest@2.1.8

### Step 3: Run Tests

Once dependencies are installed:

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Files Created

### 1. Test Configuration
- ✅ `vite.config.js` - Updated with Vitest configuration
- ✅ `src/test/setup.js` - Test setup file
- ✅ `package.json` - Updated with test scripts and dependencies

### 2. Test Files
- ✅ `tests/TopicForm.test.jsx` - 29 comprehensive tests for TopicForm component

### 3. Documentation
- ✅ `TESTING-SETUP-SUMMARY.md` - Complete testing documentation
- ✅ `INSTALLATION-GUIDE.md` - This file

## Dependencies Added

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/ui": "^2.1.8",
    "happy-dom": "^15.11.7",
    "vitest": "^2.1.8"
  }
}
```

## Test Scripts Added

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Troubleshooting

### Network Errors (ECONNRESET)

If you encounter network errors during installation:

1. **Check Internet Connection**: Ensure stable internet connectivity
2. **Use Different Registry**: Try using a different npm registry
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```
3. **Use VPN/Proxy**: If behind a corporate firewall, configure proxy settings
4. **Retry Later**: Network issues may be temporary

### Permission Errors (EPERM)

If you see permission errors:

1. **Close VSCode**: Close all instances of VSCode
2. **Close Node Processes**: Kill any running node processes
3. **Run as Administrator**: Try running terminal as administrator
4. **Delete node_modules**: 
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install --legacy-peer-deps
   ```

### Peer Dependency Warnings

The project uses React 19, which may show peer dependency warnings. Use `--legacy-peer-deps` flag to resolve:

```bash
npm install --legacy-peer-deps
```

## Expected Test Results

Once installation is complete and tests run successfully, you should see:

```
✓ tests/TopicForm.test.jsx (29)
  ✓ Rendering Tests (4)
  ✓ Validation Tests (5)
  ✓ User Interaction Tests (5)
  ✓ Edge Cases (3)
  ✓ Additional Comprehensive Tests (12)

Test Files  1 passed (1)
Tests  29 passed (29)
```

## Next Steps After Installation

1. **Run Tests**: `npm test`
2. **Verify All Pass**: Ensure all 29 tests pass
3. **Generate Coverage**: `npm run test:coverage`
4. **Commit Changes**: 
   ```bash
   git add .
   git commit -m "test(frontend): add TopicForm component tests"
   ```

## Manual Testing Alternative

If automated tests cannot run due to installation issues, you can manually test the component:

1. Start the dev server: `npm run dev`
2. Open the application in browser
3. Test the TopicForm component manually:
   - Enter text with < 7 words (should show red border)
   - Enter text with 7-24 words (should show green border)
   - Enter text with > 24 words (should show red border)
   - Submit valid form (should trigger callback)
   - Test loading state
   - Test error handling

## Support

If installation issues persist:

1. Check npm logs: `C:\Users\LENOVO T14\AppData\Local\npm-cache\_logs\`
2. Try alternative package managers:
   - **pnpm**: `pnpm install`
   - **yarn**: `yarn install`
3. Install dependencies one by one:
   ```bash
   npm install --save-dev vitest@2.1.8
   npm install --save-dev @testing-library/react@16.1.0
   npm install --save-dev @testing-library/user-event@14.5.2
   npm install --save-dev @testing-library/jest-dom@6.6.3
   npm install --save-dev happy-dom@15.11.7
   npm install --save-dev @vitest/ui@2.1.8
   ```

## Summary

All test files and configurations have been created successfully. The only remaining step is to install the dependencies when network connectivity is stable. Once installed, run `npm test` to execute all 29 tests for the TopicForm component.
