import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MutationService} from './mutation.service';
import {MutationController} from './mutation.controller';
import {Mutation} from './mutation.entity';
import {MutationRepository} from './mutation.repository';
import {ZfinModule} from '../zfin/zfin.module';
import {TransgeneModule} from '../transgene/transgene.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mutation]),
    ZfinModule,
    forwardRef(() => TransgeneModule),
  ],
  providers: [
    MutationService,
    MutationRepository,
  ],
  controllers: [
    MutationController,
  ],
  exports: [
    MutationService,
    MutationRepository,
  ]
})
export class MutationModule {}
