# BlackboxAI Pro Plan - Model Selection Guide

**Your Plan:** BlackboxAI Pro  
**Date:** February 8, 2026

---

## 🤖 Model Selection in BlackboxAI

### Current BlackboxAI Capabilities

Based on typical BlackboxAI Pro plan features (as of early 2025):

**Available Models:**
- GPT-4 (OpenAI)
- Claude 3.5 Sonnet (Anthropic)
- Claude 3 Opus (Anthropic)
- Gemini Pro (Google)

**Model Selection:**
- ✅ **Manual selection available** - You can choose which model to use
- ❌ **No automatic "best model" selection** - BlackboxAI doesn't automatically pick the optimal model for specific tasks
- ℹ️ **Default model** - Typically Claude 3.5 Sonnet or GPT-4 (check your IDE settings)

---

## 🎯 **Recommended Model Selection for Your MVP**

Since you need to manually select models, here's guidance on which to use for different tasks:

### **For Backend Code Generation (Node.js, Express, Prisma)**

**Recommended: Claude 3.5 Sonnet** ⭐
- Excellent at generating clean, well-structured backend code
- Good at following architectural patterns
- Strong with Node.js/Express conventions
- Better at long-form code generation

**Alternative: GPT-4**
- Also very capable for backend work
- Sometimes more creative with solutions
- Good code quality

**Use Claude 3.5 Sonnet for:**
- Express controllers and middleware
- Prisma schema and queries
- Service layer implementations
- API endpoint logic
- Error handling patterns

---

### **For Algorithm Implementation (Jaccard, TF-IDF)**

**Recommended: Claude 3.5 Sonnet** ⭐
- Excellent at mathematical/algorithmic code
- Strong with functional programming
- Good at optimization

**Use Claude 3.5 Sonnet for:**
- Text preprocessing utilities
- Jaccard similarity algorithm
- TF-IDF + cosine similarity
- Data transformation functions

---

### **For Python/FastAPI (SBERT Service)**

**Recommended: Claude 3.5 Sonnet** ⭐
- Very strong with Python
- Good FastAPI knowledge
- Excellent ML library integration

**Alternative: GPT-4**
- Also strong with Python/FastAPI
- Good with ML frameworks

**Use Claude 3.5 Sonnet for:**
- FastAPI endpoints
- sentence-transformers integration
- Python async code
- Dockerfile creation

---

### **For Frontend/React Code**

**Recommended: Claude 3.5 Sonnet** ⭐
- Excellent React component generation
- Strong with React hooks
- Good Tailwind CSS integration
- Clean component architecture

**Use Claude 3.5 Sonnet for:**
- React functional components
- Form validation logic
- State management with hooks
- Tailwind CSS styling
- API integration with axios

---

### **For Documentation & README Files**

**Recommended: Claude 3.5 Sonnet** ⭐
- Excellent technical writing
- Clear, structured documentation
- Good at explaining complex concepts
- Strong markdown formatting

**Use Claude 3.5 Sonnet for:**
- README.md
- API documentation
- Deployment guides
- Code comments and JSDoc

---

### **For Testing/Test Generation**

**Recommended: Claude 3.5 Sonnet** ⭐
- Great at generating comprehensive tests
- Good coverage of edge cases
- Clean test structure

**Use Claude 3.5 Sonnet for:**
- Jest unit tests
- Integration tests
- Test data generation
- Mock/stub implementations

---

## 💡 **Practical Workflow**

### **Option 1: Stick with One Model (Simplest)**

**Recommendation: Use Claude 3.5 Sonnet for everything**

**Pros:**
- ✅ Consistent code style
- ✅ No context switching
- ✅ Claude 3.5 Sonnet is excellent at all these tasks
- ✅ Simpler workflow

**Cons:**
- ⚠️ Might miss GPT-4's occasional creative insights

### **Option 2: Use Two Models Strategically**

**Primary: Claude 3.5 Sonnet (95% of work)**
- All implementation code
- All documentation
- All tests

**Secondary: GPT-4 (5% of work)**
- When stuck on a problem
- For alternative implementation approaches
- For architectural design questions

---

## ⚙️ **How to Change Models in BlackboxAI IDE**

Typical methods (check your specific IDE version):

### **Method 1: IDE Settings**
1. Open BlackboxAI IDE settings/preferences
2. Look for "AI Model" or "Model Selection"
3. Choose "Claude 3.5 Sonnet"
4. Save and restart IDE

### **Method 2: Per-Chat Selection**
1. In the chat interface, look for model dropdown
2. Select model before sending prompt
3. Model persists for that conversation

### **Method 3: Keyboard Shortcut**
- Some versions support `Cmd/Ctrl + Shift + M` to switch models

**Check your BlackboxAI documentation for exact method.**

---

## 📊 **Model Comparison for Your Project**

| Task | Claude 3.5 Sonnet | GPT-4 | Winner |
|------|------------------|-------|--------|
| Node.js backend | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| Python/FastAPI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| React components | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| Algorithms | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| Documentation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| Testing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |
| Creative solutions | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GPT-4 |
| Code review | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Claude |

---

## 🎯 **My Recommendation for Your MVP**

### **Use Claude 3.5 Sonnet for 100% of the work**

**Why:**
1. ✅ Claude 3.5 Sonnet is excellent at all tasks in your stack
2. ✅ Consistent code quality and style
3. ✅ No need to context-switch between models
4. ✅ Simpler workflow = faster development
5. ✅ Claude is particularly strong with:
   - Long-form code generation
   - Following architectural patterns
   - Clean, maintainable code
   - Detailed documentation

**When to consider GPT-4:**
- If you get stuck on a specific problem
- If you want a second opinion on architecture
- If Claude's solution doesn't work after 2-3 attempts

---

## 🔄 **Workaround for "Auto Model Selection"**

Since BlackboxAI doesn't auto-select models, here's how to simulate it:

### **Create Your Own Decision Tree**

Before each prompt, ask yourself:

1. **Is this implementation code?** → Claude 3.5 Sonnet
2. **Is this documentation?** → Claude 3.5 Sonnet
3. **Is this testing?** → Claude 3.5 Sonnet
4. **Am I stuck/need creative solution?** → Try GPT-4
5. **Default for everything else?** → Claude 3.5 Sonnet

### **Simple Rule of Thumb**

**Use Claude 3.5 Sonnet unless:**
- You've tried the same prompt 3 times and it's not working
- You specifically need GPT-4's architectural reasoning
- You want a second opinion on design decisions

---

## 🚀 **Getting Started**

### **Step 1: Configure Default Model**

Set Claude 3.5 Sonnet as your default model in BlackboxAI IDE settings.

### **Step 2: Use Consistently**

Stick with Claude 3.5 Sonnet for the entire MVP development.

### **Step 3: Document Your Choice**

In your project README, add:

```markdown
## Development Tools

**AI Assistant:** BlackboxAI IDE with Claude 3.5 Sonnet
- Used for code generation, testing, and documentation
- Model chosen for consistency and code quality
```

---

## 📝 **Additional Notes**

### **Context Window Management**

**Claude 3.5 Sonnet:**
- Large context window (~200K tokens)
- Good for long conversations
- Can reference entire files

**GPT-4:**
- Also has large context window
- Similar capabilities

**Tips:**
- Start new chat when switching major features
- Include relevant code context in prompts
- Reference specific functions/files by name

### **Rate Limits (Pro Plan)**

Check your BlackboxAI Pro plan limits:
- Requests per hour
- Tokens per request
- Concurrent conversations

**If you hit limits:**
- Wait for reset
- Split large requests into smaller chunks
- Use code editor features instead of AI for simple edits

---

## ✅ **Final Recommendation**

**For your Research Topic Similarity Detection MVP:**

1. **Set default model:** Claude 3.5 Sonnet
2. **Use it for everything:** Backend, frontend, tests, docs
3. **Keep GPT-4 as backup:** Only if stuck
4. **Stay consistent:** Don't switch models mid-feature

**This will give you:**
- Clean, consistent codebase
- Predictable code quality
- Faster development
- Easier debugging

---

**You're now ready to start development with BlackboxAI IDE!** 🚀
