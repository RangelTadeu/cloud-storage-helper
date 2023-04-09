import { Logger, Module, Scope } from '@nestjs/common';
import { S3Storage } from './implementations/s3-aws.storage';
import { S3Client } from '@aws-sdk/client-s3';

const storage = {
  provide: 'STORAGE',
  scope: Scope.DEFAULT,
  useFactory: () => {
    const s3Client = new S3Client({
      region: process.env.AWS_S3_REGION ?? 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
      forcePathStyle: true,
    });

    const s3Storage = new S3Storage(
      s3Client,
      { bucket: process.env.AWS_S3_BUCKET || 'test_bucket' },
      new Logger(),
    );

    return s3Storage;
  },
};

@Module({
  providers: [storage],
  exports: [storage],
})
export class StorageModule {}
