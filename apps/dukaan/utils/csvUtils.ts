import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import { InventoryItem } from '@/context/StoreContext';

const CSV_TEMPLATE = `Name,Local Name,Unit,Price,Barcode,Initial Stock
Apple,Seb,kg,120,890123456789,50
Milk,Dudh,L,60,,100
Haircut,Baal Katna,service,150,,`;

export async function downloadCSVTemplate() {
  try {
    const fileUri = `${FileSystem.cacheDirectory}SaleSync_Inventory_Template.csv`;
    await FileSystem.writeAsStringAsync(fileUri, CSV_TEMPLATE, { encoding: FileSystem.EncodingType.UTF8 });
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Download Inventory Template',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error("Failed to download CSV template", error);
    throw error;
  }
}

export async function parseInventoryCSV(fileUri: string): Promise<Omit<InventoryItem, "id">[]> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items: Omit<InventoryItem, "id">[] = [];
          
          results.data.forEach((row: any) => {
            const name = row['Name']?.trim();
            if (!name) return; // Skip if no name
            
            const rate = parseFloat(row['Price']) || 0;
            const unit = row['Unit']?.trim() || 'pcs';
            const isService = unit.toLowerCase() === 'service';
            
            let stock: number | undefined = parseFloat(row['Initial Stock']);
            if (isNaN(stock) || isService) {
              stock = undefined;
            }

            items.push({
              label: name,
              localLabel: row['Local Name']?.trim() || '',
              unit: unit,
              rate: rate,
              isService: isService,
              barcode: row['Barcode']?.trim() || undefined,
              stock: stock,
            });
          });
          
          resolve(items);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Failed to parse CSV", error);
    throw error;
  }
}
