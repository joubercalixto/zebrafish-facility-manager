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
import { Transgene } from './transgene.entity';
import { TransgeneService } from './transgene.service';
import { plainToClass } from 'class-transformer';
import { TransgeneFilter } from './transgene.filter';
import { AuthGuard } from '@nestjs/passport';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('transgene')
export class TransgeneController {
  constructor(
    private readonly transgeneService: TransgeneService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findFiltered(@Query() params): Promise<Transgene[]> {
    const filter: TransgeneFilter = plainToClass(TransgeneFilter, params);
    return await this.transgeneService.findFiltered(filter);
  }

  @Get('autoCompleteOptions')
  async  getAutoCompleteOptions(): Promise<any> {
    return await this.transgeneService.getAutoCompleteOptions();
  }

  @Get('nextName')
  async nextName(): Promise<{name: string}> {
    return await this.transgeneService.getNextName();
  }

  @Get(':id')
  async findById(@Param('id', new ParseIntPipe())  id: number): Promise<Transgene> {
    return await this.transgeneService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() newObj: any): Promise<Transgene> {
    return await this.transgeneService.validateAndCreate(newObj);
  }

  @Post('next')
//  @UseGuards(AuthGuard('bearer'))
  async createNext(@Body() newObj: any): Promise<Transgene> {
    return await this.transgeneService.validateAndCreateOwned(newObj);
  }

  @Put()
//  @UseGuards(AuthGuard('bearer'))
  async update(@Body() dto: any): Promise<Transgene> {
    return await this.transgeneService.validateAndUpdate(dto);
  }

  @Delete(':id')
//  @UseGuards(AuthGuard('bearer'))
  async delete(@Param() params): Promise<Transgene> {
    return await this.transgeneService.validateAndRemove(params.id);
  }
}