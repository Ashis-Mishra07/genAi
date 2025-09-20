import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';

export class InstagramPoster {
  private businessAccountId: string;
  private accessToken: string;
  private userAccessToken?: string;
  private apiUrl: string;
  private facebookAppId?: string;
  private facebookAppSecret?: string;
  private facebookPageId?: string;
  private instagramAppSecret?: string;

  constructor() {
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
    this.accessToken = process.env.ACCESS_TOKEN!;
    this.userAccessToken = process.env.USER_ACCESS_TOKEN;
    this.apiUrl = process.env.INSTAGRAM_API_URL || "https://graph.facebook.com/v18.0";

    // Additional Facebook/Instagram app configuration
    this.facebookAppId = process.env.FACEBOOK_APP_ID;
    this.facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    this.facebookPageId = process.env.FACEBOOK_PAGE_ID;
    this.instagramAppSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!this.businessAccountId || !this.accessToken) {
      throw new Error(
        "Missing required environment variables. Please check your .env file."
      );
    }

    console.log(
      `🔧 Initialized with Business Account ID: ${this.businessAccountId}`
    );
    console.log(`📱 Facebook Page ID: ${this.facebookPageId}`);
  }

  /**
   * Upload an image to Instagram and create a media container
   * @param imagePath - Path to the image file
   * @param caption - Caption for the post
   * @returns Media container ID
   */
  async uploadImage(imagePath: string, caption: string = ""): Promise<string> {
    try {
      // Check if image file exists
      if (!(await fs.pathExists(imagePath))) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Get file info
      const stats = await fs.stat(imagePath);
      const fileSize = stats.size;

      console.log(
        `📸 Uploading image: ${imagePath} (${Math.round(fileSize / 1024)}KB)`
      );

      // Create media container
      const uploadUrl = `${this.apiUrl}/${this.businessAccountId}/media`;

      const formData = new FormData();
      formData.append("image_url", fs.createReadStream(imagePath));
      formData.append("caption", caption);
      formData.append("access_token", this.accessToken);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data && response.data.id) {
        console.log(
          "✅ Media container created successfully:",
          response.data.id
        );
        return response.data.id;
      } else {
        throw new Error("Failed to create media container");
      }
    } catch (error: any) {
      console.error(
        "❌ Error uploading image:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Alternative method: Upload image using URL instead of file upload
   * @param imageUrl - Public URL of the image
   * @param caption - Caption for the post
   * @returns Media container ID
   */
  async uploadImageByUrl(imageUrl: string, caption: string = ""): Promise<string> {
    try {
      console.log(`📸 Creating media container with URL: ${imageUrl}`);

      const uploadUrl = `${this.apiUrl}/${this.businessAccountId}/media`;

      const params = {
        image_url: imageUrl,
        caption: caption,
        access_token: this.accessToken,
      };

      const response = await axios.post(uploadUrl, null, {
        params: params,
        timeout: 30000,
      });

      if (response.data && response.data.id) {
        console.log(
          "✅ Media container created successfully:",
          response.data.id
        );
        return response.data.id;
      } else {
        throw new Error("Failed to create media container");
      }
    } catch (error: any) {
      console.error(
        "❌ Error creating media container:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Publish the media container to Instagram
   * @param creationId - Media container ID from uploadImage
   * @returns Published media ID
   */
  async publishPost(creationId: string): Promise<string> {
    try {
      console.log(`📤 Publishing post with creation ID: ${creationId}`);

      const publishUrl = `${this.apiUrl}/${this.businessAccountId}/media_publish`;

      const params = {
        creation_id: creationId,
        access_token: this.accessToken,
      };

      const response = await axios.post(publishUrl, null, {
        params: params,
        timeout: 30000,
      });

      if (response.data && response.data.id) {
        console.log("🎉 Post published successfully!");
        console.log("📱 Media ID:", response.data.id);
        return response.data.id;
      } else {
        throw new Error("Failed to publish post");
      }
    } catch (error: any) {
      console.error(
        "❌ Error publishing post:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Complete workflow: Upload image and publish post
   * @param imagePath - Path to the image file
   * @param caption - Caption for the post
   * @returns Published media ID
   */
  async postImage(imagePath: string, caption: string = ""): Promise<string> {
    try {
      console.log("🚀 Starting Instagram post process...");

      // Step 1: Upload image and create media container
      const creationId = await this.uploadImage(imagePath, caption);

      // Step 2: Wait a moment before publishing (recommended by Instagram)
      console.log("⏱️  Waiting 2 seconds before publishing...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Publish the post
      const mediaId = await this.publishPost(creationId);

      console.log("✨ Instagram post completed successfully!");
      return mediaId;
    } catch (error: any) {
      console.error("💥 Failed to post to Instagram:", error.message);
      throw error;
    }
  }

  /**
   * Complete workflow using image URL: Upload image and publish post
   * @param imageUrl - Public URL of the image
   * @param caption - Caption for the post
   * @returns Published media ID
   */
  async postImageByUrl(imageUrl: string, caption: string = ""): Promise<string> {
    try {
      console.log("🚀 Starting Instagram post process with URL...");

      // Step 1: Create media container with URL
      const creationId = await this.uploadImageByUrl(imageUrl, caption);

      // Step 2: Wait a moment before publishing
      console.log("⏱️  Waiting 2 seconds before publishing...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Publish the post
      const mediaId = await this.publishPost(creationId);

      console.log("✨ Instagram post completed successfully!");
      return mediaId;
    } catch (error: any) {
      console.error("💥 Failed to post to Instagram:", error.message);
      throw error;
    }
  }

  /**
   * Test the Instagram API connection with multiple token types
   * @returns Connection status
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing Instagram API connection...");

      // First try with Instagram access token
      console.log("📱 Testing with Instagram access token...");
      const testUrl = `${this.apiUrl}/${this.businessAccountId}`;
      const params = {
        fields: "id,username",
        access_token: this.accessToken,
      };

      try {
        const response = await axios.get(testUrl, { params });
        if (response.data && response.data.id) {
          console.log("✅ Connection successful with Instagram token!");
          console.log("📋 Account ID:", response.data.id);
          console.log("👤 Username:", response.data.username || "N/A");
          return true;
        }
      } catch (error: any) {
        console.log("⚠️  Instagram token failed, trying user access token...");
        console.log(
          "Error:",
          error.response?.data?.error?.message || error.message
        );
      }

      // Try with user access token if available
      if (this.userAccessToken) {
        console.log("🔄 Testing with user access token...");
        params.access_token = this.userAccessToken;

        try {
          const response = await axios.get(testUrl, { params });
          if (response.data && response.data.id) {
            console.log("✅ Connection successful with user access token!");
            console.log("📋 Account ID:", response.data.id);
            console.log("👤 Username:", response.data.username || "N/A");
            // Update the main token to use the working one
            this.accessToken = this.userAccessToken;
            return true;
          }
        } catch (error: any) {
          console.log("⚠️  User access token also failed");
          console.log(
            "Error:",
            error.response?.data?.error?.message || error.message
          );
        }
      }

      console.log("❌ All connection attempts failed");
      return false;
    } catch (error: any) {
      console.error(
        "❌ Connection test failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }
}
