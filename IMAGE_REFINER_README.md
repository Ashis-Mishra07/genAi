# 🎯 Image Refiner - Photoshoot Style Generator

**Simple JavaScript tool that takes any product image and outputs a refined photoshoot-style image with models.**

## 🚀 Quick Start

```bash
# Basic usage
node image-refiner.js your-image.jpg

# Examples
node image-refiner.js my-hoodie.png
node image-refiner.js necklace-photo.jpg
node image-refiner.js handbag.jpeg
```

## ✨ What It Does

1. **Analyzes your image** - Detects product type automatically from filename
2. **Generates photoshoot concept** - Creates realistic model scenarios  
3. **Refines the image** - Outputs professional photoshoot-style image
4. **Saves result** - Downloads refined image with `_refined` suffix

## 📸 Supported Products

| Product Type | Model Type | Setting | Style |
|--------------|------------|---------|--------|
| **Hoodie** | Casual streetwear model | Urban street backdrop | Lifestyle photography |
| **T-Shirt** | Casual fashion model | Outdoor/studio setting | Lifestyle photography |
| **Necklace** | Elegant jewelry model | Portrait studio | Jewelry photography |
| **Handbag** | Street style model | Urban lifestyle setting | Accessory photography |
| **Shoes** | Active lifestyle model | Outdoor environment | Footwear photography |
| **Dress** | Elegant fashion model | Beautiful location/studio | Fashion photography |
| **Jacket** | Fashion model | Urban outdoor setting | Outerwear photography |
| **Shirt** | Professional model | Office/sophisticated setting | Business photography |
| **+ More** | Dynamic detection | Adaptive settings | Professional quality |

## 🎬 Example Output

**Input:** `my-black-hoodie.jpg`

**Output:** `my-black-hoodie_refined.jpg` 
- 👤 Casual streetwear model wearing the hoodie
- 📍 Urban street setting with natural lighting
- 🎨 Lifestyle photography style
- 📸 Instagram-ready professional quality

## 🔥 Features

- ✅ **Automatic Product Detection** - Smart recognition from filename
- ✅ **Realistic Model Scenarios** - Product-specific model types and poses  
- ✅ **Professional Photography** - Magazine-quality lighting and composition
- ✅ **Instagram-Ready Output** - Social media optimized aesthetic
- ✅ **No Hardcoded Templates** - Every image is uniquely generated
- ✅ **Multiple Formats** - Supports JPG, PNG, JPEG
- ✅ **Easy to Use** - Single command, automatic processing

## 🛠️ How It Works

```javascript
// 1. Detect product type
const productType = detectProductType('my-hoodie.jpg'); // → 'hoodie'

// 2. Get photoshoot concept  
const concept = getPhotoshootConcept('hoodie');
// → { modelType: 'casual streetwear model', setting: 'urban street', ... }

// 3. Generate refined image
const result = await generateRefinedImage('my-hoodie.jpg', 'hoodie');
// → Professional photoshoot image with model wearing hoodie
```

## 📋 Requirements

- Node.js
- Internet connection (for image generation API)

## 🎉 Try It Now!

```bash
# Run demo to see how it works
node demo-image-refiner.js

# Test with your own image
node image-refiner.js your-product-image.jpg
```

---

**Result**: Transform any product photo into a professional photoshoot with models! 🚀📸
