import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolEntity } from './school.entity';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolEntity])],
  providers: [SchoolsService],
  controllers: [SchoolsController],
  exports: [SchoolsService],
})
export class SchoolsModule {}
