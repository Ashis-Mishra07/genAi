import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ConversationContext } from '@/lib/gemini-service';
import { ContentGeneratorTool } from '@/lib/mcp-tools/content-generator';
import { MarketingGeneratorTool } from '@/lib/mcp-tools/marketing-generator';
import { PricingAnalyzerTool } from '@/lib/mcp-tools/pricing-analyzer';

// Initialize MCP tools
const contentGenerator = new ContentGeneratorTool();
const marketingGenerator = new MarketingGeneratorTool();
const pricingAnalyzer = new PricingAnalyzerTool();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Analyze user intent first
    const intentAnalysis = await geminiService.analyzeIntent(message);
    console.log('Intent analysis:', intentAnalysis);

    let response: any = { success: false };

    // Route to appropriate handler based on intent
    switch (intentAnalysis.intent) {
      case 'content_generation':
        if (intentAnalysis.confidence > 0.7) {
          // Use MCP content tool for cultural stories
          response = await handleContentGeneration(message);
        } else {
          // Use Gemini for general content
          response = await handleConversation(message, conversationHistory);
        }
        break;

      case 'pricing':
        if (intentAnalysis.confidence > 0.7) {
          // Use MCP pricing tool
          response = await handlePricing(message);
        } else {
          response = await handleConversation(message, conversationHistory);
        }
        break;

      case 'marketing':
        if (intentAnalysis.confidence > 0.7) {
          // Use MCP marketing tool
          response = await handleMarketing(message);
        } else {
          response = await handleConversation(message, conversationHistory);
        }
        break;

      case 'image_analysis':
        response = {
          success: true,
          content: "I'd be happy to help analyze images! Please upload an image using the image button, and I'll provide detailed analysis for your product listing.",
          suggestTool: 'image'
        };
        break;

      case 'voice_processing':
        response = {
          success: true,
          content: "I can process voice messages in multiple languages! Use the microphone button to record your message, and I'll transcribe and respond to it.",
          suggestTool: 'voice'
        };
        break;

      default:
        // General conversation using Gemini
        response = await handleConversation(message, conversationHistory);
        break;
    }

    // Add intent information to response
    response.intent = intentAnalysis.intent;
    response.confidence = intentAnalysis.confidence;
    if (intentAnalysis.suggestion) {
      response.suggestion = intentAnalysis.suggestion;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function handleConversation(message: string, conversationHistory: ConversationContext[]) {
  const response = await geminiService.generateResponse(message, conversationHistory);
  return {
    success: response.success,
    content: response.content,
    error: response.error,
    type: 'conversation'
  };
}

async function handleContentGeneration(message: string) {
  try {
    // Call the content generator tool directly
    const result = await contentGenerator.execute({
      type: 'cultural_story',
      input: {
        productDescription: message,
        prompt: message
      }
    });
    
    if (result.success) {
      return {
        success: true,
        content: result.content || 'Content generated successfully',
        type: 'content_generation',
        tool: 'MCP Content Generator'
      };
    } else {
      // Fallback to Gemini
      const geminiResponse = await geminiService.generateResponse(message);
      return {
        success: geminiResponse.success,
        content: geminiResponse.content,
        error: geminiResponse.error,
        type: 'content_generation_fallback'
      };
    }
  } catch (error) {
    console.error('Content generation error:', error);
    // Fallback to Gemini
    const geminiResponse = await geminiService.generateResponse(message);
    return {
      success: geminiResponse.success,
      content: geminiResponse.content,
      error: geminiResponse.error,
      type: 'content_generation_fallback'
    };
  }
}

async function handlePricing(message: string) {
  try {
    // Call the pricing analyzer tool directly
    const result = await pricingAnalyzer.execute({
      productData: {
        name: message,
        description: message
      },
      category: 'artisan_craft'
    });
    
    if (result.success) {
      return {
        success: true,
        content: typeof result.pricing === 'string' ? result.pricing : JSON.stringify(result.pricing, null, 2),
        type: 'pricing_analysis',
        tool: 'MCP Pricing Analyzer'
      };
    } else {
      // Fallback to Gemini with pricing context
      const geminiResponse = await geminiService.generateResponse(
        message, 
        [], 
        "You are a pricing expert for artisan products. Provide helpful pricing advice for handcrafted items in the Indian market."
      );
      return {
        success: geminiResponse.success,
        content: geminiResponse.content,
        error: geminiResponse.error,
        type: 'pricing_fallback'
      };
    }
  } catch (error) {
    console.error('Pricing analysis error:', error);
    const geminiResponse = await geminiService.generateResponse(message);
    return {
      success: geminiResponse.success,
      content: geminiResponse.content,
      error: geminiResponse.error,
      type: 'pricing_fallback'
    };
  }
}

async function handleMarketing(message: string) {
  try {
    // Call the marketing generator tool directly
    const result = await marketingGenerator.execute({
      productData: {
        name: message,
        description: message,
        category: 'artisan_craft',
        prompt: message
      },
      platform: 'social_media'
    });
    
    if (result.success) {
      return {
        success: true,
        content: result.marketing || 'Marketing content generated successfully',
        type: 'marketing_content',
        tool: 'MCP Marketing Generator'
      };
    } else {
      // Fallback to Gemini with marketing context
      const geminiResponse = await geminiService.generateMarketingContent(message);
      return {
        success: geminiResponse.success,
        content: geminiResponse.content,
        error: geminiResponse.error,
        type: 'marketing_fallback'
      };
    }
  } catch (error) {
    console.error('Marketing generation error:', error);
    const geminiResponse = await geminiService.generateMarketingContent(message);
    return {
      success: geminiResponse.success,
      content: geminiResponse.content,
      error: geminiResponse.error,
      type: 'marketing_fallback'
    };
  }
}
