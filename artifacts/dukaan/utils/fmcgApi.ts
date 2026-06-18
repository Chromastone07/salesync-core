export async function fetchProductNameByBarcode(barcode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: {
        Accept: "application/json",
      },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.status === 1 && data.product && data.product.product_name) {
      return data.product.product_name;
    }
    
    return null;
  } catch (err) {
    // Silently fail if offline or API error
    console.warn("FMCG lookup failed:", err);
    return null;
  }
}
