import { S3Client } from "@aws-sdk/client-s3"

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ENDPOINT_URL, REGION } from '$env/static/private'

export const s3 = new S3Client({
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  endpoint: ENDPOINT_URL,
  region: REGION,
})
