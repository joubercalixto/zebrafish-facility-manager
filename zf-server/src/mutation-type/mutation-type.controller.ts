import {Body, ClassSerializerInterceptor, Controller, Get, Post, UseGuards, UseInterceptors} from '@nestjs/common';
import {MutationType} from './mutation-type.entity';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {Role} from '../guards/role.decorator';
import {USER_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {MutationTypeService} from './mutationType.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('mutation-type')
export class MutationTypeController {
  constructor(
    private readonly service: MutationTypeService,
  ) {
  }

  @Get()
  async findAll(): Promise<MutationType[]> {
    return await this.service.findAll();
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('import')
  async import(@Body() dto: MutationType): Promise<MutationType> {
    return await this.service.import(dto);
  }

}
