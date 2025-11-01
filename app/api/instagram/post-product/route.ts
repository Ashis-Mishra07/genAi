import { NextRequest, NextResponse } from 'next/server';
import { InstagramPoster } from '@/lib/instagram-poster';
import { productOperations } from '@/lib/db/products';

interface PostProductRequest {
  productId: number;
}

export async function POST(request: NextRequest) {
  try {
    const { productId }: PostProductRequest = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch product details
    const product = await productOperations.getProductById(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has an image
    if (!product.image_url) {
      return NextResponse.json(
        { error: 'Product must have an image to post to Instagram' },
        { status: 400 }
      );
    }

    // Generate Instagram caption for the product
    const instagramCaption = generateProductCaption(product);

    try {
      const poster = new InstagramPoster();
      
      // Test connection first
      const connectionOk = await poster.testConnection();
      
      if (!connectionOk) {
        return NextResponse.json({
          success: false,
          error: 'Unable to connect to Instagram. Please check your Instagram credentials.',
          details: 'Instagram connection failed'
        }, { status: 500 });
      }

      // Post to Instagram using URL
      const mediaId = await poster.postImageByUrl(product.image_url, instagramCaption);

      if (mediaId) {
        // You could optionally update the product to mark it as posted to Instagram
        // await productOperations.updateProduct(productId, { posted_to_instagram: true });
        
        return NextResponse.json({
          success: true,
          message: 'Product posted to Instagram successfully',
          instagramPostId: mediaId,
          product: {
            id: product.id,
            name: product.name
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to post to Instagram',
          details: 'No media ID returned'
        }, { status: 500 });
      }

    } catch (instagramError) {
      console.error('Instagram posting error:', instagramError);
      return NextResponse.json({
        success: false,
        error: 'Failed to post to Instagram',
        details: instagramError instanceof Error ? instagramError.message : 'Unknown Instagram error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateProductCaption(product: any): string {
  const hashtags = [
    '#handmade',
    '#artisan',
    '#traditional',
    '#authentic',
    '#craft',
    '#handcrafted',
    '#artisanal',
    '#culture',
    '#heritage',
    '#madewithlove'
  ];

  // Add category-specific hashtags
  const categoryHashtags: { [key: string]: string[] } = {
    'Textiles': ['#textiles', '#fabric', '#weaving', '#silk', '#cotton'],
    'Pottery': ['#pottery', '#ceramics', '#clay', '#handthrown', '#earthenware'],
    'Jewelry': ['#jewelry', '#handmadejewelry', '#artisanjewelry', '#accessories'],
    'Woodwork': ['#woodwork', '#handcarved', '#woodcraft', '#sculpture'],
    'Metalwork': ['#metalwork', '#handforged', '#metalcraft', '#bronze', '#copper'],
    'Paintings': ['#art', '#painting', '#canvas', '#artwork', '#fineart'],
    'Handicrafts': ['#handicrafts', '#artisan', '#traditional', '#cultural']
  };

  const specificHashtags = categoryHashtags[product.category] || [];
  
  // Add product tags as hashtags if available
  const productHashtags = product.tags ? 
    product.tags.map((tag: string) => `#${tag.replace(/\s+/g, '').toLowerCase()}`) : [];

  const allHashtags = [...hashtags, ...specificHashtags, ...productHashtags].slice(0, 15);

  const caption = `✨ ${product.name} ✨

${product.description}

💰 Price: ${product.currency === 'INR' ? '₹' : '$'}${product.price.toLocaleString()}
🎨 Category: ${product.category}
${product.story ? `📖 ${product.story.substring(0, 100)}...` : ''}

Discover authentic artisan crafts that tell a story! 🎭

${allHashtags.join(' ')}

#ArtisanAI #HandmadeWithLove #SupportArtisans`;

  return caption;
}