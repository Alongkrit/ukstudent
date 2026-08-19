import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';

// REQ-1: GET /services; feeds the public + in-app Service Selection grid.
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll() {
    return this.servicesService.findAllActive();
  }
}
