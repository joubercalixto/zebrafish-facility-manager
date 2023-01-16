import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Stock2tankService} from './stock2tank.service';
import {Stock2tankController} from './stock2tank.controller';
import {Stock2tank} from './stock-to-tank.entity';
import {Stock2tankRepository} from './stock2tank.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock2tank]),
  ],
  providers: [
    Stock2tankService,
    Stock2tankRepository,
  ],
  controllers: [
    Stock2tankController,
  ],
  exports: [
    Stock2tankService,
  ],
})
export class Stock2tankModule {}
