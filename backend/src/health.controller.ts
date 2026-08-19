import { Controller, Get } from '@nestjs/common';

// Polled by the hosting platform for zero-downtime rolling deploys
// (Technical Architecture Document, Section 7).
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
