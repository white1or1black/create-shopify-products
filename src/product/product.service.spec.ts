/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import {
  ProductService,
  VariantRow,
  ProductType,
  VariantType,
  ImageType,
  Option,
} from './product.service';

const variantRows: VariantRow[] = [
  {
    // 0
    handle: 'chain-bracelet',
    title: '7 Shakra Bracelet',
    body_html: '7 chakra bracelet, in blue or black.',
    vendor: 'Company 123',
    product_type: 'Bracelet',
    tags: 'Beads',
    option1Name: 'Color',
    option1: 'Blue',
    option2Name: undefined,
    option2: undefined,
    option3Name: undefined,
    option3: undefined,
    price: '42.99',
    compare_at_price: '44.99',
    image: {
      src: 'https://bxxxxdn.com/photos/7sxxxxlet_925x.jpg',
      position: 1,
    },
  },
  {
    // 1
    handle: 'chain-bracelet',
    title: undefined,
    body_html: undefined,
    vendor: undefined,
    product_type: undefined,
    tags: undefined,
    option1Name: undefined,
    option1: 'Black',
    option2Name: undefined,
    option2: undefined,
    option3Name: undefined,
    option3: undefined,
    price: '42.99',
    compare_at_price: '44.99',
    image: {
      src: 'https://buxxxxfycdn.com/photos/nasxxxxlet_925x.jpg',
      position: 2,
    },
  },
  {
    // 2
    handle: 'leather-anchor',
    title: 'Anchor Bracelet Mens',
    body_html: 'Black leather bracelet with gold or silver anchor for men.',
    vendor: 'Company 123',
    product_type: 'Bracelet',
    tags: 'Anchor, Gold, Leather, Silver',
    option1Name: 'Color',
    option1: 'Gold',
    option2Name: undefined,
    option2: undefined,
    option3Name: undefined,
    option3: undefined,
    price: '69.99',
    compare_at_price: '85',
    image: {
      src: 'https://busxxxxdn.com/photos/ancsxxxxens_925x.jpg',
      position: 1,
    },
  },
  {
    // 3
    handle: 'leather-anchor',
    title: undefined,
    body_html: undefined,
    vendor: undefined,
    product_type: undefined,
    tags: undefined,
    option1Name: undefined,
    option1: 'Silver',
    option2Name: undefined,
    option2: undefined,
    option3Name: undefined,
    option3: undefined,
    price: '55',
    compare_at_price: '85',
    image: {
      src: 'https://burssxxxdn.com/photos/ancsxxxxen_925x.jpg',
      position: 2,
    },
  },
  {
    // 4
    handle: 'leather-anchor',
    title: undefined,
    body_html: undefined,
    vendor: undefined,
    product_type: undefined,
    tags: undefined,
    option1Name: undefined,
    option1: undefined,
    option2Name: undefined,
    option2: undefined,
    option3Name: undefined,
    option3: undefined,
    price: undefined,
    compare_at_price: undefined,
    image: {
      src: 'https://bsxxxxxcdn.com/photos/leatsxxxxx-men_925x.jpg',
      position: 3,
    },
  },
];

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [HttpService, ProductService],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: () => null,
        post: () => null,
      })
      .compile();

    productService = app.get<ProductService>(ProductService);
  });

  describe('addProduct', () => {
    it('Add one product map size from 0 to 1.', () => {
      const productMap = new Map<string, ProductType>();
      expect(productMap.size).toBe(0);
      productService.addProduct(variantRows[0], productMap);
      expect(productMap.size).toBe(1);
    });
    it('Add two products with same handle, the size of map should be 1.', () => {
      const productMap = new Map<string, ProductType>();
      expect(productMap.size).toBe(0);
      productService.addProduct(variantRows[0], productMap);
      productService.addProduct(variantRows[1], productMap);
      expect(productMap.size).toBe(1);
    });
    it('Add two products with different handle, the size of map should be 2.', () => {
      const productMap = new Map<string, ProductType>();
      expect(productMap.size).toBe(0);
      productService.addProduct(variantRows[0], productMap);
      productService.addProduct(variantRows[2], productMap);
      expect(productMap.size).toBe(2);
    });
  });

  describe('addVariant', () => {
    it('Add one variant the size of map should be 1.', () => {
      const variantRow = variantRows[0];
      const variantMap = new Map<string, VariantType[]>();
      productService.addVariant(variantRow, variantMap);
      expect(variantMap.size).toBe(1);
    });
    it('Add two variant with two same handle the size of map should be 1 but the size of value is 2.', () => {
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[1];
      const variantMap = new Map<string, VariantType[]>();
      productService.addVariant(variantRow, variantMap);
      productService.addVariant(variantRow2, variantMap);
      expect(variantMap.size).toBe(1);
      expect(variantMap.get(variantRow.handle).length).toBe(2);
    });
    it('Add one variant with no option1 value the size of map should be 1 but the size of value should be 0.', () => {
      const variantRow = variantRows[4];
      const variantMap = new Map<string, VariantType[]>();
      productService.addVariant(variantRow, variantMap);
      expect(variantMap.size).toBe(1);
      expect(variantMap.get(variantRow.handle).length).toBe(0);
    });
  });

  describe('addImage', () => {
    it('Add one image the size of map should be 1 and the value size should be 1', () => {
      const variantRow = variantRows[0];
      const imageMap = new Map<string, ImageType[]>();
      productService.addImage(variantRow, imageMap);
      expect(imageMap.size).toBe(1);
      expect(imageMap.get(variantRow.handle).length).toBe(1);
    });
    it('Add two images with same handle the size of map should 1 and the value size should be 2.', () => {
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[1];
      const imageMap = new Map<string, ImageType[]>();
      productService.addImage(variantRow, imageMap);
      productService.addImage(variantRow2, imageMap);
      expect(imageMap.size).toBe(1);
      expect(imageMap.get(variantRow.handle).length).toBe(2);
    });
    it('Add two images with different handle the size of map should 2.', () => {
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[2];
      const imageMap = new Map<string, ImageType[]>();
      productService.addImage(variantRow, imageMap);
      productService.addImage(variantRow2, imageMap);
      expect(imageMap.size).toBe(2);
    });
  });

  describe('setOption', () => {
    it('Set option with option name valid, option value valid, the size of option should be 1', () => {
      const options: Option[] = [];
      const variantRow = variantRows[0];
      productService.setOption(
        options,
        variantRow.option1Name,
        variantRow.option1,
        0,
      );
      expect(options.length).toBe(1);
      expect(options[0].values.length).toBe(1);
      expect(options[0].name).toBe(variantRow.option1Name);
    });
    it(`Set two option:
    first:  option name valid, option value valid
    second: option name valid, option value valid
    the size of option should be 1`, () => {
      const options: Option[] = [];
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[1];
      productService.setOption(
        options,
        variantRow.option1Name,
        variantRow.option1,
        0,
      );
      productService.setOption(
        options,
        variantRow2.option1Name,
        variantRow2.option1,
        0,
      );
      expect(options.length).toBe(1);
      expect(options[0].values.length).toBe(2);
    });
  });

  describe('addOptions', () => {
    it('Add variant with option1name valid,option1(value) valid,option2name empty,option2(value) empty, option3name empty, option3(value) empty, the size of map is 1, and the size of value is 1, and the size of option 1 values is 1.', () => {
      const variantRow = variantRows[0];
      const optionMap = new Map<string, Option[]>();
      productService.addOptions(variantRow, optionMap);
      expect(optionMap.size).toBe(1);
      expect(optionMap.get(variantRow.handle).length).toBe(1);
      expect(optionMap.get(variantRow.handle)[0].values.length).toBe(1);
    });
    it('Add two variant with different handle and option1name valid,option1(value) valid,option2name empty,option2(value) empty, option3name empty, option3(value) empty,, the size of map is 2, and the size of value is 1, and the size of option 1 values is 1.', () => {
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[2];
      const optionMap = new Map<string, Option[]>();
      productService.addOptions(variantRow, optionMap);
      productService.addOptions(variantRow2, optionMap);
      expect(optionMap.size).toBe(2);
      expect(optionMap.get(variantRow.handle).length).toBe(1);
      expect(optionMap.get(variantRow.handle)[0].values.length).toBe(1);
      expect(optionMap.get(variantRow2.handle).length).toBe(1);
      expect(optionMap.get(variantRow2.handle)[0].values.length).toBe(1);
    });
    it(`Add variant with
    first row: option1name valid,option1(value) valid, option2name empty, option2(value) empty, option3name empty, option3(value) empty,
    second row: option1name empty,option1(value) valid, option2name empty,option2(value) empty, option3name empty, option3(value) empty,
    the size of map is 1, and the size of value is 1, and the size of option values is 2`, () => {
      const variantRow = variantRows[0];
      const variantRow2 = variantRows[1];
      const optionMap = new Map<string, Option[]>();
      productService.addOptions(variantRow, optionMap);
      productService.addOptions(variantRow2, optionMap);
      expect(optionMap.size).toBe(1);
      expect(optionMap.get(variantRow.handle).length).toBe(1);
      expect(optionMap.get(variantRow.handle)[0].values.length).toBe(2);
    });
  });

  describe('fullFillProduct', () => {
    it('Add variant(1),image(1),option(1), the size of each variable in product is 1.', () => {
      const variantRow = variantRows[0];
      const productMap = new Map<string, ProductType>();
      productService.addProduct(variantRow, productMap);

      const variantMap = new Map<string, VariantType[]>();
      productService.addVariant(variantRow, variantMap);

      const imageMap = new Map<string, ImageType[]>();
      productService.addImage(variantRow, imageMap);

      const optionMap = new Map<string, Option[]>();
      productService.addOptions(variantRow, optionMap);

      productService.fullFillProduct(
        productMap,
        variantMap,
        imageMap,
        optionMap,
      );

      expect(productMap.size).toBe(1);
      expect(productMap.get(variantRow.handle).variants).toBeDefined();
      expect(productMap.get(variantRow.handle).variants.length).toBe(1);

      expect(productMap.get(variantRow.handle).images).toBeDefined();
      expect(productMap.get(variantRow.handle).images.length).toBe(1);

      expect(productMap.get(variantRow.handle).options).toBeDefined();
      expect(productMap.get(variantRow.handle).options.length).toBe(1);
    });
  });

  describe('addProductToTaskQueue', () => {
    it('Add one product, the size of task queue is 1.', () => {
      const productMap = new Map<string, ProductType>();
      productService.addProduct(variantRows[0], productMap);
      productService.addProductToTaskQueue(productMap);
      // @ts-ignore
      expect(productService.productTaskQueue).toBeDefined();
      // @ts-ignore
      expect(productService.productTaskQueue.length).toBe(1);
    });
  });

  describe('processTaskQueue', () => {
    it('', async () => {
      const waitForTaskDown = () => {
        return new Promise((resolve) => {
          const timer = setInterval(() => {
            // @ts-ignore
            if (!productService.taskTimer) {
              clearInterval(timer);
              return resolve(true);
            }
          }, 1000);
        });
      };

      jest
        .spyOn(productService, 'shopifyCreateProduct')
        .mockImplementation(() => Promise.resolve());
      const productMap = new Map<string, ProductType>();
      productService.addProduct(variantRows[0], productMap);
      productService.addProductToTaskQueue(productMap);

      // @ts-ignore
      expect(productService.productTaskQueue.length).toBe(1);
      productService.processTaskQueue();
      await waitForTaskDown();
      // @ts-ignore
      expect(productService.productTaskQueue.length).toBe(0);
    });
  });
});
