import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { SubcategoryRepository } from './subcategory.repository';
import { SubcategoryController } from './subcategory.controller';

@Module({
  providers: [SubcategoryService, SubcategoryRepository],
  controllers: [SubcategoryController],
})
export class SubcategoryModule {}
