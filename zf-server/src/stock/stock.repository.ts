import {Repository} from 'typeorm';
import {Stock} from './stock.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Injectable} from '@nestjs/common';

@Injectable()
export class StockRepository extends Repository<Stock> {
  constructor(
    @InjectRepository(Stock)
      repo: Repository<Stock>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}


