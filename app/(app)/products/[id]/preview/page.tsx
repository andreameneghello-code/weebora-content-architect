import { ProductPreviewLoader } from "@/components/product/product-preview-loader"

export default async function PreviewProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductPreviewLoader id={id} />
}
