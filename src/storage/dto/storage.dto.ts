import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Part } from '../interfaces/storage.interface';

export class StartUploadDTO {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  repository?;
}

export class GetUploadUrlDTO {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  repository?;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsNumber()
  @IsNotEmpty()
  partNumber: number;
}

export class CompleteUploadDTO {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  repository?;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsOptional()
  @IsArray()
  uploadedParts: Part[];
}
