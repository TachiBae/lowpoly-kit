import type {PersonSpec} from './types';

// Example characters showing what the generator can make. Copy one and change
// a few fields to cast a new story.
export const examples: PersonSpec[] = [
  {
    name: 'scientist',
    skin: '#C98E66',
    hair: {style: 'bun', color: '#2B1D16'},
    outfit: {style: 'labCoat', main: '#F2F2EE', inner: '#5B7BD9', pants: '#2B3245'},
    accessories: {glasses: 'round', glassesColor: '#1C1C20', badge: '#3FD0E0'},
  },
  {
    name: 'student',
    skin: '#F6D3B3',
    hair: {style: 'curly', color: '#5A3220'},
    outfit: {style: 'hoodie', main: '#FF8A3D', inner: '#222', pants: '#30364A', accent: '#FFFFFF'},
  },
  {
    name: 'officer',
    skin: '#6B4430',
    hair: {style: 'buzz', color: '#141414'},
    outfit: {style: 'uniform', main: '#2F4A7A', inner: '#E8E8E8', pants: '#1E2C4A', accent: '#C9973E'},
    accessories: {hat: 'cap', hatColor: '#1E2C4A', badge: '#E8B04B'},
  },
  {
    name: 'anchor',
    skin: '#E8B48F',
    hair: {style: 'bob', color: '#8A4B2A'},
    outfit: {style: 'suit', main: '#7B5CFF', inner: '#F4F1EA', pants: '#2A2340', accent: '#FFC233'},
    accessories: {headset: true},
  },
  {
    name: 'astronaut',
    skin: '#F0C7A4',
    hair: {style: 'buzz', color: '#6B4A2A'},
    outfit: {style: 'spacesuit', main: '#ECEDEF', inner: '#ECEDEF', pants: '#ECEDEF', accent: '#9AA3B5', shoes: '#9AA3B5'},
  },
  {
    name: 'worker',
    skin: '#9A6444',
    hair: {style: 'long', color: '#1A1412'},
    outfit: {style: 'tee', main: '#39E58C', inner: '#39E58C', pants: '#3A4A6A'},
    accessories: {hat: 'hardhat', hatColor: '#FFC233'},
  },
  {
    name: 'chef',
    skin: '#E8B48F',
    hair: {style: 'topknot', color: '#3A2418'},
    outfit: {style: 'chef', main: '#F4F1EA', inner: '#F4F1EA', pants: '#5F6B82', accent: '#FF8A2B'},
    accessories: {hat: 'chef', hatColor: '#FFFFFF'},
    face: {noseStyle: 'button', freckles: true},
  },
  {
    name: 'kid',
    skin: '#C98E66',
    hair: {style: 'pigtails', color: '#2B1D16'},
    outfit: {style: 'overalls', main: '#FF6FA8', inner: '#FFC83D', pants: '#33C9E8', accent: '#8B6CF2'},
    build: {height: 0.85, head: 1.05},
    face: {noseStyle: 'button', freckles: true},
  },
  {
    name: 'skater',
    skin: '#F6D3B3',
    hair: {style: 'mohawk', color: '#8B6CF2'},
    outfit: {style: 'vest', main: '#33C9E8', inner: '#FFFFFF', pants: '#5F6B82', accent: '#FF8A2B'},
    accessories: {headset: false},
  },
  {
    name: 'professor',
    skin: '#9A6444',
    hair: {style: 'afro', color: '#EDEDED'},
    outfit: {style: 'sweater', main: '#A8B84A', inner: '#F4F1EA', pants: '#7E6A4A'},
    accessories: {glasses: 'round', glassesColor: '#3A3F63'},
    face: {noseStyle: 'long'},
  },
  {
    name: 'rainWalker',
    skin: '#E8B48F',
    hair: {style: 'ponytail', color: '#C58A4E'},
    outfit: {style: 'raincoat', main: '#FFC83D', inner: '#FFFFFF', pants: '#3A3F63', shoes: '#FF6FA8'},
    accessories: {hat: 'beanie', hatColor: '#FF6FA8'},
  },
  {
    name: 'reporterDay',
    skin: '#6B4430',
    hair: {style: 'sidePart', color: '#141414'},
    outfit: {style: 'dress', main: '#8B6CF2', inner: '#FFFFFF', pants: '#3A3F63', accent: '#FFC83D'},
    accessories: {headset: true},
  },
];
