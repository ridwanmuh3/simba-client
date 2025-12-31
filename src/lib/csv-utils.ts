export interface ItemData {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  pricePerUnit: number;
  status: string;
}

export const exportToCSV = (items: ItemData[], filename: string = 'bahan-mbg') => {
  const headers = ['Kode', 'Nama Bahan', 'Kategori', 'Stok', 'Satuan', 'Harga per Satuan', 'Status'];
  
  const csvContent = [
    headers.join(','),
    ...items.map(item => [
      item.code,
      `"${item.name}"`,
      item.category,
      item.stock,
      item.unit,
      item.pricePerUnit,
      item.status
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Partial<ItemData>[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('File CSV harus memiliki header dan minimal satu baris data');
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map((line, index) => {
    // Handle quoted values
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < 6) {
      throw new Error(`Baris ${index + 2} tidak memiliki kolom yang cukup`);
    }

    return {
      code: values[0] || `BHN-${String(Date.now()).slice(-3)}`,
      name: values[1],
      category: values[2],
      stock: parseInt(values[3]) || 0,
      unit: values[4],
      pricePerUnit: parseInt(values[5]) || 0,
      status: values[6] || 'active'
    };
  });
};

export const downloadCSVTemplate = () => {
  const headers = ['Kode', 'Nama Bahan', 'Kategori', 'Stok', 'Satuan', 'Harga per Satuan', 'Status'];
  const exampleRow = ['BHN-001', 'Beras Premium', 'Karbohidrat', '100', 'kg', '14000', 'active'];
  
  const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'template-bahan-mbg.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
