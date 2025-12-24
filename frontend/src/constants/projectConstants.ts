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
    "MERN Stack (MongoDB, Express.js, React, Node.js)",
    "MEAN Stack (MongoDB, Express.js, Angular, Node.js)",
    "MVC Stack (MongoDB, Express.js, Vue.js, Node.js)",
    "LAMP Stack (Linux, Apache, MySQL, PHP)",
    "AWS",
    "Google Cloud",
    "Azure",
    "Firebase",
    "Docker",
    "Kubernetes", "GitHub",
    "Git",
    "React",
    "Node.js",
    "Python",
    "Django",
    "Flask",
    "Android",
    "Flutter",
    "Java",
    "Spring Boot",
    "iOS",
];

export const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-yellow-100 text-yellow-700',
    in_bidding: 'bg-blue-100 text-blue-700',
    bidding: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    disputed: 'bg-orange-100 text-orange-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    hold: 'bg-orange-100 text-orange-700',
    open: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-700',
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
    hold: 'Hold',
    open: 'Open',
    closed: 'Closed',
};

// Client action permissions by status
export const clientAllowedTransitions: Record<string, string[]> = {
    draft: ['active'],                    // Can post project
    active: ['hold', 'cancelled'],         // While pending review, only hold or cancel
    in_bidding: ['hold', 'cancelled'],         // While in bidding, only hold or cancel
    assigned: ['hold', 'cancelled'],         // Once assigned, only hold or cancel
    in_progress: ['hold', 'cancelled'],         // During progress, only hold or cancel
    hold: ['in_progress', 'cancelled'],  // Resume from hold or cancel
    completed: [],                            // No transitions allowed once completed
    cancelled: []                             // No transitions allowed once cancelled
};

// Statuses that require a remark/reason
export const statusNeedsRemark = new Set(['cancelled', 'hold']);
