export interface IStorage {
  getPresignUrl(params: IGetPresignUrlParams): Promise<string>;
  startMultiPartUpload(params: any): Promise<string>;
  completeMultiPartUpload(params: any): Promise<string>;
  get(params: IGetFile): Promise<ReadableStream | undefined | string>;
  upload(params: IUpload): Promise<string>;
  uploadPart(params: any);
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

export interface ICompleteMultiPartUploadParams extends IBaseParams {
  uploadId: string;
  uploadedParts: any[];
}

export interface IUploadPart extends IBaseParams {
  uploadId?: string;
  partNumber?: number;
  data: any;
}

export interface IUpload extends IBaseParams {
  data: any;
}

export type IGetFile = IBaseParams;
