import {Module} from '@nestjs/common';
import {ZfinService} from './zfin.service';
import {ZfinController} from './zfin.controller';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ZfinController],
  providers: [ZfinService],
  exports: [ZfinService],
})
export class ZfinModule {
}
