# Create Storage Bucket for Edge Function

## Bucket Details
- **Name**: `make-2516be19-profile-photos`
- **Public**: No (Private)
- **File Size Limit**: 5MB (5242880 bytes)
- **Allowed Types**: Images (JPEG, PNG, WebP)

## Method 1: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/wmlklvlnxftedtylgxsc/storage/buckets
2. Click **"New bucket"** button
3. Fill in the details:
   - **Name**: `make-2516be19-profile-photos`
   - **Public bucket**: Unchecked (keep it private)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp` (optional)
4. Click **"Create bucket"**

## Method 2: Automatic Creation

The Edge Function will automatically try to create the bucket on startup. However, it's better to create it manually to ensure proper permissions.

## Verify Bucket Exists

After creating, verify it exists:
1. Go to Storage → Buckets
2. You should see `make-2516be19-profile-photos` in the list

## Set Bucket Policies (if needed)

If you encounter permission errors, you may need to set bucket policies:
1. Go to Storage → Policies
2. Select the `make-2516be19-profile-photos` bucket
3. Add policies for authenticated users to upload/read files

## Test Photo Upload

After creating the bucket, try uploading a photo in the app. It should work now!

