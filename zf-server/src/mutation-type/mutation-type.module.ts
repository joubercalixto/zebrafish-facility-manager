import {Module} from '@nestjs/common';
import {MutationTypeController} from './mutation-type.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MutationType} from './mutation-type.entity';
import {MutationTypeService} from './mutationType.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MutationType]),
  ],
  providers: [
    MutationTypeService,
  ],
  controllers: [
    MutationTypeController
  ],
})
export class MutationTypeModule {
}
