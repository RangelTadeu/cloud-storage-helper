import { Body, Controller, Inject, Post } from '@nestjs/common';

import { IStorage } from './interfaces/storage.interface';
import {
  CompleteUploadDTO,
  GetUploadUrlDTO,
  StartUploadDTO,
} from './dto/storage.dto';

@Controller('storage')
export class StorageController {
  constructor(@Inject('STORAGE') private readonly storageService: IStorage) {}

  @Post('start-upload')
  async startUpload(@Body() body: StartUploadDTO) {
    return this.storageService.startMultiPartUpload(body);
  }

  @Post('get-upload-url')
  async getUploadUrl(@Body() body: GetUploadUrlDTO) {
    return this.storageService.getPresignUrl(body);
  }

  @Post('complete-upload')
  async completeUpload(@Body() body: CompleteUploadDTO) {
    return this.storageService.completeMultiPartUpload(body);
  }
}
