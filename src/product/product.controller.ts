import { ProductService } from './product.service';
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createProducts(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<boolean> {
    if (!file) throw new BadRequestException('No file uploaded');
    return await this.productService.createProducts(file.buffer);
  }
}
