import {
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandInput,
  CreateMultipartUploadCommand,
  CreateMultipartUploadCommandInput,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  UploadPartCommand,
  UploadPartCommandInput,
} from '@aws-sdk/client-s3';
import {
  ICompleteMultiPartUploadParams,
  IGetFile,
  IGetPresignUrlParams,
  IStartMultiPartUploadParams,
  IStorage,
  IUpload,
  IUploadPart,
} from '../interfaces/storage.interface';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Logger } from '@nestjs/common';

export interface IS3StorageConfig {
  bucket: string;
}

const AN_HOUR = 3600;

export class S3Storage implements IStorage {
  constructor(
    private readonly client: S3Client,
    private readonly config: IS3StorageConfig,
    @Inject()
    private readonly logger: Logger,
  ) {}

  async getPresignUrl(params: IGetPresignUrlParams): Promise<string> {
    const {
      partNumber: PartNumber,
      uploadId: UploadId,
      fileName: Key,
      repository,
      expiration,
    } = params;

    const s3Params: any = {
      Bucket: repository ?? this.config.bucket,
      Key,
    };

    if (PartNumber != null && UploadId != null) {
      s3Params.PartNumber = PartNumber;
      s3Params.UploadId = UploadId;
    }

    const presignedUrl = await getSignedUrl(this.client, s3Params, {
      expiresIn: expiration || AN_HOUR,
    });

    return presignedUrl;
  }

  async startMultiPartUpload(
    params: IStartMultiPartUploadParams,
  ): Promise<string> {
    const { repository, fileName: Key, contentType } = params;

    const s3Params: CreateMultipartUploadCommandInput = {
      Bucket: repository ?? this.config.bucket,
      Key,
      ContentType: contentType ?? 'multipart/form-data',
    };

    const createMultipartUploadCommand = new CreateMultipartUploadCommand(
      s3Params,
    );
    const { UploadId } = await this.client.send(createMultipartUploadCommand);

    return UploadId;
  }

  async completeMultiPartUpload(
    params: ICompleteMultiPartUploadParams,
  ): Promise<string> {
    const {
      repository,
      fileName: Key,
      uploadId: UploadId,
      uploadedParts: Parts,
    } = params;

    const s3Params: CompleteMultipartUploadCommandInput = {
      Bucket: repository ?? this.config.bucket,
      Key,
      UploadId,
      MultipartUpload: {
        Parts,
      },
    };

    const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(
      s3Params,
    );

    const { ETag } = await this.client.send(completeMultipartUploadCommand);

    return ETag;
  }

  async get(params: IGetFile): Promise<string | ReadableStream<any>> {
    const { repository, fileName: Key } = params;

    try {
      const command = new GetObjectCommand({
        Bucket: repository ?? this.config.bucket,
        Key,
      });

      const res = await this.client.send(command);
      const stream = res.Body?.transformToWebStream();

      return stream;
    } catch (e) {
      this.logger.log(`Not founded storage key: ${Key}`);
      return undefined;
    }
  }

  async upload(params: IUpload): Promise<string> {
    const { repository, fileName: Key, data } = params;

    const s3Params: PutObjectCommandInput = {
      Bucket: repository ?? this.config.bucket,
      Key,
      Body: data,
    };
    const command = new PutObjectCommand(s3Params);
    const { ETag } = await this.client.send(command);

    return ETag;
  }

  async uploadPart(params: IUploadPart) {
    const {
      repository,
      fileName: Key,
      uploadId: UploadId,
      partNumber: PartNumber,
      data,
    } = params;

    const s3Params: UploadPartCommandInput = {
      Bucket: repository ?? this.config.bucket,
      Key,
      UploadId,
      PartNumber,
      Body: data,
    };

    const uploadPartCommand1 = new UploadPartCommand(s3Params);
    const { ETag } = await this.client.send(uploadPartCommand1);
    return { tag: ETag, partNumber: PartNumber };
  }
}
