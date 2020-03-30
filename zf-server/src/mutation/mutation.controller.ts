import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Mutation } from './mutation.entity';
import { MutationService } from './mutation.service';
import { plainToClass } from 'class-transformer';
import { MutationFilter } from './mutation.filter';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('mutation')
export class MutationController {
  constructor(
    private readonly mutationService: MutationService,
  ) {}

  @Get()
  async findFiltered(@Query() params): Promise<Mutation[]> {
    const filter: MutationFilter = plainToClass(MutationFilter, params);
    return await this.mutationService.findFiltered(filter);
  }

  @Get('stringFiltered/:filterString')
  async filterByString(@Param('filterString')  filterString: string): Promise<Mutation[]> {
    return await this.mutationService.filterByString(filterString);
  }

  @Get('autoCompleteOptions')
  async  getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    return await this.mutationService.getAutoCompleteOptions();
  }

  @Get('nextName')
  async nextNumber(): Promise<any> {
    return await this.mutationService.getNextName();
  }

  @Get(':id')
  async findById(@Param('id', new ParseIntPipe())  id: number): Promise<Mutation> {
    return await this.mutationService.findById(id);
  }

  @Post()
  async create(@Body() newObj: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndCreate(newObj);
  }

  @Post('next')
  async createNext(@Body() newObj: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndCreateOwned(newObj);
  }

  @Put()
  async update(@Body() dto: Mutation): Promise<Mutation> {
    return await this.mutationService.validateAndUpdate(dto);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe())  id: number): Promise<Mutation> {
    return await this.mutationService.validateAndRemove(id);
  }
}
