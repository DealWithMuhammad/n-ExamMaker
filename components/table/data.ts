export interface Column {
  name: string;
  uid: string;
}

export interface User {
  id: number;
  name: string;
  address: string;
  unhcrId: string;
  status: 'active' | 'paused' | 'vacation';
  age: string;
  avatar: string;
  email: string;
}


export const columns: Column[] = [
   { name: 'NAME', uid: 'name' },
   { name: 'ADDRESS', uid: 'address' },
   { name: 'UNHCR ID', uid: 'unhcrId' },
   { name: 'STATUS', uid: 'status' },
   { name: 'ACTIONS', uid: 'actions' },
];

export const users = [
   {
      id: 1,
      name: 'Ahmed Khan',
      address: 'Golden Villa, 123 Main St, Cairo',
      unhcrId: 'UNHCR-001',
      status: 'active',
      age: '29',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
      email: 'ahmed.khan@example.com',
   },
   {
      id: 2,
      name: 'Fatima Ali',
      address: 'Golden Villa, 456 Elm St, Karachi',
      unhcrId: 'UNHCR-002',
      status: 'paused',
      age: '25',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      email: 'fatima.ali@example.com',
   },
   {
      id: 3,
      name: 'Amina Yusuf',
      address: 'Golden Villa, 789 Oak St, Istanbul',
      unhcrId: 'UNHCR-003',
      status: 'active',
      age: '22',
      avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
      email: 'amina.yusuf@example.com',
   },
   {
      id: 4,
      name: 'Omar Sheikh',
      address: 'Golden Villa, 101 Pine St, Casablanca',
      unhcrId: 'UNHCR-004',
      status: 'vacation',
      age: '28',
      avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
      email: 'omar.sheikh@example.com',
   },
   {
      id: 5,
      name: 'Hassan Abdullah',
      address: 'Golden Villa, 102 Maple St, Dubai',
      unhcrId: 'UNHCR-005',
      status: 'active',
      age: '24',
      avatar: 'https://i.pravatar.cc/150?u=a092581d4ef9026700d',
      email: 'hassan.abdullah@example.com',
   },
   {
      id: 6,
      name: 'Zainab Karim',
      address: 'Golden Villa, 123 Main St, Cairo',
      unhcrId: 'UNHCR-006',
      status: 'active',
      age: '29',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
      email: 'zainab.karim@example.com',
   },
   {
      id: 7,
      name: 'Ali Reza',
      address: 'Golden Villa, 456 Elm St, Karachi',
      unhcrId: 'UNHCR-007',
      status: 'paused',
      age: '25',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      email: 'ali.reza@example.com',
   },
   {
      id: 8,
      name: 'Sana Khan',
      address: 'Golden Villa, 789 Oak St, Istanbul',
      unhcrId: 'UNHCR-008',
      status: 'active',
      age: '22',
      avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
      email: 'sana.khan@example.com',
   },
   {
      id: 9,
      name: 'Yusuf Ahmed',
      address: 'Golden Villa, 101 Pine St, Casablanca',
      unhcrId: 'UNHCR-009',
      status: 'vacation',
      age: '28',
      avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
      email: 'yusuf.ahmed@example.com',
   },
   {
      id: 10,
      name: 'Mariam Hassan',
      address: 'Golden Villa, 102 Maple St, Dubai',
      unhcrId: 'UNHCR-010',
      status: 'active',
      age: '24',
      avatar: 'https://i.pravatar.cc/150?u=a092581d4ef9026700d',
      email: 'mariam.hassan@example.com',
   },
];
