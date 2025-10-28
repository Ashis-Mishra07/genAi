import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { VoiceProcessorTool } from './mcp-tools/voice-processor';
import { ImageAnalyzerTool } from './mcp-tools/image-analyzer';
import { ContentGeneratorTool } from './mcp-tools/content-generator';
import { PricingAnalyzerTool } from './mcp-tools/pricing-analyzer';
import { MarketingGeneratorTool } from './mcp-tools/marketing-generator';

class ArtisanMCPServer {
  private server: Server;
  private tools: Map<string, any>;

  constructor() {
    this.server = new Server(
      {
        name: 'artisan-marketplace-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = new Map();
    this.initializeTools();
    this.setupHandlers();
  }

  private initializeTools() {
    // Initialize all MCP tools
    this.tools.set('voice_processor', new VoiceProcessorTool());
    this.tools.set('image_analyzer', new ImageAnalyzerTool());
    this.tools.set('content_generator', new ContentGeneratorTool());
    this.tools.set('pricing_analyzer', new PricingAnalyzerTool());
    this.tools.set('marketing_generator', new MarketingGeneratorTool());
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'voice_processor',
            description: 'Process voice recordings and transcribe to text',
            inputSchema: {
              type: 'object',
              properties: {
                audioData: { type: 'string', description: 'Base64 encoded audio data' },
                language: { type: 'string', description: 'Language code for transcription' }
              },
              required: ['audioData']
            }
          },
          {
            name: 'image_analyzer',
            description: 'Analyze product images and extract information',
            inputSchema: {
              type: 'object',
              properties: {
                imageData: { type: 'string', description: 'Base64 encoded image data' },
                prompt: { type: 'string', description: 'Analysis prompt' }
              },
              required: ['imageData']
            }
          },
          {
            name: 'content_generator',
            description: 'Generate product descriptions and cultural stories',
            inputSchema: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Content type (product_description, cultural_story, etc.)' },
                input: { type: 'object', description: 'Input data for content generation' },
                context: { type: 'object', description: 'Additional context' }
              },
              required: ['type', 'input']
            }
          },
          {
            name: 'pricing_analyzer',
            description: 'Analyze and suggest fair pricing for artisan products',
            inputSchema: {
              type: 'object',
              properties: {
                productData: { type: 'object', description: 'Product information' },
                category: { type: 'string', description: 'Product category' }
              },
              required: ['productData', 'category']
            }
          },
          {
            name: 'marketing_generator',
            description: 'Generate marketing content for various platforms',
            inputSchema: {
              type: 'object',
              properties: {
                productData: { type: 'object', description: 'Product information' },
                platform: { type: 'string', description: 'Target platform (social, instagram, etc.)' }
              },
              required: ['productData']
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const tool = this.tools.get(name);
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Tool ${name} not found`
        );
      }

      try {
        const result = await tool.execute(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Artisan MCP Server started');
  }

  getServer() {
    return this.server;
  }
}

// Export for use in API routes
export const mcpServer = new ArtisanMCPServer();

// Start server if this file is run directly
if (require.main === module) {
  mcpServer.start().catch(console.error);
}
