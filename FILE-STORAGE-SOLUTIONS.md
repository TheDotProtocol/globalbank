# 📁 File Storage Solutions for Global Dot Bank

## 🎯 **Best Options for KYC Document Storage**

### **🥇 1. AWS S3 (Recommended - Best Value)**

**Cost**: ~$0.023 per GB/month + transfer costs
**Pros**:
- ✅ **Cheapest** for production use
- ✅ **99.99% uptime** SLA
- ✅ **Global CDN** with CloudFront
- ✅ **Security features** (encryption, access control)
- ✅ **Easy integration** with Next.js
- ✅ **Scalable** from small to enterprise

**Setup**:
```bash
# Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Environment variables
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=globalbank-kyc-documents
```

**Monthly Cost Estimate**:
- 1GB storage: $0.023
- 10GB storage: $0.23
- 100GB storage: $2.30
- Transfer: $0.09 per GB

### **🥈 2. Cloudinary (Easiest Setup)**

**Cost**: Free tier (25GB storage, 25GB bandwidth)
**Pros**:
- ✅ **Free tier** for development
- ✅ **Image optimization** built-in
- ✅ **Easy upload** with drag & drop
- ✅ **Automatic resizing** and compression
- ✅ **CDN** included

**Setup**:
```bash
npm install cloudinary multer

# Environment variables
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Pricing**:
- Free: 25GB storage, 25GB bandwidth
- Paid: $89/month for 225GB storage

### **🥉 3. Supabase Storage (Integrated)**

**Cost**: Free tier (1GB storage, 2GB bandwidth)
**Pros**:
- ✅ **Already using Supabase** for database
- ✅ **Integrated** with your existing setup
- ✅ **Row Level Security** (RLS)
- ✅ **Automatic backups**

**Setup**:
```bash
npm install @supabase/supabase-js

# Already configured in your project
```

**Pricing**:
- Free: 1GB storage, 2GB bandwidth
- Pro: $25/month for 100GB storage

### **4. Google Cloud Storage**

**Cost**: ~$0.020 per GB/month
**Pros**:
- ✅ **Very cheap** storage
- ✅ **Global infrastructure**
- ✅ **Strong security**

**Cons**:
- ❌ More complex setup
- ❌ Higher transfer costs

### **5. DigitalOcean Spaces**

**Cost**: $5/month for 250GB
**Pros**:
- ✅ **Simple pricing**
- ✅ **Good performance**
- ✅ **S3-compatible API**

## 🚀 **Recommended Implementation: AWS S3**

### **Step 1: Create S3 Bucket**
```bash
# Using AWS CLI
aws s3 mb s3://globalbank-kyc-documents
aws s3api put-bucket-encryption --bucket globalbank-kyc-documents --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'
```

### **Step 2: Install Dependencies**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

### **Step 3: Create Upload API**
```typescript
// src/app/api/upload/kyc-document/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}/${Date.now()}.${fileExtension}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      Metadata: {
        userId,
        documentType,
        originalName: file.name,
      },
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Save to database
    const document = await prisma.kycDocument.create({
      data: {
        userId,
        documentType,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      document,
      fileUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
```

### **Step 4: Environment Variables**
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=globalbank-kyc-documents

# Optional: CloudFront CDN
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

## 💰 **Cost Comparison**

| Service | Storage (100GB) | Bandwidth (100GB) | Total Monthly |
|---------|----------------|-------------------|---------------|
| **AWS S3** | $2.30 | $9.00 | **$11.30** |
| Cloudinary | $89.00 | Included | **$89.00** |
| Supabase | $25.00 | Included | **$25.00** |
| Google Cloud | $2.00 | $12.00 | **$14.00** |
| DigitalOcean | $5.00 | Included | **$5.00** |

## 🔒 **Security Best Practices**

### **1. File Access Control**
```typescript
// Generate signed URLs for secure access
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const getSignedFileUrl = async (fileName: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
```

### **2. File Validation**
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > maxFileSize) {
  throw new Error('File too large');
}
```

### **3. Virus Scanning**
```typescript
// Integrate with AWS Lambda for virus scanning
const scanFile = async (fileUrl: string) => {
  // Use AWS Lambda with ClamAV or similar
  const lambda = new LambdaClient({ region: process.env.AWS_REGION });
  // Implementation details...
};
```

## 🎯 **Recommendation for Your Use Case**

**For Development/Testing**: Use **Supabase Storage** (free tier)
**For Production**: Use **AWS S3** (most cost-effective)

### **Quick Start with Supabase Storage**:
```bash
# Already configured in your project
npm install @supabase/supabase-js

# Create storage bucket
# Go to Supabase Dashboard > Storage > Create bucket "kyc-documents"
```

### **Migration Path**:
1. **Phase 1**: Use Supabase Storage for development
2. **Phase 2**: Migrate to AWS S3 for production
3. **Phase 3**: Add CloudFront CDN for global performance

## 📊 **Implementation Timeline**

- **Week 1**: Set up Supabase Storage (free)
- **Week 2**: Implement upload/download functionality
- **Week 3**: Add file validation and security
- **Week 4**: Test with real documents
- **Month 2**: Migrate to AWS S3 for production

---

**🏆 Recommendation: Start with Supabase Storage (free) and migrate to AWS S3 for production.** 