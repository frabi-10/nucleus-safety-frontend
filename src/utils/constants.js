// Form types
export const FORM_TYPES = [
  { value: 'SIR', label: 'Safety Incident Report', icon: 'AlertTriangle' },
  { value: 'JHA', label: 'Job Hazard Analysis', icon: 'Shield' },
  { value: 'KAIZEN', label: 'Process Improvement (Kaizen)', icon: 'Lightbulb' },
];

// Location data
export const LOCATIONS = {
  'Building 908': {
    'Common Areas': ['Kitchen', 'Cubicles', 'CR1', 'CR2'],
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
    'Common Areas': ['Kitchen', 'Cubicles', 'CR1', 'CR2'],
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

// JHA-specific constants
export const JHA_HAZARD_TYPES = [
  { value: 'chemical_exposure', label: 'Chemical Exposure' },
  { value: 'slip_trip_fall', label: 'Slip/Trip/Fall' },
  { value: 'ergonomic', label: 'Ergonomic Hazard' },
  { value: 'electrical', label: 'Electrical Hazard' },
  { value: 'mechanical', label: 'Mechanical Hazard' },
  { value: 'thermal', label: 'Thermal Hazard (Hot/Cold)' },
  { value: 'noise', label: 'Noise/Vibration' },
  { value: 'biological', label: 'Biological Hazard' },
  { value: 'confined_space', label: 'Confined Space' },
  { value: 'other', label: 'Other' },
];

export const JHA_CONTROL_MEASURES = [
  { value: 'ppe_required', label: 'PPE Required' },
  { value: 'engineering_controls', label: 'Engineering Controls' },
  { value: 'administrative_controls', label: 'Administrative Controls' },
  { value: 'ventilation', label: 'Ventilation/Exhaust' },
  { value: 'machine_guarding', label: 'Machine Guarding' },
  { value: 'lockout_tagout', label: 'Lockout/Tagout' },
  { value: 'training_required', label: 'Training Required' },
  { value: 'monitoring', label: 'Monitoring/Testing' },
];

export const JHA_RISK_LEVELS = [
  { value: 'Low', label: 'Low Risk' },
  { value: 'Medium', label: 'Medium Risk' },
  { value: 'High', label: 'High Risk' },
  { value: 'Extreme', label: 'Extreme Risk' },
];

// Kaizen-specific constants
export const KAIZEN_CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'Batch Records', label: 'Batch Records' },
  { value: 'Process', label: 'Process' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Quality', label: 'Quality' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Efficiency', label: 'Efficiency' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Other', label: 'Other' },
];

export const KAIZEN_EXPECTED_BENEFITS = [
  { value: 'time_savings', label: 'Time Savings' },
  { value: 'cost_reduction', label: 'Cost Reduction' },
  { value: 'quality_improvement', label: 'Quality Improvement' },
  { value: 'safety_improvement', label: 'Safety Improvement' },
  { value: 'waste_reduction', label: 'Waste Reduction' },
  { value: 'process_simplification', label: 'Process Simplification' },
  { value: 'better_documentation', label: 'Better Documentation' },
];

export const KAIZEN_IMPLEMENTATION_COST = [
  { value: 'Free', label: 'Free (No Cost)' },
  { value: 'Low', label: 'Low (<$500)' },
  { value: 'Medium', label: 'Medium ($500-$5000)' },
  { value: 'High', label: 'High (>$5000)' },
];
