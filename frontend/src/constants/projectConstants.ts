export const categories = [
  'Web Development',
  'Mobile Development',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'UI/UX Design',
  'DevOps',
  'AI/ML',
  'Blockchain',
  'Cloud Architecture',
];

export const projectTypes = [
  { value: 'from_scratch', label: 'From Scratch', description: 'Starting a new project from the beginning' },
  { value: 'ongoing', label: 'Ongoing Project', description: 'Adding features or improvements to an existing project' },
];

export const projectPriorities = [
  { value: 'low', label: 'Low', description: 'Flexible timeline, no rush' },
  { value: 'medium', label: 'Medium', description: 'Standard timeline, normal priority' },
  { value: 'high', label: 'High', description: 'Urgent, needs quick turnaround' },
];

export const commonSkills = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'React Native', 'Vue.js', 'Angular', 'Django', 'Flask',
  'GraphQL', 'REST API', 'Git', 'CI/CD', 'Testing',
];

export const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-yellow-100 text-yellow-700',
  in_bidding: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  disputed: 'bg-orange-100 text-orange-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
};

export const statusLabels = {
  draft: 'Draft',
  active: 'Pending Review',
  in_bidding: 'In Bidding',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  disputed: 'Disputed',
  pending_review: 'Pending Review',
};

