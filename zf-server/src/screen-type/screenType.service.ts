import {Inject, Injectable} from '@nestjs/common';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';
import {InjectRepository} from '@nestjs/typeorm';
import {ScreenType} from './screen-type.entity';
import {Repository} from 'typeorm';

@Injectable()
export class ScreenTypeService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectRepository(ScreenType) private readonly repo: Repository<ScreenType>,
  ) {
    super(logger);
  }

  async findAll(): Promise<ScreenType[]> {
    return this.repo.find({order: {name: 'ASC'}});
  }

  async import(dto: any): Promise<ScreenType> {

    if (!dto.name) {
      this.logAndThrowException('57391978: cannot load a Screen Type without a name.');
    }

    let candidate: ScreenType;
    candidate = await this.repo.findOne({where: {name: dto.name}});
    if (!candidate) {
      candidate = new ScreenType();
      candidate.name = dto.name;
    }
    if (dto.description) candidate.description = dto.description;
    return this.repo.save(candidate);
  }

}
