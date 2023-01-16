import {Module} from '@nestjs/common';
import {ScreenTypeController} from './screen-type.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ScreenType} from './screen-type.entity';
import {ScreenTypeService} from './screenType.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScreenType]),
  ],
  providers: [
    ScreenTypeService,
  ],
  controllers: [
    ScreenTypeController,
  ],
})
export class ScreenTypeModule {
}
