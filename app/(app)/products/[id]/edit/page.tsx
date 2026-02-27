import { ProductEditorLoader } from "@/components/product/product-editor-loader"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductEditorLoader id={id} />
}
