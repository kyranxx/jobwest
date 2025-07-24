import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  const testFileName = `test-upload-${Date.now()}.txt`;
  const testFileContent = 'This is a test file.';
  const bucketName = 'avatars';

  console.log('--- Starting Supabase Storage Test ---');

  // 1. Upload a test file
  console.log(`\n1. Uploading '${testFileName}' to bucket '${bucketName}'...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testFileName, testFileContent, {
      contentType: 'text/plain',
      upsert: true,
    });

  if (uploadError) {
    console.error('   Upload failed:', uploadError.message);
    console.log('\n--- Test Finished ---');
    return;
  }
  console.log('   Upload successful.');
  console.log('   Upload data:', uploadData);

  // 2. Get Public URL
  console.log(`\n2. Getting public URL for '${testFileName}'...`);
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(testFileName);

  if (publicUrlData) {
    console.log('   Public URL:', publicUrlData.publicUrl);
  } else {
    console.error('   Failed to get public URL.');
  }

  // 3. Get Signed URL
  console.log(`\n3. Getting signed URL for '${testFileName}' (expires in 60s)...`);
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(testFileName, 60);

  if (signedUrlError) {
    console.error('   Failed to create signed URL:', signedUrlError.message);
  } else {
    console.log('   Signed URL created successfully.');
    console.log('   Signed URL:', signedUrlData.signedUrl);
  }

  // 4. Clean up the test file
  console.log(`\n4. Cleaning up by removing '${testFileName}'...`);
  const { error: removeError } = await supabase.storage
    .from(bucketName)
    .remove([testFileName]);

  if (removeError) {
    console.error('   Failed to remove test file:', removeError.message);
  } else {
    console.log('   Test file removed successfully.');
  }

  console.log('\n--- Test Finished ---');
}

runTest();
