// Location data
export const LOCATIONS = {
  'Building 908': {
    'Warehouse': [],
    'Clean Room': [
      'Common Area',
      'L1',
      'L2',
      'L3',
      'L4',
      'CP1',
      'CP2',
      'Powder Dispense Common Room',
      'Powder Dispense 1',
      'Powder Dispense 2',
      'Powder Dispense 3',
      'Powder Dispense 4',
      'Chemspeed Room',
    ],
  },
  'Building 929': {
    'Sapphire': [],
    'Warehouse': [],
    'Cleanroom': [],
  },
};

// Report types
export const REPORT_TYPES = [
  { value: '', label: 'Select Type' },
  { value: 'Near Miss', label: 'Near Miss' },
  { value: 'Injury', label: 'Injury/Illness' },
  { value: 'Equipment Issue', label: 'Equipment Issue' },
  { value: 'Spill', label: 'Spill/Release' },
  { value: 'Fire Hazard', label: 'Fire Hazard' },
  { value: 'Safety Observation', label: 'Safety Observation' },
  { value: 'Other', label: 'Other' },
];

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

// Status types
export const STATUS_TYPES = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

// Status colors for badges
export const STATUS_COLORS = {
  Open: 'error',
  'In Progress': 'warning',
  Resolved: 'success',
  Closed: 'gray',
};

// Priority colors for badges
export const PRIORITY_COLORS = {
  Low: 'info',
  Medium: 'warning',
  High: 'error',
  Critical: 'error',
};

// Immediate actions options
export const IMMEDIATE_ACTIONS = [
  { value: 'area_secured', label: 'Area secured/cordoned off' },
  { value: 'supervisor_notified', label: 'Supervisor notified' },
  { value: 'equipment_shutdown', label: 'Equipment shut down' },
  { value: 'first_aid', label: 'First aid administered' },
  { value: 'emergency_services', label: 'Emergency services called' },
  { value: 'photos_taken', label: 'Photos taken' },
];
