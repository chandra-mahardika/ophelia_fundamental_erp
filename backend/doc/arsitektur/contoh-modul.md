# Contoh Modul Lengkap

> Modul sample `products` sudah dihapus dari proyek. Kode di bawah dipertahankan
> sebagai **template** saat menambah modul ERP baru — ganti nama
> `product`/`Product` dengan domain modulmu, dan untuk tabel transaksional
> tambahkan `companyId` + pasang `resolveCompany`/`requireModule` di routes
> (lihat [multi-company.md](./multi-company.md)).

## 1. `product.validation.ts`

Skema Zod untuk input. Semua validasi body harus lewat skema ini.

```ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();
```

## 2. `product.repository.ts`

Satu-satunya tempat yang boleh menyentuh Prisma untuk entitas ini.

```ts
import { prisma } from "../../config/prisma";

export const findAll = () => prisma.product.findMany();

export const findById = (id: number) =>
  prisma.product.findUnique({ where: { id } });

export const create = (data: {
  name: string; description?: string; price: number; stock: number; userId: number;
}) => prisma.product.create({ data });

export const update = (id: number, data: object) =>
  prisma.product.update({ where: { id }, data });

export const remove = (id: number) =>
  prisma.product.delete({ where: { id } });
```

## 3. `product.service.ts`

Business logic. Melempar `ApiError` untuk skenario tidak ditemukan, dsb.

```ts
import { ApiError } from "../../utils/ApiError";
import * as productRepository from "./product.repository";

export const getById = async (id: number) => {
  const product = await productRepository.findById(id);
  if (!product) throw new ApiError(404, "Produk tidak ditemukan");
  return product;
};

export const create = (data: object, userId: number) =>
  productRepository.create({ ...data, userId });
```

## 4. `product.controller.ts`

Hanya mengekstrak input, memanggil service, dan memformat response.

```ts
import { Request, Response } from "express";
import * as productService from "./product.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const getById = async (req: Request, res: Response) => {
  const product = await productService.getById(Number(req.params.id));
  res.json({ data: product });
};

export const create = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const product = await productService.create(req.body, user.id);
  res.status(201).json({ message: "Produk dibuat", data: product });
};
```

## 5. `product.routes.ts`

Definisi endpoint + chain middleware: `authenticate` → `authorize` → `validate` → controller.

```ts
import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createProductSchema } from "./product.validation";

const router = Router();

router.use(authenticate);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", authorize("ADMIN"), validate(createProductSchema), productController.create);

export default router;
```

## 6. Daftarkan di `src/app.ts`

```ts
import productRoutes from "./modules/products/product.routes";
app.use("/api/products", productRoutes);
```

## Ringkasan Urutan Pembuatan Modul Baru

1. `prisma/schema.prisma` → `npm.cmd run prisma:migrate`
2. `xxx.validation.ts`
3. `xxx.repository.ts`
4. `xxx.service.ts`
5. `xxx.controller.ts`
6. `xxx.routes.ts`
7. Daftarkan di `src/app.ts`
