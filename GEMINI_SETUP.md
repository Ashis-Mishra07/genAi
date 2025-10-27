# Gemini Vision Image Refiner Setup

## Setup Instructions

1. **Get your Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key

2. **Set up environment variable:**
   ```bash
   export GEMINI_API_KEY="your-actual-api-key-here"
   ```

3. **Install required packages:**
   ```bash
   npm install @google/generative-ai
   ```

4. **Test the system:**
   ```bash
   node test-image-refiner.js hoodie.jpg
   ```

## What Gemini Vision Does Now:

✅ **Real Image Analysis** - Gemini Vision actually "sees" your uploaded image
✅ **Detailed Product Description** - Analyzes colors, style, materials, unique features
✅ **Background Analysis** - Understands current background and suggests improvements  
✅ **Professional Recommendations** - Provides lighting and setup suggestions
✅ **Accurate Photoshoot Generation** - Creates prompts based on your actual product

## Features:

- 🤖 **Gemini Vision API** for real image understanding
- 🎯 **Product-specific analysis** (colors, materials, style, details)
- 📸 **Professional photoshoot concepts** based on actual image
- 🔄 **Background optimization suggestions**
- ✨ **No more generic products** - uses YOUR exact item

## Example Usage:

```bash
# Set your API key
export GEMINI_API_KEY="AIza..."

# Test with your hoodie
node test-image-refiner.js hoodie.jpg

# Test with pottery
node test-image-refiner.js my-ceramic-bowl.jpg

# Test with jewelry  
node test-image-refiner.js silver-earrings.jpg
```

The system will now actually analyze your uploaded images and create photoshoots featuring your exact products!
