import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ProductService } from '../src/product/product.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProductService)
      .useValue({
        createProducts: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  it('/product/create with no params (POST)', () => {
    return request(app.getHttpServer()).post('/product/create').expect(400);
  });
  it('/product/create with params file (POST)', () => {
    return request(app.getHttpServer())
      .post('/product/create')
      .attach('file', path.join(__dirname, `../package.json`))
      .set('Content-Type', 'multipart/form-data')
      .expect(201)
      .expect({
        code: 1,
        data: true,
        message: 'success',
      });
  });
});
