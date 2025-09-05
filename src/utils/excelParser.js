import * as XLSX from 'xlsx';

/**
 * Load and parse Excel file from public folder
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<Array>} - Array of parsed data objects
 */
export const loadExcelFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellStyles: true,
      cellDates: true
    });
    
    // Get first sheet name
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Use first row as headers
      defval: '', // Default value for empty cells
      blankrows: false // Skip blank rows
    });
    
    // If no data, return empty array
    if (jsonData.length === 0) {
      return [];
    }
    
    // Get headers from first row
    const headers = jsonData[0];
    
    // Convert remaining rows to objects
    const data = jsonData.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    console.log('Excel data loaded successfully:', data.length, 'records');
    return data;
    
  } catch (error) {
    console.error('Error loading Excel file:', error);
    throw error;
  }
};

/**
 * Parse Excel file from file input
 * @param {File} file - Excel file from input
 * @returns {Promise<Array>} - Array of parsed data objects
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellStyles: true,
          cellDates: true
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export data to Excel file
 * @param {Array} data - Array of data objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = (data, filename = 'attendance_data.xlsx') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    // Add some styling
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style header row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } }
        };
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Data');
    
    // Generate buffer and create download
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};