import * as Excel from 'exceljs';
import {
  Product,
  Variant,
  Image,
} from '@shopify/shopify-api/dist/rest-resources/2021-07/index.js';
import { HttpService, Injectable } from '@nestjs/common';

export type ProductType = Partial<Product>;
export type VariantType = Partial<Variant>;
export type ImageType = Partial<Image>;
export type VariantRow =
  | VariantType
  | {
      handle: string;
      title: string;
      body_html: string;
      vendor: string;
      product_type: string;
      tags: string;
      option1: string;
      option2: string;
      option3: string;
      option1Name: string;
      option2Name: string;
      option3Name: string;
      price: string;
      compare_at_price: string;
      image: { src: string; position: number };
    };

export interface Option {
  name: string;
  values: string[];
}

@Injectable()
export class ProductService {
  private shopifyUrl: string;
  private shopifyToken: string;
  private productTaskQueue: ProductType[];
  private taskTimer: NodeJS.Timeout;
  private taskNumPerTime: number;
  private taskDelay: number; // millisecond

  constructor(private readonly httpService: HttpService) {
    const { SHOP, ADMIN_ACCESS_TOKEN, HOST, HOST_SCHEME } = process.env;
    this.shopifyUrl = `${HOST_SCHEME}://${SHOP}.${HOST}/admin/api/2022-04/products.json`;
    this.shopifyToken = ADMIN_ACCESS_TOKEN;
    this.productTaskQueue = [];
    this.taskTimer = null;
    this.taskNumPerTime = 2;
    this.taskDelay = 1000; // one second
  }

  async readVariantList(buffer: Buffer): Promise<VariantRow[]> {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);

    const productSheet: Excel.Worksheet = workbook.getWorksheet(1);
    if (!productSheet) return [];

    const variantList: VariantRow[] = [];

    productSheet.eachRow({ includeEmpty: false }, (row: Excel.Row) => {
      const cells = row.values;
      variantList.push({
        handle: cells[1],
        title: cells[2],
        body_html: cells[3],
        vendor: cells[4],
        product_type: cells[5],
        tags: cells[6],
        option1Name: cells[8],
        option1: cells[9],
        option2Name: cells[10],
        option2: cells[11],
        option3Name: cells[12],
        option3: cells[13],
        price: cells[20],
        compare_at_price: cells[21],
        image: {
          src:
            cells[25] && typeof cells[25] === 'object'
              ? cells[25].text
              : cells[25],
          position: cells[26],
        },
      });
    });

    return variantList;
  }

  async createProducts(buffer: Buffer): Promise<boolean> {
    const variantList = await this.readVariantList(buffer);

    const productMap: Map<string, ProductType> = new Map();
    const variantMap: Map<string, VariantType[]> = new Map();
    const imageMap: Map<string, ImageType[]> = new Map();
    const optionMap: Map<string, Option[]> = new Map();

    variantList
      .slice(1) // skip header
      .forEach((variantRow) => {
        this.addProduct(variantRow, productMap);
        this.addVariant(variantRow, variantMap);
        this.addImage(variantRow, imageMap);
        this.addOptions(variantRow, optionMap);
      });

    this.fullFillProduct(productMap, variantMap, imageMap, optionMap);

    return await this.createProductBatch(productMap);
  }

  /**
   * Add product to product map.
   */
  addProduct(
    variantRow: VariantRow,
    productMap: Map<string, ProductType>,
  ): void {
    if (variantRow.title) {
      productMap.set(variantRow.handle, {
        title: variantRow.title,
        body_html: variantRow.body_html,
        vendor: variantRow.vendor,
        product_type: variantRow.product_type,
        tags: variantRow.tags,
      });
    }
  }

  /**
   * Add variant to variant map.
   */
  addVariant(
    variantRow: VariantRow,
    variantMap: Map<string, VariantType[]>,
  ): void {
    if (!variantMap.has(variantRow.handle))
      variantMap.set(variantRow.handle, []);

    // useless variant
    if (!variantRow.option1) return;

    const variant: VariantType = {
      price: variantRow.price,
      compare_at_price: variantRow.compare_at_price,
      option1: variantRow.option1,
      option2: variantRow.option2,
      option3: variantRow.option3,
    };

    variantMap.get(variantRow.handle).push(variant);
  }

  /**
   * Add image to image map.
   */
  addImage(variantRow: VariantRow, imageMap: Map<string, ImageType[]>): void {
    if (!imageMap.has(variantRow.handle)) imageMap.set(variantRow.handle, []);
    imageMap.get(variantRow.handle).push(variantRow.image);
  }

  /**
   * Add option to option map.
   */
  addOptions(variantRow: VariantRow, optionMap: Map<string, Option[]>): void {
    if (!optionMap.has(variantRow.handle)) optionMap.set(variantRow.handle, []);
    this.setOption(
      optionMap.get(variantRow.handle),
      variantRow.option1Name,
      variantRow.option1,
      0,
    );
    this.setOption(
      optionMap.get(variantRow.handle),
      variantRow.option2Name,
      variantRow.option2,
      1,
    );
    this.setOption(
      optionMap.get(variantRow.handle),
      variantRow.option3Name,
      variantRow.option3,
      2,
    );
  }

  /**
   *  Add option item to option list.
   */
  setOption(
    options: Option[],
    optionName: string,
    optionValue: string,
    idx: number,
  ): void {
    if (!optionValue) return;
    if (!options[idx])
      options[idx] = { name: optionName, values: [optionValue] };
    else {
      options[idx].values.push(optionValue);
    }
  }

  /**
   * Fill all information to product map.
   */
  fullFillProduct(
    productMap: Map<string, ProductType>,
    variantMap: Map<string, VariantType[]>,
    imageMap: Map<string, ImageType[]>,
    optionMap: Map<string, Option[]>,
  ): void {
    for (const [handle, product] of productMap) {
      if (variantMap.has(handle)) product.variants = variantMap.get(handle);
      if (imageMap.has(handle)) product.images = imageMap.get(handle);
      if (optionMap.has(handle)) product.options = optionMap.get(handle) as any;
    }
  }

  /**
   * create product in batch
   */
  async createProductBatch(
    productMap: Map<string, ProductType>,
  ): Promise<boolean> {
    await this.addProductToTaskQueue(productMap);
    await this.processTaskQueue();
    return true;
  }

  async addProductToTaskQueue(
    productMap: Map<string, ProductType>,
  ): Promise<void> {
    for (const product of productMap.values()) {
      this.productTaskQueue.push(product);
    }
  }

  /**
   * Process product in task queue, at most 2 products in one second(Shopify rate limit for rest api).
   */
  async processTaskQueue(): Promise<void> {
    if (this.taskTimer) return;

    this.taskTimer = setTimeout(
      async function tick(that: ProductService) {
        let times = that.taskNumPerTime;

        while (times--) {
          if (that.productTaskQueue.length === 0) {
            clearTimeout(that.taskTimer);
            that.taskTimer = null;
            return;
          }

          const product = that.productTaskQueue.shift();
          await that.shopifyCreateProduct(product);
        }

        that.taskTimer = setTimeout(tick, that.taskDelay, that);
      },
      this.taskDelay,
      this,
    );
  }

  /**
   * Create one product in Shopify.
   */
  async shopifyCreateProduct(product: ProductType): Promise<void> {
    await this.httpService
      .post(
        this.shopifyUrl,
        { product },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.shopifyToken,
          },
        },
      )
      .toPromise();
  }
}
