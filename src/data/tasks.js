export const tasks = [
    {
      id: 1,
      name: 'Create all backend APIs',
      noOfSubTasks: 0,
      startDate: '01-05-2025',
      dueDate: '01-05-2025',
      priority: 'Low',
      status: 'To Do',
      dependsOn: '',
      progress: 30,
      expanded: false
    },
    {
      id: 2,
      name: 'Create all backend APIs',
      subTasks: 0,
      startDate: '01-05-2025',
      dueDate: '01-05-2025',
      priority: 'Medium',
      status: 'In Progress', 
      dependsOn: 'Sample Task 2',
      progress: 30,
      expanded: false
    },
    {
      id: 3,
      name: 'Creating UI',
      subTasks: 4,
      startDate: '10-05-2025',
      dueDate: '15-05-2025',
      priority: 'High',
      status: 'Completed', // Completed
      dependsOn: 'Sample Task 3',
      progress: 50,
      expanded: true,
      childTasks: [
        {
          id: 31,
          name: 'Wireframing',
          startDate: '10-05-2025',
          dueDate: '11-05-2025',
          status: 'Completed',
          dependsOn: 'Wireframing'
        },
        {
          id: 32,
          name: 'Designing',
          startDate: '11-05-2025',
          dueDate: '12-05-2025',
          status: 'Completed',
          dependsOn: 'Wireframing'
        },
        {
          id: 33,
          name: 'Integrate Backend & Frontend',
          startDate: '12-05-2025',
          dueDate: '13-05-2025',
          status: 'In Progress', 
          dependsOn: 'Integrate Backend & Frontend'
        },
        {
          id: 34,
          name: 'Final Implementation',
          startDate: '13-05-2025',
          dueDate: '15-05-2025',
          status: 'To Do',
          dependsOn: 'Final Implementation'
        }
      ]
    }
  ];
  