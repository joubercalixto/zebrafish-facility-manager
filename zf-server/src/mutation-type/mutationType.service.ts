import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MutationTypeRepository} from './mutation-type.repository';
import {MutationType} from './mutation-type.entity';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';

@Injectable()
export class MutationTypeService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectRepository(MutationTypeRepository) private readonly repo: MutationTypeRepository,
  ) {
    super(logger);
  }

  async import(dto: any): Promise<MutationType> {

    if (!dto.name) {
      this.logAndThrowException('57661978: cannot load a Mutation Type without a name.')
    }

    let candidate: MutationType;
    candidate = await this.repo.findOne({where: {name: dto.name}});
    if (!candidate) {
      candidate = new MutationType();
      candidate.name = dto.name;
    }
    if (dto.abbrv) candidate.abbrv = dto.abbrv;
    if (dto.description) candidate.description = dto.description;
    return this.repo.save(candidate);
  }

}
