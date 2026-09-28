import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MachineTemplateValidationService } from './machine-template-validation.service';
import { CreateMachineTemplateDto } from './dto/create-machine-template.dto';

@Controller('api/admin/machine-templates')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'INSTRUCTOR')
export class AdminMachineTemplatesController {
  constructor(
    private readonly validationService: MachineTemplateValidationService,
  ) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: string) {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    
    // সেফ পেজিনেশন এবং ফিল্টারিং লজিক
    return {
      items: [],
      page: pageNum,
      limit: limitNum,
      total: 0,
    };
  }

  @Post()
  async create(@Body() createDto: CreateMachineTemplateDto) {
    // ডাটাবেজে টেমপ্লেট সেভ করার লজিক
    return {
      message: 'Machine template created successfully as DRAFT',
      data: createDto,
    };
  }

  @Post(':id/validate')
  async validateTemplate(@Param('id') id: string) {
    const mockTemplate = { id, image: 'cyberlab/web-vuln', imageTag: 'v1.0', cpuLimit: 1, memoryLimit: 512, status: 'READY' };
    const result = this.validationService.validateTemplateForProvisioning(mockTemplate);

    return {
      templateId: id,
      ...result,
    };
  }
}
