/**
 * Constants used throughout the attendance dashboard
 */

// Chart colors
export const CHART_COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1'
  };
  
  // Status colors
  export const STATUS_COLORS = {
    present: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300'
    },
    late: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300'
    },
    absent: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300'
    }
  };
  
  // Department colors for charts
  export const DEPARTMENT_COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#8DD1E1',
    '#D084D0',
    '#FFCD56'
  ];
  
  // Time constants
  export const TIME_CONSTANTS = {
    WORK_START_HOUR: 9,
    WORK_START_MINUTE: 0,
    WORK_END_HOUR: 17,
    WORK_END_MINUTE: 30,
    LATE_THRESHOLD_MINUTES: 0 // Any time after 9:00 is considered late
  };
  
  // Date format constants
  export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    TIME: 'HH:mm'
  };
  
  // Dashboard tabs
  export const DASHBOARD_TABS = [
    { id: 'overview', label: 'Overview', icon: 'TrendingUp' },
    { id: 'employees', label: 'Employees', icon: 'Users' },
    { id: 'reports', label: 'Reports', icon: 'Calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'Clock' }
  ];
  
  // Sample data for fallback
  export const SAMPLE_DATA = [
    { Date: '2024-01-15', Name: 'John Doe', Action: 'Sign In', Time: '09:00', Department: 'IT' },
    { Date: '2024-01-15', Name: 'Jane Smith', Action: 'Sign In', Time: '08:45', Department: 'HR' },
    { Date: '2024-01-15', Name: 'Michael Johnson', Action: 'Sign In', Time: '09:15', Department: 'Finance' },
    { Date: '2024-01-15', Name: 'Sarah Wilson', Action: 'Sign In', Time: '08:55', Department: 'Marketing' },
    { Date: '2024-01-15', Name: 'David Brown', Action: 'Sign In', Time: '09:30', Department: 'Operations' },
    { Date: '2024-01-15', Name: 'Emily Davis', Action: 'Sign In', Time: '08:50', Department: 'IT' },
    { Date: '2024-01-15', Name: 'Robert Miller', Action: 'Sign In', Time: '09:20', Department: 'HR' },
    { Date: '2024-01-15', Name: 'Lisa Anderson', Action: 'Sign In', Time: '08:40', Department: 'Finance' },
    { Date: '2024-01-15', Name: 'John Doe', Action: 'Sign Out', Time: '17:30', Department: 'IT' },
    { Date: '2024-01-15', Name: 'Jane Smith', Action: 'Sign Out', Time: '17:00', Department: 'HR' },
    { Date: '2024-01-15', Name: 'Michael Johnson', Action: 'Sign Out', Time: '17:45', Department: 'Finance' },
    { Date: '2024-01-15', Name: 'Sarah Wilson', Action: 'Sign Out', Time: '17:15', Department: 'Marketing' },
    { Date: '2024-01-15', Name: 'David Brown', Action: 'Sign Out', Time: '18:00', Department: 'Operations' },
    { Date: '2024-01-15', Name: 'Emily Davis', Action: 'Sign Out', Time: '17:20', Department: 'IT' },
    { Date: '2024-01-15', Name: 'Robert Miller', Action: 'Sign Out', Time: '17:10', Department: 'HR' },
    { Date: '2024-01-15', Name: 'Lisa Anderson', Action: 'Sign Out', Time: '17:35', Department: 'Finance' },
  
    // Tuesday data
    { Date: '2024-01-16', Name: 'John Doe', Action: 'Sign In', Time: '08:50', Department: 'IT' },
    { Date: '2024-01-16', Name: 'Jane Smith', Action: 'Sign In', Time: '09:05', Department: 'HR' },
    { Date: '2024-01-16', Name: 'Michael Johnson', Action: 'Sign In', Time: '08:45', Department: 'Finance' },
    { Date: '2024-01-16', Name: 'Sarah Wilson', Action: 'Sign In', Time: '09:20', Department: 'Marketing' },
    { Date: '2024-01-16', Name: 'David Brown', Action: 'Sign In', Time: '08:55', Department: 'Operations' },
    { Date: '2024-01-16', Name: 'Emily Davis', Action: 'Sign In', Time: '09:10', Department: 'IT' },
    { Date: '2024-01-16', Name: 'Robert Miller', Action: 'Sign In', Time: '08:40', Department: 'HR' },
    { Date: '2024-01-16', Name: 'John Doe', Action: 'Sign Out', Time: '17:25', Department: 'IT' },
    { Date: '2024-01-16', Name: 'Jane Smith', Action: 'Sign Out', Time: '17:05', Department: 'HR' },
    { Date: '2024-01-16', Name: 'Michael Johnson', Action: 'Sign Out', Time: '17:40', Department: 'Finance' },
    { Date: '2024-01-16', Name: 'Sarah Wilson', Action: 'Sign Out', Time: '17:30', Department: 'Marketing' },
  
    // Wednesday data
    { Date: '2024-01-17', Name: 'John Doe', Action: 'Sign In', Time: '09:10', Department: 'IT' },
    { Date: '2024-01-17', Name: 'Jane Smith', Action: 'Sign In', Time: '08:40', Department: 'HR' },
    { Date: '2024-01-17', Name: 'Michael Johnson', Action: 'Sign In', Time: '09:25', Department: 'Finance' },
    { Date: '2024-01-17', Name: 'David Brown', Action: 'Sign In', Time: '09:00', Department: 'Operations' },
    { Date: '2024-01-17', Name: 'Emily Davis', Action: 'Sign In', Time: '08:35', Department: 'IT' },
    { Date: '2024-01-17', Name: 'Robert Miller', Action: 'Sign In', Time: '09:15', Department: 'HR' },
    { Date: '2024-01-17', Name: 'Lisa Anderson', Action: 'Sign In', Time: '08:50', Department: 'Finance' },
    { Date: '2024-01-17', Name: 'John Doe', Action: 'Sign Out', Time: '17:15', Department: 'IT' },
    { Date: '2024-01-17', Name: 'Jane Smith', Action: 'Sign Out', Time: '17:00', Department: 'HR' },
  
    // Thursday data
    { Date: '2024-01-18', Name: 'John Doe', Action: 'Sign In', Time: '08:45', Department: 'IT' },
    { Date: '2024-01-18', Name: 'Jane Smith', Action: 'Sign In', Time: '08:50', Department: 'HR' },
    { Date: '2024-01-18', Name: 'Michael Johnson', Action: 'Sign In', Time: '08:55', Department: 'Finance' },
    { Date: '2024-01-18', Name: 'Sarah Wilson', Action: 'Sign In', Time: '09:05', Department: 'Marketing' },
    { Date: '2024-01-18', Name: 'David Brown', Action: 'Sign In', Time: '08:40', Department: 'Operations' },
    { Date: '2024-01-18', Name: 'Emily Davis', Action: 'Sign In', Time: '08:55', Department: 'IT' },
    { Date: '2024-01-18', Name: 'Robert Miller', Action: 'Sign In', Time: '09:00', Department: 'HR' },
    { Date: '2024-01-18', Name: 'Lisa Anderson', Action: 'Sign In', Time: '08:45', Department: 'Finance' },
  
    // Friday data
    { Date: '2024-01-19', Name: 'John Doe', Action: 'Sign In', Time: '09:05', Department: 'IT' },
    { Date: '2024-01-19', Name: 'Jane Smith', Action: 'Sign In', Time: '08:55', Department: 'HR' },
    { Date: '2024-01-19', Name: 'Michael Johnson', Action: 'Sign In', Time: '09:10', Department: 'Finance' },
    { Date: '2024-01-19', Name: 'Sarah Wilson', Action: 'Sign In', Time: '08:45', Department: 'Marketing' },
    { Date: '2024-01-19', Name: 'David Brown', Action: 'Sign In', Time: '09:15', Department: 'Operations' },
    { Date: '2024-01-19', Name: 'Emily Davis', Action: 'Sign In', Time: '08:50', Department: 'IT' },
    { Date: '2024-01-19', Name: 'John Doe', Action: 'Sign Out', Time: '17:00', Department: 'IT' },
    { Date: '2024-01-19', Name: 'Jane Smith', Action: 'Sign Out', Time: '16:55', Department: 'HR' }
  ];
  
  // Report types
  export const REPORT_TYPES = [
    {
      id: 'daily',
      title: 'Daily Attendance Report',
      description: 'Generate and download daily attendance report',
      icon: 'Calendar'
    },
    {
      id: 'weekly',
      title: 'Weekly Summary Report',
      description: 'Generate and download weekly summary report',
      icon: 'BarChart'
    },
    {
      id: 'monthly',
      title: 'Monthly Analysis Report',
      description: 'Generate and download monthly analysis report',
      icon: 'TrendingUp'
    },
    {
      id: 'employee',
      title: 'Employee Performance Report',
      description: 'Generate and download employee performance report',
      icon: 'Users'
    },
    {
      id: 'department',
      title: 'Department Wise Report',
      description: 'Generate and download department wise report',
      icon: 'Building'
    },
    {
      id: 'late',
      title: 'Late Arrival Report',
      description: 'Generate and download late arrival report',
      icon: 'Clock'
    }
  ];
  
  // Chart configuration
  export const CHART_CONFIG = {
    bar: {
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      height: 300
    },
    line: {
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      height: 400
    },
    pie: {
      height: 300,
      outerRadius: 80,
      innerRadius: 0
    }
  };
  
  // Error messages
  export const ERROR_MESSAGES = {
    FILE_NOT_FOUND: 'Attendance file not found. Please ensure attendance.xlsx is in the public folder.',
    FILE_PARSE_ERROR: 'Error parsing the Excel file. Please check the file format.',
    NO_DATA: 'No attendance data found in the file.',
    NETWORK_ERROR: 'Network error occurred while loading the file.',
    UNKNOWN_ERROR: 'An unexpected error occurred.'
  };
  
  // Success messages
  export const SUCCESS_MESSAGES = {
    DATA_LOADED: 'Attendance data loaded successfully',
    FILE_EXPORTED: 'File exported successfully',
    REPORT_GENERATED: 'Report generated successfully'
  };
  
  // Loading messages
  export const LOADING_MESSAGES = {
    LOADING_DATA: 'Loading attendance data...',
    PROCESSING_DATA: 'Processing attendance records...',
    GENERATING_REPORT: 'Generating report...',
    EXPORTING_FILE: 'Exporting file...'
  };
  
  // Date range options
  export const DATE_RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  // Employee status types
  export const EMPLOYEE_STATUS = {
    PRESENT: 'present',
    LATE: 'late',
    ABSENT: 'absent',
    ON_LEAVE: 'on_leave'
  };
  
  // Work time configuration
  export const WORK_TIME_CONFIG = {
    STANDARD_HOURS: 8,
    BREAK_DURATION: 1, // hours
    OVERTIME_THRESHOLD: 8, // hours
    EARLY_DEPARTURE_THRESHOLD: 30 // minutes before end time
  };
  
  // Dashboard refresh intervals (in milliseconds)
  export const REFRESH_INTERVALS = {
    REAL_TIME: 30000,    // 30 seconds
    FREQUENT: 300000,    // 5 minutes
    NORMAL: 900000,      // 15 minutes
    SLOW: 1800000        // 30 minutes
  };
  
  // File upload constraints
  export const FILE_CONSTRAINTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.csv'],
    MAX_ROWS: 10000
  };
  
  // Pagination settings
  export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 15,
    PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
    MAX_VISIBLE_PAGES: 5
  };
  
  // Animation durations (in milliseconds)
  export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  };
  
  // Notification types
  export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  };
  
  // Local storage keys
  export const STORAGE_KEYS = {
    USER_PREFERENCES: 'attendance_user_preferences',
    DASHBOARD_FILTERS: 'attendance_dashboard_filters',
    SELECTED_DATE_RANGE: 'attendance_selected_date_range',
    TABLE_PAGINATION: 'attendance_table_pagination'
  };
  
  // API endpoints (for future backend integration)
  export const API_ENDPOINTS = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    ATTENDANCE: '/attendance',
    EMPLOYEES: '/employees',
    REPORTS: '/reports',
    ANALYTICS: '/analytics',
    EXPORT: '/export'
  };
  
  // Feature flags (for enabling/disabling features)
  export const FEATURE_FLAGS = {
    REAL_TIME_UPDATES: false,
    ADVANCED_ANALYTICS: true,
    EMPLOYEE_PHOTOS: false,
    EMAIL_NOTIFICATIONS: false,
    MOBILE_APP_SYNC: false
  };
  
  // Theme configuration
  export const THEME_CONFIG = {
    PRIMARY_COLOR: '#3B82F6',
    SECONDARY_COLOR: '#6B7280',
    SUCCESS_COLOR: '#10B981',
    WARNING_COLOR: '#F59E0B',
    ERROR_COLOR: '#EF4444',
    INFO_COLOR: '#06B6D4'
  };
  
  // Export all constants as a single object for convenience
  export const CONSTANTS = {
    CHART_COLORS,
    STATUS_COLORS,
    DEPARTMENT_COLORS,
    TIME_CONSTANTS,
    DATE_FORMATS,
    DASHBOARD_TABS,
    SAMPLE_DATA,
    REPORT_TYPES,
    CHART_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOADING_MESSAGES,
    DATE_RANGE_OPTIONS,
    EMPLOYEE_STATUS,
    WORK_TIME_CONFIG,
    REFRESH_INTERVALS,
    FILE_CONSTRAINTS,
    PAGINATION,
    ANIMATION_DURATIONS,
    NOTIFICATION_TYPES,
    STORAGE_KEYS,
    API_ENDPOINTS,
    FEATURE_FLAGS,
    THEME_CONFIG
  };