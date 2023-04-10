export interface IStorage {
  getPresignUrl(params: IGetPresignUrlParams): Promise<string>;
  startMultiPartUpload(params: IStartMultiPartUploadParams): Promise<string>;
  completeMultiPartUpload(
    params: ICompleteMultiPartUploadParams,
  ): Promise<string>;
  get(params: GetFile): Promise<ReadableStream | undefined | string>;
  upload(params: IUpload): Promise<string>;
  uploadPart(params: IUploadPart);
}

interface IBaseParams {
  fileName: string;
  repository?: string;
  contentType?: string;
}

export interface IGetPresignUrlParams extends IBaseParams {
  expiration?: number;
  uploadId?: string;
  partNumber?: number;
}

export type IStartMultiPartUploadParams = IBaseParams;

export type Part = {
  partNumber: number;
  tag: string;
};

export interface ICompleteMultiPartUploadParams extends IBaseParams {
  uploadId: string;
  uploadedParts: Part[];
}

export interface IUploadPart extends IBaseParams {
  uploadId?: string;
  partNumber?: number;
  data: any;
}

export interface IUpload extends IBaseParams {
  data: any;
}

export type GetFile = IBaseParams;
