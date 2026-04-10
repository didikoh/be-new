export interface Event {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    image: '/assets/gallery1.jpg',
    title: 'New Year Party',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    link: 'https://github.com/Rel1cx',
  },
  {
    id: '2',
    image: '/assets/gallery2.jpg',
    title: 'Hackathon',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    link: 'https://github.com/Rel1cx',
  },
  {
    id: '3',
    image: '/assets/gallery3.jpg',
    title: 'Charity Run',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    link: 'https://github.com/Rel1cx',
  },
  {
    id: '4',
    image: '/assets/gallery3.jpg',
    title: 'Conference',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    link: 'https://github.com/Rel1cx',
  },
];
