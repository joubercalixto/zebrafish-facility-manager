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
  UseInterceptors
} from '@nestjs/common';
import {Stock} from './stock.entity';
import {StockService} from './stock.service';
import {StockFilter} from './stock-filter';
import {plainToClass} from 'class-transformer';
import {JwtAuthGuard} from '../guards/jwt-auth.guard';
import {ADMIN_ROLE, USER_ROLE} from '../common/auth/zf-roles';
import {RoleGuard} from '../guards/role-guard.service';
import {Role} from '../guards/role.decorator';
import {StockImportDto} from './stock-import-dto';
import {LineageImportDto} from './lineage-import-dto';
import {MarkerImportDto} from './marker-import-dto';

// ToDo several of these go straight to the repo bypassing the service. Should fix - low priority.
// The following interceptor converts classes to plain objects for all responses.
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(
    private readonly service: StockService,
  ) {
  }

  @Get('nextName')
  async getNextStockName(): Promise<any> {
    return await this.service.getNextStockName();
  }

  // Get stocks for export
  @Get('export')
  async getStocksForExport(): Promise<any[]> {
    return await this.service.getStocksForExport();
  }

  // Get a stock with no relationships fetched.
  @Get('brief/:id')
  async getById(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
    return await this.service.getById(id);
  }

  @Role(ADMIN_ROLE)
  @UseGuards(RoleGuard)
  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
    return await this.service.validateAndRemove(id);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('import')
  async import(@Body() dto: StockImportDto): Promise<Stock> {
    return await this.service.import(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('lineage/import')
  async importLineage(@Body() dto: LineageImportDto): Promise<boolean> {
    return await this.service.lineageImport(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('markers/import')
  async importMarkers(@Body() dto: MarkerImportDto): Promise<Stock> {
    return await this.service.markerImport(dto);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post()
  async createStock(@Body() newObj: Stock): Promise<any> {
    return await this.service.validateAndCreate(newObj, false);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Post('substock')
  async createSubStock(@Body() newObj: Stock): Promise<any> {
    return await this.service.validateAndCreate(newObj, true);
  }

  @Get()
  async findFiltered(@Query() params): Promise<any[]> {
    const filter: StockFilter = plainToClass(StockFilter, params);
    return await this.service.findFiltered(filter);
  }

  @Get('tankWalk')
  async getTankWalk(@Query() params): Promise<any[]> {
    const filter: StockFilter = plainToClass(StockFilter, params);
    return await this.service.getStocksForTankWalk(filter);
  }

  @Get('report')
  async getReport(@Query() params): Promise<any[]> {
    return await this.service.getStocksForReport(params);
  }

  @Get('autoCompleteOptions')
  async getAutoCompleteOptions(): Promise<any> {
    return await this.service.getAutoCompleteOptions();
  }

  @Get('name/:name')
  async getByName(@Param() params): Promise<Stock> {
    return await this.service.findByName(params.name);
  }

  @Role(USER_ROLE)
  @UseGuards(RoleGuard)
  @Put()
  async update(@Body() dto: Stock): Promise<any> {
    return await this.service.validateAndUpdate(dto);
  }

  // Get a stock with all relations exploded
  @Get(':id')
  async getFullById(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
    return await this.service.getFullById(id);
  }

  // Get a reasonably comprehensive view of a stock without as much as the full stockWithRelations
  // Hint: this is used by the Tank Walker for details about a single stock on the walk.
  @Get('medium/:id')
  async getMediumById(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
    return await this.service.getMediumById(id);
  }
}
