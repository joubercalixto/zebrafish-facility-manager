import {Repository} from 'typeorm';
import {User} from './user.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Injectable} from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {

  constructor(
    @InjectRepository(User)
      repo: Repository<User>
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

}
