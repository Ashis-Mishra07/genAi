import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const dataUrl = formData.get("dataUrl") as string;
    const folder = formData.get("folder") as string || "artisan-chat";
    const tags = formData.get("tags") as string;

    let uploadResponse: any;

    if (file) {
      // Handle file upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: folder,
            public_id: `${Date.now()}-${file.name.replace(/\s+/g, '-')}`,
            tags: tags ? tags.split(',') : ['product'],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

    } else if (dataUrl) {
      // Handle data URL upload (base64) - for generated posters
      console.log('🎨 Uploading poster from dataUrl...');
      console.log('📁 Folder:', folder);
      console.log('🏷️ Tags:', tags);
      
      uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        resource_type: "image",
        folder: folder,
        public_id: `poster-${Date.now()}`,
        tags: tags ? tags.split(',') : ['poster', 'generated'],
        quality: "auto",
        // Remove format: 'auto' to fix the error
      });
      
      console.log('✅ Poster upload successful:', {
        public_id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
        width: uploadResponse.width,
        height: uploadResponse.height
      });

    } else {
      return NextResponse.json({ error: "No file or dataUrl provided" }, { status: 400 });
    }

    const result = uploadResponse as any;

    console.log('📤 Upload API Response:', {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      file_type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      file_type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
      folder: result.folder,
      tags: result.tags
    });

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
