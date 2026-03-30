/**
 * Backwards-compatibility shim.
 * All product types and client helpers now live in lib/types.ts and lib/api-client.ts.
 * Components may still import { LocalProduct, Language, ... } from "@/lib/local-storage".
 */
export type {
  Product,
  Product as LocalProduct,
  ProductStatus,
  ProductCategory,
  Language,
  ProgramProfile,
} from "./types"

export {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProductContent,
  restoreProduct,
  permanentDeleteProduct,
  getTrashProducts,
} from "./api-client"
