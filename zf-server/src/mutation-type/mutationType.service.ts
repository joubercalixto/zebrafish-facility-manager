import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {MutationType} from './mutation-type.entity';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';
import {Repository} from 'typeorm';

@Injectable()
export class MutationTypeService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectRepository(MutationType) private readonly repo: Repository<MutationType>,
  ) {
    super(logger);
  }

  async findAll(): Promise<MutationType[]> {
    return this.repo.find({order: {name: 'ASC'}});
  }

  async import(dto: any): Promise<MutationType> {

    if (!dto.name) {
      this.logAndThrowException('57661978: cannot load a Mutation Type without a name.');
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
