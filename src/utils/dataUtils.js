/**
 * Data processing utilities for attendance dashboard
 */

/**
 * Calculate attendance percentage for a specific action type
 * @param {Array} data - Raw attendance data
 * @param {string} actionType - 'Sign In' or 'Sign Out'
 * @returns {number} - Percentage value
 */
export const calculatePercentage = (data, actionType) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0;
    }
    
    const filteredData = data.filter(entry => 
      entry.Action && entry.Action.toLowerCase().includes(actionType.toLowerCase())
    );
    
    return (filteredData.length / data.length) * 100;
  };
  
  /**
   * Aggregate sign-in and sign-out data
   * @param {Array} data - Raw attendance data
   * @returns {Object} - Object with signIns and signOuts counts
   */
  export const aggregateSignInData = (data) => {
    if (!data || !Array.isArray(data)) {
      return { signIns: 0, signOuts: 0 };
    }
    
    const signIns = data.filter(entry => 
      entry.Action && entry.Action.toLowerCase().includes('sign in')
    ).length;
    
    const signOuts = data.filter(entry => 
      entry.Action && entry.Action.toLowerCase().includes('sign out')
    ).length;
    
    return { signIns, signOuts };
  };
  
  /**
   * Get unique staff names from data
   * @param {Array} data - Raw attendance data
   * @returns {Array} - Array of unique staff names
   */
  export const getUniqueStaffNames = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    const uniqueNames = [...new Set(
      data.map(entry => entry.Name)
        .filter(name => name && name.trim() !== '')
    )];
    
    return uniqueNames.sort();
  };
  
  /**
   * Filter data by staff name
   * @param {Array} data - Raw attendance data
   * @param {string} staffName - Name of staff member
   * @returns {Array} - Filtered data for specific staff
   */
  export const getStaffData = (data, staffName) => {
    if (!data || !Array.isArray(data) || !staffName) {
      return [];
    }
    
    return data.filter(entry => entry.Name === staffName);
  };
  
  /**
   * Process attendance data for charts
   * @param {Array} data - Raw attendance data
   * @returns {Array} - Processed data for charts
   */
  export const processAttendanceForCharts = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
  
    // Group by date and count actions
    const attendanceByDate = {};
    
    data.forEach(entry => {
      if (!entry.Date || !entry.Action) return;
      
      let date;
      try {
        // Handle different date formats
        if (entry.Date instanceof Date) {
          date = entry.Date.toISOString().split('T')[0];
        } else {
          date = new Date(entry.Date).toISOString().split('T')[0];
        }
      } catch (error) {
        return; // Skip invalid dates
      }
      
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = { date, signIns: 0, signOuts: 0, present: 0, late: 0 };
      }
      
      if (entry.Action.toLowerCase().includes('sign in')) {
        attendanceByDate[date].signIns += 1;
        
        // Check if late (after 9:00 AM)
        const time = entry.Time || '09:00';
        const [hours, minutes] = time.split(':').map(Number);
        const isLate = hours > 9 || (hours === 9 && minutes > 0);
        
        if (isLate) {
          attendanceByDate[date].late += 1;
        } else {
          attendanceByDate[date].present += 1;
        }
      } else if (entry.Action.toLowerCase().includes('sign out')) {
        attendanceByDate[date].signOuts += 1;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(attendanceByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };
  
  /**
   * Process data for weekly attendance chart
   * @param {Array} data - Raw attendance data
   * @returns {Array} - Weekly attendance data
   */
  export const processWeeklyAttendance = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
  
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = weekDays.map(day => ({
      name: day,
      present: 0,
      absent: 0,
      late: 0
    }));
  
    // Get employees who have signed in each day
    const employeesPerDay = {};
    const allEmployees = getUniqueStaffNames(data);
    
    data.forEach(entry => {
      if (!entry.Date || !entry.Name || !entry.Action) return;
      
      try {
        const date = new Date(entry.Date);
        const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0, Tue=1, etc.
        const dayName = weekDays[dayIndex];
        
        if (!employeesPerDay[dayName]) {
          employeesPerDay[dayName] = new Set();
        }
        
        if (entry.Action.toLowerCase().includes('sign in')) {
          employeesPerDay[dayName].add(entry.Name);
          
          // Check if late
          const time = entry.Time || '09:00';
          const [hours, minutes] = time.split(':').map(Number);
          const isLate = hours > 9 || (hours === 9 && minutes > 0);
          
          const weeklyEntry = weeklyData[dayIndex];
          if (isLate) {
            weeklyEntry.late += 1;
          } else {
            weeklyEntry.present += 1;
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    });
    
    // Calculate absent employees for each day
    weeklyData.forEach((dayData, index) => {
      const dayName = weekDays[index];
      const presentEmployees = employeesPerDay[dayName] || new Set();
      dayData.absent = Math.max(0, allEmployees.length - presentEmployees.size);
    });
  
    return weeklyData;
  };
  
  /**
   * Process department distribution data
   * @param {Array} data - Raw attendance data
   * @returns {Array} - Department distribution data
   */
  export const processDepartmentData = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
  
    const departmentCounts = {};
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];
  
    // Count unique employees per department
    const employeesByDepartment = {};
    
    data.forEach(entry => {
      if (entry.Department && entry.Name && entry.Action?.toLowerCase().includes('sign in')) {
        if (!employeesByDepartment[entry.Department]) {
          employeesByDepartment[entry.Department] = new Set();
        }
        employeesByDepartment[entry.Department].add(entry.Name);
      }
    });
  
    // Convert to array with colors
    return Object.entries(employeesByDepartment).map(([department, employees], index) => ({
      name: department,
      value: employees.size,
      color: colors[index % colors.length]
    }));
  };
  
  /**
   * Calculate summary statistics
   * @param {Array} data - Raw attendance data
   * @returns {Object} - Summary statistics
   */
  export const calculateSummaryStats = (data) => {
    if (!data || !Array.isArray(data)) {
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        attendanceRate: 0
      };
    }
  
    const uniqueEmployees = getUniqueStaffNames(data);
    const totalEmployees = uniqueEmployees.length;
    
    // Get today's data (for demo, use the latest date in data)
    const dates = data.map(entry => {
      try {
        return new Date(entry.Date);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
    const todayStr = latestDate.toISOString().split('T')[0];
    
    const todayData = data.filter(entry => {
      try {
        const entryDate = new Date(entry.Date).toISOString().split('T')[0];
        return entryDate === todayStr && entry.Action?.toLowerCase().includes('sign in');
      } catch {
        return false;
      }
    });
  
    let presentToday = 0;
    let lateToday = 0;
  
    todayData.forEach(entry => {
      const time = entry.Time || '09:00';
      const [hours, minutes] = time.split(':').map(Number);
      const isLate = hours > 9 || (hours === 9 && minutes > 0);
      
      if (isLate) {
        lateToday += 1;
      } else {
        presentToday += 1;
      }
    });
  
    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday);
    const attendanceRate = totalEmployees > 0 ? ((presentToday + lateToday) / totalEmployees) * 100 : 0;
  
    return {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      attendanceRate
    };
  };
  
  /**
   * Format time string
   * @param {string} timeStr - Time string in various formats
   * @returns {string} - Formatted time string (HH:MM)
   */
  export const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    
    try {
      // Handle Excel time format (decimal)
      if (typeof timeStr === 'number') {
        const totalMinutes = Math.round(timeStr * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      // Handle string format
      if (typeof timeStr === 'string') {
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
      }
      
      return timeStr;
    } catch (error) {
      return '--:--';
    }
  };
  
  /**
   * Format date string
   * @param {string|Date} dateStr - Date string or Date object
   * @returns {string} - Formatted date string (YYYY-MM-DD)
   */
  export const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '--';
    }
  };