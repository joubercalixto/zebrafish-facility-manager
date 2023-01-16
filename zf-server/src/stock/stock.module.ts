import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StockService} from './stock.service';
import {StockController} from './stock.controller';
import {Stock} from './stock.entity';
import {StockRepository} from './stock.repository';
import {UserModule} from '../user/user.module';
import {MutationModule} from '../mutation/mutation.module';
import {TransgeneModule} from '../transgene/transgene.module';
import {TankModule} from '../tank/tank.module';
import {Stock2tankModule} from '../stock2tank/stock2tank.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    UserModule,
    TransgeneModule,
    MutationModule,
    TankModule,
    Stock2tankModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    StockService,
    StockRepository,
  ],
  controllers: [
    StockController,
  ],
  exports: [
    TypeOrmModule,
    StockRepository,
  ]
})
export class StockModule {}
