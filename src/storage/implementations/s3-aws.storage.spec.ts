import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Storage } from './s3-aws.storage';
import { mockClient } from 'aws-sdk-client-mock';
import { Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';

describe('s3 storage', () => {
  const client = new S3Client({});
  let storage: S3Storage;

  const s3 = mockClient(S3Client);

  const streamToString = async (stream) => {
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString('utf-8');
  };

  beforeEach(() => {
    s3.reset();
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'STORAGE',
          useFactory: () =>
            new S3Storage(client, { bucket: 'test_bucket' }, new Logger()),
        },
      ],
    }).compile();

    storage = module.get<S3Storage>('STORAGE');
  });

  it('should get an object', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null);

    const sdkStream = sdkStreamMixin(stream);

    s3.on(GetObjectCommand, {
      Bucket: 'test_bucket',
      Key: 'test.txt',
    }).resolves({ Body: sdkStream });

    const res = await storage.get({ fileName: 'test.txt' });

    const result = await streamToString(res);

    expect(result).toBe('hello world');
  });

  it('should return undefined when the object not exists', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null);

    const sdkStream = sdkStreamMixin(stream);

    s3.on(GetObjectCommand, {
      Bucket: 'test_bucket',
      Key: 'test3.txt',
    }).resolves({ Body: sdkStream });

    const res = await storage.get({ fileName: 'test.txt' });

    expect(res).toEqual(undefined);
  });

  it('should upload an object', async () => {
    s3.on(PutObjectCommand).resolves({ ETag: '1' });

    const res = await storage.upload({ fileName: 'test.txt', data: 'hello' });

    expect(res).toEqual('1');
  });

  it('should start a multipart upload and return de uploadId', async () => {
    s3.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' });

    const res = await storage.startMultiPartUpload({ fileName: 'teste.txt' });

    expect(res).toEqual('1');
  });

  it('should upload a part of an multipart upload', async () => {
    s3.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' });
    s3.on(UploadPartCommand).resolves({ ETag: '1' });

    s3.on(CompleteMultipartUploadCommand).resolves({});

    const uploadId: string = await storage.startMultiPartUpload({
      fileName: 'test.txt',
    });

    const res = await storage.uploadPart({
      fileName: 'test.txt',
      uploadId,
      partNumber: 1,
      data: '234351312315132123',
    });

    await storage.completeMultiPartUpload({
      fileName: 'test.txt',
      uploadId,
      uploadedParts: [{ ETag: '1', PartNumber: 1 }],
    });

    expect(res).toEqual({ partNumber: 1, tag: '1' });
  });
});
