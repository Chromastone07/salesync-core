export type FetchedProduct = {
  name: string;
  brand?: string;
  quantity?: string;
};

export function matchBarcode(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const s1 = a.trim();
  const s2 = b.trim();
  if (s1 === s2) return true;
  const strip1 = s1.replace(/^0+/, "");
  const strip2 = s2.replace(/^0+/, "");
  return strip1.length > 0 && strip1 === strip2;
}

export async function fetchProductDetailsByBarcode(barcode: string): Promise<FetchedProduct | null> {
  const clean = barcode.trim();
  if (!clean) return null;

  const variants = [clean];
  if (clean.length === 12) variants.push(`0${clean}`);
  if (clean.length === 13 && clean.startsWith("0")) variants.push(clean.slice(1));

  const headers = {
    Accept: "application/json",
    "User-Agent": "SaleSync - Android - Version 1.0 - https://salesync.app",
  };

  const bases = [
    "https://world.openfoodfacts.org",
    "https://world.openbeautyfacts.org",
    "https://world.openproductsfacts.org",
  ];

  for (const code of variants) {
    for (const base of bases) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `${base}/api/v2/product/${code}?fields=product_name,product_name_en,product_name_hi,brands,generic_name,quantity`;
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product;
          const rawName = p.product_name || p.product_name_en || p.product_name_hi || "";
          const brand = p.brands ? p.brands.trim() : "";
          let name = rawName.trim();

          if (!name && brand) {
            name = `${brand} ${p.generic_name || ""}`.trim();
          } else if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
            name = `${brand} - ${name}`;
          }

          if (name) {
            return {
              name,
              brand: brand || undefined,
              quantity: p.quantity ? p.quantity.trim() : undefined,
            };
          }
        }
      } catch {
        // try next variant/endpoint
      }
    }
  }

  return null;
}

export async function fetchProductNameByBarcode(barcode: string): Promise<string | null> {
  const product = await fetchProductDetailsByBarcode(barcode);
  return product ? product.name : null;
}
