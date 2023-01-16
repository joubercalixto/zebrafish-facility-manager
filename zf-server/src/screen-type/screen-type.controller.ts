import {Body, ClassSerializerInterceptor, Controller, Get, Post, UseGuards, UseInterceptors} from '@nestjs/common';
import {ScreenType} from './screen-type.entity';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {Role} from '../guards/role.decorator';
import {USER_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {ScreenTypeService} from './screenType.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('screen-type')
export class ScreenTypeController {
  constructor(
    private readonly service: ScreenTypeService,
  ) {
  }

  @Get()
  async findFiltered(): Promise<ScreenType[]> {
    return await this.service.findAll();
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('import')
  async import(@Body() dto: ScreenType): Promise<ScreenType> {
    return await this.service.import(dto);
  }
}
