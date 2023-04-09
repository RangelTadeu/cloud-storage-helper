import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageController } from './storage/storage.controller';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [AppController, StorageController],
  providers: [AppService, StorageModule],
})
export class AppModule {}
