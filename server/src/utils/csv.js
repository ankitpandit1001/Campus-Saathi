function sanitizeForCsv(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).trim();
  // Prevent CSV Formula Injection
  if (/^[=\+\-@\t\r]/.test(stringValue)) {
    return `'${stringValue}`;
  }
  return stringValue;
}

export function formatComplaintsAsCsv(complaints) {
  const headers = [
    'Complaint ID',
    'Title',
    'Category',
    'Location',
    'Room',
    'Priority',
    'Status',
    'Student Name',
    'Student Email',
    'Student ID',
    'Assigned Staff',
    'Created At',
    'Resolved At',
  ];

  const rows = complaints.map((c) => {
    const assignedStaff = c.assignments && c.assignments.length > 0 && c.assignments[0].staff
      ? c.assignments[0].staff.name
      : 'Unassigned';

    return [
      sanitizeForCsv(c.complaintNumber),
      sanitizeForCsv(c.title),
      sanitizeForCsv(c.category ? c.category.name : ''),
      sanitizeForCsv(c.location),
      sanitizeForCsv(c.roomNumber || 'N/A'),
      sanitizeForCsv(c.priority),
      sanitizeForCsv(c.status),
      sanitizeForCsv(c.student ? c.student.name : ''),
      sanitizeForCsv(c.student ? c.student.email : ''),
      sanitizeForCsv(c.student ? c.student.studentId || 'N/A' : 'N/A'),
      sanitizeForCsv(assignedStaff),
      sanitizeForCsv(c.createdAt ? new Date(c.createdAt).toISOString() : ''),
      sanitizeForCsv(c.resolvedAt ? new Date(c.resolvedAt).toISOString() : 'N/A'),
    ];
  });

  const escapeCell = (cell) => {
    const escaped = cell.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  return csvContent;
}
