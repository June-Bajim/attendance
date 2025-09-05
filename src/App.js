import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import styles from './AttendanceDashboard.module.css';

const App = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [dateRange, setDateRange] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [employeeList, setEmployeeList] = useState(['All Employees']);
  const [summaryStats, setSummaryStats] = useState({
    totalEmployees: 0,
    totalSignIns: 0,
    totalSignOuts: 0,
    signInPercentage: 0,
    signOutPercentage: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    totalExtraHours: 0,
    averageExtraHours: 0,
    totalRecords: 0,
    totalWorkingHours: 0
  });

  // Load Excel file from public folder
 // Updated loadExcelData function with better error handling and file detection
const loadExcelData = async () => {
  try {
    setLoading(true);
    
    // Try multiple possible paths for the Excel file
    const possiblePaths = [
      '/attendance.xlsx',
      './attendance.xlsx',
      `${process.env.PUBLIC_URL}/attendance.xlsx`,
      '/public/attendance.xlsx'
    ];
    
    let response = null;
    let workingPath = null;
    
    // Try each path until one works
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to fetch: ${path}`);
        response = await fetch(path);
        if (response.ok) {
          workingPath = path;
          console.log(`Successfully found file at: ${path}`);
          break;
        }
      } catch (pathError) {
        console.log(`Failed to fetch from ${path}:`, pathError.message);
        continue;
      }
    }
    
    // If none of the paths worked, provide detailed error
    if (!response || !response.ok) {
      const errorMsg = `Failed to load Excel file from any of these locations:
${possiblePaths.map(path => `  • ${path}`).join('\n')}

Please ensure:
1. The file 'attendance.xlsx' is in your project's 'public' folder
2. The file name is exactly 'attendance.xlsx' (case-sensitive)
3. Your development server is running
4. The file is accessible via browser (try visiting ${window.location.origin}/attendance.xlsx directly)

Current working directory: ${window.location.origin}
Response status: ${response ? response.status : 'No response'}`;
      
      throw new Error(errorMsg);
    }
    
    // Convert to array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Validate file size
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Excel file is empty or corrupted');
    }
    
    console.log(`File loaded successfully from ${workingPath}, size: ${arrayBuffer.byteLength} bytes`);
    
    // Read Excel file
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellDates: true,
      dateNF: 'YYYY-MM-DD HH:MM:SS'
    });
    
    // Validate workbook
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel file contains no sheets');
    }
    
    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Validate worksheet
    if (!worksheet) {
      throw new Error(`Worksheet '${sheetName}' not found`);
    }
    
    // Convert to JSON with header row handling
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    });
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must contain at least a header row and one data row');
    }
    
    console.log('Raw Excel data loaded:', jsonData.length, 'rows');
    console.log('Headers:', jsonData[0]);
    
    // Process the attendance data
    const processedAttendance = processCombinedDateTimeData(jsonData);
    
    if (processedAttendance.length === 0) {
      throw new Error('No valid attendance records found in Excel file. Please check the data format.');
    }
    
    console.log('Processed attendance records:', processedAttendance.length);
    return processedAttendance;
    
  } catch (error) {
    console.error('Error loading Excel file:', error);
    throw error;
  }
};

// Alternative: File input method if static loading fails
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    setError('Please select an Excel file (.xlsx)');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      setLoading(true);
      const arrayBuffer = e.target.result;
      
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        dateNF: 'YYYY-MM-DD HH:MM:SS'
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false,
        raw: false
      });
      
      if (!jsonData || jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }
      
      const processedAttendance = processCombinedDateTimeData(jsonData);
      setRawData(processedAttendance);
      processDataForDashboard(processedAttendance);
      setError(null);
      
    } catch (err) {
      console.error('Error processing uploaded file:', err);
      setError(`Error processing file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  reader.readAsArrayBuffer(file);
};

  // Process attendance data with combined date/time format
  const processCombinedDateTimeData = (rawExcelData) => {
  const attendanceRecords = [];
  const headers = rawExcelData[0]; // Get column headers
  
  console.log('Headers detected:', headers);
  
  // Map headers to column indices - updated for your Excel format
  const columnMap = {};
  headers.forEach((header, index) => {
    const headerStr = String(header).toLowerCase().trim();
    
    // Employee name column - matches "Employee"
    if (headerStr === 'employee' || headerStr.includes('employee') || 
        headerStr.includes('name') || headerStr === 'staff') {
      columnMap.name = index;
    }
    // Check In datetime column - matches "Check In"
    else if (headerStr === 'check in' || headerStr.includes('check in') || 
             headerStr.includes('checkin') || headerStr.includes('sign in') || 
             headerStr.includes('signin') || headerStr.includes('time in') || 
             headerStr.includes('in time') || headerStr === 'in' || 
             headerStr.includes('clock in')) {
      columnMap.signInDateTime = index;
    }
    // Check Out datetime column - matches "Check Out"
    else if (headerStr === 'check out' || headerStr.includes('check out') ||
             headerStr.includes('checkout') || headerStr.includes('sign out') || 
             headerStr.includes('signout') || headerStr.includes('time out') || 
             headerStr.includes('out time') || headerStr === 'out' || 
             headerStr.includes('clock out')) {
      columnMap.signOutDateTime = index;
    }
    // Extra Hours column - matches "Extra Hours"
    else if (headerStr === 'extra hours' || headerStr.includes('extra hours') || 
             headerStr.includes('extra') || headerStr.includes('overtime') || 
             headerStr.includes('over time') || headerStr.includes('ot hours') || 
             headerStr.includes('additional')) {
      columnMap.extraHours = index;
    }
    // Worked Hours column - matches "Worked Hours"
    else if (headerStr === 'worked hours' || headerStr.includes('worked hours') || 
             headerStr.includes('total hours') || 
             (headerStr.includes('worked') && headerStr.includes('hour')) ||
             (headerStr.includes('total') && headerStr.includes('hour'))) {
      columnMap.totalHours = index;
    }
    // Department column (if exists in future)
    else if (headerStr.includes('department') || headerStr.includes('dept') ||
             headerStr.includes('division') || headerStr.includes('team')) {
      columnMap.department = index;
    }
  });
  
  console.log('Column mapping:', columnMap);
  
  // Validate that we found the essential columns
  if (columnMap.name === undefined) {
    throw new Error('Could not find Employee column in Excel file. Expected column: "Employee"');
  }
  if (columnMap.signInDateTime === undefined) {
    throw new Error('Could not find Check In column in Excel file. Expected column: "Check In"');
  }
  
  // Process each data row
  let processedCount = 0;
  for (let rowIndex = 1; rowIndex < rawExcelData.length; rowIndex++) {
    const row = rawExcelData[rowIndex];
    
    // Skip empty rows
    if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
      console.log(`Skipping empty row ${rowIndex}`);
      continue;
    }
    
    const employeeName = columnMap.name !== undefined ? String(row[columnMap.name] || '').trim() : '';
    
    // Skip rows without employee name
    if (!employeeName) {
      console.log(`Skipping row ${rowIndex}: no employee name`);
      continue;
    }
    
    const signInDateTime = columnMap.signInDateTime !== undefined ? row[columnMap.signInDateTime] : null;
    const signOutDateTime = columnMap.signOutDateTime !== undefined ? row[columnMap.signOutDateTime] : null;
    const extraHours = columnMap.extraHours !== undefined ? parseFloat(row[columnMap.extraHours]) || 0 : 0;
    const totalHours = columnMap.totalHours !== undefined ? parseFloat(row[columnMap.totalHours]) || 0 : 0;
    const department = columnMap.department !== undefined ? String(row[columnMap.department] || '').trim() : '';
    
    console.log(`Processing row ${rowIndex}:`, {
      employee: employeeName,
      signIn: signInDateTime,
      signOut: signOutDateTime,
      extraHours,
      totalHours
    });
    
    // Parse sign-in date and time
    const signInParsed = parseCombinedDateTime(signInDateTime);
    const signOutParsed = parseCombinedDateTime(signOutDateTime);
    
    // Calculate total working hours if not provided or if we need to recalculate
    let calculatedTotalHours = totalHours;
    if (signInParsed && signOutParsed && signInParsed.date === signOutParsed.date) {
      // Only calculate if sign-in and sign-out are on the same date
      const signInTime = new Date(`1970-01-01T${signInParsed.time}:00`);
      const signOutTime = new Date(`1970-01-01T${signOutParsed.time}:00`);
      if (signOutTime > signInTime) {
        calculatedTotalHours = (signOutTime - signInTime) / (1000 * 60 * 60);
      }
    }
    
    // Determine if late (after 9:00 AM)
    const isLate = signInParsed ? isLateArrival(signInParsed.time) : false;
    
    // Create attendance record if we have at least a sign-in
    if (signInParsed) {
      const record = {
        Name: employeeName,
        Date: signInParsed.date,
        SignInDateTime: signInDateTime,
        SignOutDateTime: signOutDateTime || '',
        SignInDate: signInParsed.date,
        SignInTime: signInParsed.time,
        SignOutDate: signOutParsed?.date || '',
        SignOutTime: signOutParsed?.time || '',
        SignIn: signInParsed.time, // For display in table
        SignOut: signOutParsed?.time || '--:--', // For display in table
        ExtraHours: extraHours,
        TotalHours: calculatedTotalHours || totalHours,
        Department: department || inferDepartment(employeeName),
        Present: true, // If they have a sign-in, they're present
        Late: isLate,
        HasSignIn: true,
        HasSignOut: !!signOutParsed
      };
      
      attendanceRecords.push(record);
      processedCount++;
      console.log(`Added record ${processedCount} for ${employeeName} on ${record.Date}`);
    } else {
      console.log(`Skipping row ${rowIndex}: no valid sign-in time for ${employeeName}`);
    }
  }
  
  console.log(`Total processed attendance records: ${attendanceRecords.length}`);
  
  if (attendanceRecords.length === 0) {
    throw new Error(`No valid attendance records found. Processed ${rawExcelData.length - 1} rows but found no valid sign-in times.`);
  }
  
  return attendanceRecords;
};

  // Parse combined date/time string
  const parseCombinedDateTime = (dateTimeValue) => {
  if (!dateTimeValue) return null;
  
  try {
    let dateObj;
    const dateTimeStr = String(dateTimeValue).trim();
    
    // Handle empty strings
    if (!dateTimeStr || dateTimeStr === '' || dateTimeStr === 'undefined' || dateTimeStr === 'null') {
      return null;
    }
    
    // Handle Excel date serial numbers
    if (typeof dateTimeValue === 'number') {
      // Excel stores dates as days since January 1, 1900
      dateObj = new Date((dateTimeValue - 25569) * 86400 * 1000);
    }
    // Handle JavaScript Date objects
    else if (dateTimeValue instanceof Date) {
      dateObj = dateTimeValue;
    }
    // Handle string formats like "2025-08-18 09:16:17"
    else {
      // Your format appears to be: YYYY-MM-DD HH:MM:SS
      if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        dateObj = new Date(dateTimeStr);
      }
      // Try other common formats
      else if (dateTimeStr.includes('T')) {
        // ISO format: 2024-01-01T09:00:00
        dateObj = new Date(dateTimeStr);
      } else if (dateTimeStr.includes(' ')) {
        // Space separated: 2024-01-01 09:00:00 or 1/1/2024 9:00:00 AM
        dateObj = new Date(dateTimeStr);
      } else {
        // Try parsing as-is
        dateObj = new Date(dateTimeStr);
      }
    }
    
    // Validate the date
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date/time:', dateTimeValue);
      return null;
    }
    
    // Extract date and time components
    const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = dateObj.toTimeString().slice(0, 5); // HH:MM
    
    return { date, time, dateTime: dateObj };
    
  } catch (error) {
    console.warn('Error parsing date/time:', dateTimeValue, error);
    return null;
  }
};
  // Check if arrival time is late (after 9:00 AM)
  const isLateArrival = (timeStr) => {
    if (!timeStr) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours > 10 || (hours === 10 && minutes > 0);
  };

  // Infer department from employee name (customize as needed)
  const inferDepartment = (name) => {
    if (!name) return 'General';
    
    const nameLower = name.toLowerCase();
    if (nameLower.includes('dev') || nameLower.includes('tech') || nameLower.includes('it')) return 'IT';
    if (nameLower.includes('hr') || nameLower.includes('human')) return 'HR';
    if (nameLower.includes('finance') || nameLower.includes('account')) return 'Finance';
    if (nameLower.includes('market') || nameLower.includes('sales')) return 'Marketing';
    if (nameLower.includes('ops') || nameLower.includes('operation')) return 'Operations';
    if (nameLower.includes('admin')) return 'Administration';
    if (nameLower.includes('manager') || nameLower.includes('lead')) return 'Management';
    
    return 'General';
  };

  // Process data for dashboard
  const processDataForDashboard = (data) => {
    if (!data || data.length === 0) return;
    
    // Get unique employees
    const uniqueEmployees = [...new Set(data.map(entry => entry.Name).filter(Boolean))];
    setEmployeeList(['All Employees', ...uniqueEmployees.sort()]);

    // Calculate totals
    const totalSignIns = data.filter(entry => entry.HasSignIn).length;
    const totalSignOuts = data.filter(entry => entry.HasSignOut).length;
    const totalRecords = data.length;
    
    // Calculate percentages
    const signInPercentage = totalRecords > 0 ? (totalSignIns / totalRecords) * 100 : 0;
    const signOutPercentage = totalRecords > 0 ? (totalSignOuts / totalRecords) * 100 : 0;
    
    // Calculate extra hours and total working hours
    const totalExtraHours = data.reduce((sum, entry) => sum + (entry.ExtraHours || 0), 0);
    const totalWorkingHours = data.reduce((sum, entry) => sum + (entry.TotalHours || 0), 0);
    const averageExtraHours = totalRecords > 0 ? totalExtraHours / totalRecords : 0;
    
    // Get latest date data for "today" metrics
    const dates = data.map(entry => entry.Date).filter(Boolean).sort();
    const latestDate = dates[dates.length - 1];
    const todayAttendance = data.filter(entry => entry.Date === latestDate);
    
    const presentToday = todayAttendance.filter(entry => entry.Present).length;
    const lateToday = todayAttendance.filter(entry => entry.Late).length;
    const absentToday = Math.max(0, uniqueEmployees.length - presentToday);

    // Process daily attendance for charts
    const dailyStats = processDailyAttendance(data);
    setDailyAttendance(dailyStats);

    // Process department data
    const departments = processDepartmentData(data);
    setDepartmentData(departments);

    // Set summary statistics
    setSummaryStats({
      totalEmployees: uniqueEmployees.length,
      totalSignIns,
      totalSignOuts,
      signInPercentage,
      signOutPercentage,
      presentToday,
      absentToday,
      lateToday,
      totalExtraHours,
      averageExtraHours,
      totalRecords,
      totalWorkingHours
    });

    setProcessedData(data);
  };

  // Process daily attendance for charts
  const processDailyAttendance = (data) => {
    const dailyStats = {};
    
    data.forEach(entry => {
      if (!entry.Date) return;
      
      const dateKey = entry.Date;
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          signIns: 0,
          signOuts: 0,
          present: 0,
          late: 0,
          extraHours: 0,
          totalHours: 0,
          employees: new Set()
        };
      }
      
      if (entry.HasSignIn) dailyStats[dateKey].signIns++;
      if (entry.HasSignOut) dailyStats[dateKey].signOuts++;
      if (entry.Present) dailyStats[dateKey].present++;
      if (entry.Late) dailyStats[dateKey].late++;
      dailyStats[dateKey].extraHours += entry.ExtraHours || 0;
      dailyStats[dateKey].totalHours += entry.TotalHours || 0;
      dailyStats[dateKey].employees.add(entry.Name);
    });
    
    // Convert to array and sort by date
    return Object.values(dailyStats)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, index) => ({
        ...item,
        name: `Day ${index + 1}`,
        displayDate: new Date(item.date).toLocaleDateString(),
        uniqueEmployees: item.employees.size
      }));
  };

  // Process department data
  const processDepartmentData = (data) => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Count unique employees per department
    const employeesByDept = {};
    data.forEach(entry => {
      if (entry.Department && entry.Name) {
        if (!employeesByDept[entry.Department]) {
          employeesByDept[entry.Department] = new Set();
        }
        employeesByDept[entry.Department].add(entry.Name);
      }
    });

    return Object.entries(employeesByDept).map(([dept, employees], index) => ({
      name: dept,
      value: employees.size,
      color: colors[index % colors.length]
    }));
  };

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        const excelData = await loadExcelData();
        setRawData(excelData);
        processDataForDashboard(excelData);
        setError(null);
      } catch (err) {
        console.error('Failed to load Excel data:', err);
        setError(`Failed to load attendance data: ${err.message}`);
        
        // Reset all data states
        setRawData([]);
        setProcessedData([]);
        setDailyAttendance([]);
        setDepartmentData([]);
        setEmployeeList(['All Employees']);
        setSummaryStats({
          totalEmployees: 0,
          totalSignIns: 0,
          totalSignOuts: 0,
          signInPercentage: 0,
          signOutPercentage: 0,
          presentToday: 0,
          absentToday: 0,
          lateToday: 0,
          totalExtraHours: 0,
          averageExtraHours: 0,
          totalRecords: 0,
          totalWorkingHours: 0
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle CSV export
  const handleDownload = () => {
    if (!processedData.length) {
      alert('No data to export');
      return;
    }

    const csvHeaders = ['Employee', 'Date', 'Sign In Time', 'Sign Out Time', 'Extra Hours', 'Total Hours', 'Department', 'Status'];
    const csvRows = processedData.map(entry => [
      entry.Name,
      entry.Date,
      entry.SignInTime || '',
      entry.SignOutTime || '',
      entry.ExtraHours || 0,
      entry.TotalHours ? entry.TotalHours.toFixed(2) : 0,
      entry.Department || '',
      entry.Late ? 'Late' : (entry.Present ? 'Present' : 'Absent')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      csvHeaders.join(',') + '\n' +
      csvRows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error Loading Data</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '500px', textAlign: 'center' }}>
            {error}
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Expected Excel Format (Combined Date/Time):</strong>
            <div style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>
              <table style={{ margin: '0 auto', border: '1px solid #e5e7eb', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ border: '1px solid #e5e7eb', padding: '8px' }}>Employee Name</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: '8px' }}>Sign In</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: '8px' }}>Sign Out</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: '8px' }}>Extra Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>John Doe</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-01 09:00:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-01 17:30:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>1.5</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>John Doe</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-02 08:45:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-02 17:00:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>0</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>Jane Smith</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-01 09:30:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2024-01-01 18:00:00</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.headerTitle}>Attendance Dashboard</h1>
              <p className={styles.headerSubtitle}>
                Monitor and analyze employee attendance records
                {processedData.length > 0 && ` • ${processedData.length} records • ${summaryStats.totalEmployees} employees`}
              </p>
            </div>
            <div className={styles.headerControls}>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={styles.select}
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>Custom Range</option>
              </select>
              <button 
                onClick={handleDownload}
                className={styles.exportButton}
                disabled={!processedData.length}
              >
                📥 Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Navigation Tabs */}
          <div className={styles.navTabs}>
            <nav className={styles.tabsContainer}>
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'employees', label: 'Employees', icon: '👥' },
                { id: 'reports', label: 'Reports', icon: '📋' },
                { id: 'analytics', label: 'Analytics', icon: '📈' }
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTab(id)}
                  className={`${styles.tab} ${selectedTab === id ? styles.tabActive : ''}`}
                >
                  <span className={styles.tabIcon}>{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Show message if no data */}
          {processedData.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3>No attendance data available</h3>
              <p>Please add your attendance.xlsx file to the public folder</p>
            </div>
          )}

          {/* Overview Tab Content */}
          {selectedTab === 'overview' && processedData.length > 0 && (
            <div className={styles.contentSection}>
              {/* Enhanced Summary Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Total Employees */}
                <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardText}>
                      <p className={styles.statCardTitle}>Total Employees</p>
                      <p className={styles.statCardValue}>{summaryStats.totalEmployees}</p>
                    </div>
                    <div className={`${styles.statCardIcon} ${styles.iconPrimary}`}>👥</div>
                  </div>
                </div>

                {/* Total Sign-ins */}
                <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardText}>
                      <p className={styles.statCardTitle}>Total Sign-ins</p>
                      <p className={styles.statCardValue}>{summaryStats.totalSignIns}</p>
                      <p className={styles.statCardSubtitle}>{summaryStats.signInPercentage.toFixed(1)}% completion rate</p>
                    </div>
                    <div className={`${styles.statCardIcon} ${styles.iconSuccess}`}>📥</div>
                  </div>
                </div>

                {/* Total Sign-outs */}
                <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardText}>
                      <p className={styles.statCardTitle}>Total Sign-outs</p>
                      <p className={styles.statCardValue}>{summaryStats.totalSignOuts}</p>
                      <p className={styles.statCardSubtitle}>{summaryStats.signOutPercentage.toFixed(1)}% completion rate</p>
                    </div>
                    <div className={`${styles.statCardIcon} ${styles.iconWarning}`}>📤</div>
                  </div>
                </div>

                {/* Extra Hours */}
                <div className={`${styles.statCard} ${styles.statCardDanger}`}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardText}>
                      <p className={styles.statCardTitle}>Total Extra Hours</p>
                      <p className={styles.statCardValue}>{summaryStats.totalExtraHours.toFixed(1)}h</p>
                      <p className={styles.statCardSubtitle}>Avg: {summaryStats.averageExtraHours.toFixed(1)}h per record</p>
                    </div>
                    <div className={`${styles.statCardIcon} ${styles.iconDanger}`}>⏰</div>
                  </div>
                </div>

                {/* Late Arrivals */}
                <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statCardText}>
                      <p className={styles.statCardTitle}>Late Arrivals</p>
                      <p className={styles.statCardValue}>{processedData.filter(entry => entry.Late).length}</p>
                      <p className={styles.statCardSubtitle}>
                        {summaryStats.totalSignIns > 0 ? 
                          ((processedData.filter(entry => entry.Late).length / summaryStats.totalSignIns) * 100).toFixed(1) : 0}% of sign-ins
                      </p>
                    </div>
                    <div className={`${styles.statCardIcon} ${styles.iconWarning}`}>🚨</div>
                  </div>
                </div>


              {/* Charts Row */}
                {/* Daily Attendance Chart */}
                <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                  <h3 className={styles.chartTitle}>Daily Attendance Overview</h3>
                  {dailyAttendance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          labelFormatter={(label) => {
                            const item = dailyAttendance.find(d => d.name === label);
                            return item ? `${label} (${item.displayDate})` : label;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="signIns" fill="#10B981" name="Sign-ins" />
                        <Bar dataKey="signOuts" fill="#F59E0B" name="Sign-outs" />
                        <Bar dataKey="late" fill="#EF4444" name="Late Arrivals" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={styles.chartPlaceholder}>
                      <div style={{ textAlign: 'center' }}>
                        <div className={styles.chartPlaceholderIcon}>📊</div>
                        <p>No daily data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign-in vs Sign-out Comparison */}
                <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                  <h3 className={styles.chartTitle}>Sign-in vs Sign-out Completion</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: `Sign-ins (${summaryStats.signInPercentage.toFixed(1)}%)`, 
                            value: summaryStats.totalSignIns, 
                            color: '#10B981' 
                          },
                          { 
                            name: `Sign-outs (${summaryStats.signOutPercentage.toFixed(1)}%)`, 
                            value: summaryStats.totalSignOuts, 
                            color: '#F59E0B' 
                          },
                          { 
                            name: 'Missing Records', 
                            value: Math.max(0, (summaryStats.totalRecords * 2) - summaryStats.totalSignIns - summaryStats.totalSignOuts), 
                            color: '#EF4444' 
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
         

              {/* Extra Hours and Department Analysis */}
         
                {/* Extra Hours Trend */}
                {dailyAttendance.length > 0 && (
                  <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                    <h3 className={styles.chartTitle}>Daily Extra Hours Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)} hours`, 'Extra Hours']}
                          labelFormatter={(label) => {
                            const item = dailyAttendance.find(d => d.name === label);
                            return item ? `${label} (${item.displayDate})` : label;
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="extraHours" 
                          stroke="#8B5CF6" 
                          strokeWidth={3}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                          name="Extra Hours"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Department Distribution */}
                {/* {departmentData.length > 0 && (
                  <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                    <h3 className={styles.chartTitle}>Employee Distribution by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )} */}
             
            </div>
            </div>
          )}

          {/* Employees Tab Content */}
          {selectedTab === 'employees' && (
            <div className={styles.contentSection}>
              <div className={styles.tableSection}>
                <div className={styles.tableSectionHeader}>
                  <h3 className={styles.sectionTitle}>Employee Monthly Records</h3>
                  <div className={styles.tableControls}>
                    <select 
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className={styles.select}
                    >
                      {employeeList.map(employee => (
                        <option key={employee} value={employee}>{employee}</option>
                      ))}
                    </select>
                    <button className={styles.filterButton}>🔍 Filter</button>
                  </div>
                </div>
                
                {processedData.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.tableHeader}>
                        <tr>
                          <th className={styles.tableHeaderCell}>Employee</th>
                          <th className={styles.tableHeaderCell}>Date</th>
                          <th className={styles.tableHeaderCell}>Sign In</th>
                          <th className={styles.tableHeaderCell}>Sign Out</th>
                          <th className={styles.tableHeaderCell}>Extra Hours</th>
                          <th className={styles.tableHeaderCell}>Total Hours</th>
                          <th className={styles.tableHeaderCell}>Department</th>
                          <th className={styles.tableHeaderCell}>Status</th>
                        </tr>
                      </thead>
                      <tbody className={styles.tableBody}>
                        {processedData
                          .filter(entry => selectedEmployee === 'All Employees' || entry.Name === selectedEmployee)
                          .slice(0, 25)
                          .map((entry, index) => (
                            <tr key={`${entry.Name}-${entry.Date}-${index}`} className={styles.tableRow}>
                              <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                                {entry.Name}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.Date ? new Date(entry.Date).toLocaleDateString() : entry.DateDisplay}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.SignIn || '--:--'}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.SignOut || '--:--'}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.ExtraHours ? `${entry.ExtraHours}h` : '0h'}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.TotalHours ? `${entry.TotalHours.toFixed(1)}h` : '--'}
                              </td>
                              <td className={`${styles.tableCell} ${styles.tableCellRegular}`}>
                                {entry.Department}
                              </td>
                              <td className={styles.tableCell}>
                                <span className={`${styles.statusBadge} ${
                                  entry.Late ? styles.statusLate : 
                                  entry.Present ? styles.statusPresent : 
                                  styles.statusAbsent
                                }`}>
                                  {entry.Late ? 'Late' : (entry.Present ? 'Present' : 'Absent')}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    
                    {/* Show employee summary if filtering */}
                    {selectedEmployee !== 'All Employees' && (
                      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                        <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>📊 {selectedEmployee} Summary:</h4>
                        {(() => {
                          const employeeRecords = processedData.filter(entry => entry.Name === selectedEmployee);
                          const signIns = employeeRecords.filter(r => r.HasSignIn).length;
                          const signOuts = employeeRecords.filter(r => r.HasSignOut).length;
                          const totalExtra = employeeRecords.reduce((sum, r) => sum + (r.ExtraHours || 0), 0);
                          const lateCount = employeeRecords.filter(r => r.Late).length;
                          
                          return (
                            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                              <p>• Total Days Recorded: {employeeRecords.length}</p>
                              <p>• Sign-ins: {signIns} | Sign-outs: {signOuts}</p>
                              <p>• Total Extra Hours: {totalExtra.toFixed(1)}h</p>
                              <p>• Late Arrivals: {lateCount}</p>
                              <p>• Department: {employeeRecords[0]?.Department || 'Not specified'}</p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p>No employee data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab Content */}
          {selectedTab === 'reports' && (
            <div className={styles.contentSection}>
              <div className={styles.tableSection}>
                <h3 className={styles.sectionTitle}>Monthly Attendance Reports</h3>
                <div className={styles.reportsGrid}>
                  {[
                    { 
                      title: 'Monthly Summary Report', 
                      desc: 'Complete monthly attendance overview with totals', 
                      icon: '📅',
                      data: `${summaryStats.totalRecords} records processed`
                    },
                    { 
                      title: 'Sign-in/Sign-out Analysis', 
                      desc: 'Detailed analysis of completion rates', 
                      icon: '📊',
                      data: `${summaryStats.signInPercentage.toFixed(1)}% vs ${summaryStats.signOutPercentage.toFixed(1)}%`
                    },
                    { 
                      title: 'Extra Hours Report', 
                      desc: 'Analysis of overtime and extra hours worked', 
                      icon: '⏰',
                      data: `${summaryStats.totalExtraHours.toFixed(1)} total extra hours`
                    },
                    { 
                      title: 'Employee Performance Report', 
                      desc: 'Individual employee attendance patterns', 
                      icon: '👤',
                      data: `${summaryStats.totalEmployees} employees tracked`
                    },
                    { 
                      title: 'Punctuality Analysis', 
                      desc: 'Track late arrivals and punctuality trends', 
                      icon: '🚨',
                      data: `${processedData.filter(entry => entry.Late).length} late arrivals detected`
                    },
                    { 
                      title: 'Department Performance', 
                      desc: 'Department-wise attendance comparison', 
                      icon: '🏢',
                      data: `${departmentData.length} departments analyzed`
                    }
                  ].map((report, index) => (
                    <div key={index} className={styles.reportCard}>
                      <div className={styles.reportCardHeader}>
                        <span className={styles.reportCardIcon}>{report.icon}</span>
                        <h4 className={styles.reportCardTitle}>{report.title}</h4>
                      </div>
                      <p className={styles.reportCardDescription}>{report.desc}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
                        {report.data}
                      </p>
                      <button 
                        className={styles.reportCardLink}
                        onClick={() => alert(`${report.title} - Feature coming soon!\n\nData available: ${report.data}`)}
                      >
                        Generate Report →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab Content */}
          {selectedTab === 'analytics' && (
            <div className={styles.contentSection}>
              <div className={styles.analyticsGrid}>
                {/* Attendance Patterns Chart */}
                {dailyAttendance.length > 0 ? (
                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Monthly Attendance Patterns</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={3} name="Present" />
                        <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} name="Late" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Monthly Attendance Patterns</h3>
                    <div className={styles.chartPlaceholder}>
                      <div style={{ textAlign: 'center' }}>
                        <div className={styles.chartPlaceholderIcon}>📈</div>
                        <p>No pattern data available</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Key Metrics */}
                <div className={styles.metricsContainer}>
                  <h3 className={styles.chartTitle}>Key Monthly Metrics</h3>
                  <div className={styles.metricsList}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Total Sign-ins</span>
                      <span className={`${styles.metricValue} ${styles.metricValueGreen}`}>
                        {summaryStats.totalSignIns}
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Total Sign-outs</span>
                      <span className={`${styles.metricValue} ${styles.metricValueOrange}`}>
                        {summaryStats.totalSignOuts}
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Sign-in Completion</span>
                      <span className={`${styles.metricValue} ${styles.metricValueBlue}`}>
                        {summaryStats.signInPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Sign-out Completion</span>
                      <span className={`${styles.metricValue} ${styles.metricValueOrange}`}>
                        {summaryStats.signOutPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Total Extra Hours</span>
                      <span className={`${styles.metricValue} ${styles.metricValueGreen}`}>
                        {summaryStats.totalExtraHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Average Extra Hours</span>
                      <span className={`${styles.metricValue} ${styles.metricValueBlue}`}>
                        {summaryStats.averageExtraHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Late Arrivals</span>
                      <span className={`${styles.metricValue} ${styles.metricValueRed}`}>
                        {processedData.filter(entry => entry.Late).length}
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>Total Records</span>
                      <span className={`${styles.metricValue} ${styles.metricValueBlue}`}>
                        {summaryStats.totalRecords}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Insights */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>📊 Monthly Insights & Recommendations</h3>
                
                <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', margin: '1rem 0', border: '1px solid #0ea5e9' }}>
                  <h4 style={{ color: '#0c4a6e', marginBottom: '0.5rem', fontSize: '1rem' }}>🎯 Key Findings:</h4>
                  <ul style={{ color: '#0369a1', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                    <li>• <strong>Completion Rate Gap:</strong> {Math.abs(summaryStats.signInPercentage - summaryStats.signOutPercentage).toFixed(1)}% difference between sign-ins and sign-outs</li>
                    <li>• <strong>Extra Hours Impact:</strong> Employees worked {summaryStats.totalExtraHours.toFixed(1)} extra hours total ({summaryStats.averageExtraHours.toFixed(1)}h average per record)</li>
                    <li>• <strong>Punctuality Rate:</strong> {summaryStats.totalSignIns > 0 ? (100 - (processedData.filter(entry => entry.Late).length / summaryStats.totalSignIns) * 100).toFixed(1) : 0}% on-time arrival rate</li>
                    <li>• <strong>Most Active Day:</strong> {dailyAttendance.length > 0 ? 
                      dailyAttendance.reduce((max, day) => (day.signIns + day.signOuts) > (max.signIns + max.signOuts) ? day : max, dailyAttendance[0]).displayDate : 'No data'} (highest activity)</li>
                    <li>• <strong>Department Coverage:</strong> {departmentData.length} departments with {summaryStats.totalEmployees} total employees tracked</li>
                  </ul>
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #22c55e' }}>
                  <h4 style={{ color: '#14532d', marginBottom: '0.5rem', fontSize: '1rem' }}>💡 Actionable Recommendations:</h4>
                  <ul style={{ color: '#166534', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                    <li>• {summaryStats.signOutPercentage < 80 ? 
                      '🔔 Implement automated sign-out reminders to improve completion rates' : 
                      '✅ Excellent sign-out completion rate - maintain current processes'}</li>
                    <li>• {summaryStats.totalExtraHours > summaryStats.totalRecords * 0.5 ? 
                      '⚠️ High extra hours detected - consider workload redistribution or staffing adjustments' : 
                      '✅ Extra hours within reasonable limits'}</li>
                    <li>• {(processedData.filter(entry => entry.Late).length / summaryStats.totalSignIns) > 0.15 ? 
                      '🕘 Consider flexible start times or transportation support to reduce late arrivals' : 
                      '✅ Good punctuality levels maintained'}</li>
                    <li>• 📊 Generate individual employee reports for personalized performance discussions</li>
                    <li>• 📈 Set up monthly trend tracking to identify patterns and seasonal variations</li>
                  </ul>
                </div>

                {/* Performance Summary */}
                <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: '0.5rem', border: '1px solid #eab308', marginTop: '1rem' }}>
                  <h4 style={{ color: '#92400e', marginBottom: '0.5rem', fontSize: '1rem' }}>⭐ Performance Summary:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: '#a16207', fontSize: '0.875rem' }}>
                    <div>
                      <strong>Attendance Quality:</strong><br/>
                      {summaryStats.signInPercentage > 90 && summaryStats.signOutPercentage > 80 ? '🟢 Excellent' : 
                       summaryStats.signInPercentage > 75 && summaryStats.signOutPercentage > 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                    </div>
                    <div>
                      <strong>Punctuality Level:</strong><br/>
                      {(processedData.filter(entry => entry.Late).length / summaryStats.totalSignIns) < 0.1 ? '🟢 Excellent' :
                       (processedData.filter(entry => entry.Late).length / summaryStats.totalSignIns) < 0.2 ? '🟡 Good' : '🔴 Needs Attention'}
                    </div>
                    <div>
                      <strong>Data Completeness:</strong><br/>
                      {summaryStats.totalRecords > summaryStats.totalEmployees * 15 ? '🟢 Comprehensive' :
                       summaryStats.totalRecords > summaryStats.totalEmployees * 8 ? '🟡 Adequate' : '🔴 Limited'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;