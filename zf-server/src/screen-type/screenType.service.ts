import {Inject, Injectable} from '@nestjs/common';
import {GenericService} from '../Generics/generic-service';
import {Logger} from 'winston';
import {InjectRepository} from '@nestjs/typeorm';
import {ScreenTypeRepository} from './screen-type.repository';
import {ScreenType} from './screen-type.entity';

@Injectable()
export class ScreenTypeService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    @InjectRepository(ScreenTypeRepository) private readonly repo: ScreenTypeRepository,
  ) {
    super(logger);
  }

  async import(dto: any): Promise<ScreenType> {

    if (!dto.name) {
      this.logAndThrowException('57391978: cannot load a Screen Type without a name.')
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
