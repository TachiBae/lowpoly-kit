import type {KenneyId} from '../props/kenneyIndex';
import {paletteV2 as P} from '../palette';

/** One placeable item: model id, footprint width in world units AT the given scale, optional scale override. */
export type Item = {id: KenneyId; w: number; scale?: number};
export type SettingId = 'suburb' | 'downtown' | 'airfield' | 'office' | 'newsroom' | 'home';

export type Setting = {
  near: Item[]; // 9-12 units from the camera
  far: Item[]; // 18-30 units
  ground: string; // ground plane colour
  silhouette: string; // horizon card base colour
  horizon: 'hills' | 'skyline';
  /** Props for the mid-ground context ring (Phase D). */
  props: Item[];
  /** Foreground elements (Phase C), scaled by fitHeight. */
  fg: KenneyId[];
};

const sub = (l: string, w = 4.2): Item => ({id: `city-suburban/building-type-${l}` as KenneyId, w, scale: 3.2});
const com = (l: string, w = 2.9): Item => ({id: `city-commercial/building-${l}` as KenneyId, w, scale: 3.2});
const ind = (l: string): Item => ({id: `city-industrial/building-${l}` as KenneyId, w: 4.8, scale: 2.4});
const tree = (n: string, w = 2): Item => ({id: `nature/${n}` as KenneyId, w});

export const settings: Record<SettingId, Setting> = {
  suburb: {
    near: [sub('a'), sub('b'), sub('c'), sub('d'), sub('f'), sub('h'), tree('tree_oak'), tree('tree_default'), tree('tree_detailed'), tree('plant_bushLarge', 1.6)],
    far: [sub('e'), sub('g'), sub('k'), sub('m'), tree('tree_tall', 2), tree('tree_fat', 2.4)],
    ground: P.grass, silhouette: '#8FA36A', horizon: 'hills',
    props: [
      {id: 'holiday/bench', w: 1.4}, {id: 'holiday/lantern', w: 0.6}, {id: 'nature/sign', w: 0.8},
      {id: 'survival/barrel', w: 0.8}, {id: 'nature/plant_bushLarge', w: 1.6}, {id: 'nature/fence_simple', w: 1.4},
    ],
    fg: ['nature/plant_bushDetailed', 'nature/plant_bushLarge', 'nature/tree_oak'],
  },
  downtown: {
    near: [com('a'), com('b'), com('c'), com('d'), com('e'), com('f'), com('h'), {id: 'city-roads/light-square', w: 1}],
    far: [{id: 'city-commercial/building-skyscraper-a', w: 4, scale: 3.5}, {id: 'city-commercial/building-skyscraper-b', w: 4, scale: 3.5}, {id: 'city-commercial/building-skyscraper-c', w: 4, scale: 3.5}, {id: 'city-commercial/building-skyscraper-d', w: 4, scale: 3.5}, {id: 'city-commercial/low-detail-building-a', w: 4, scale: 3.5}, {id: 'city-commercial/low-detail-building-d', w: 4, scale: 3.5}],
    ground: P.concrete, silhouette: '#8C97B5', horizon: 'skyline',
    props: [
      {id: 'city-roads/light-square', w: 1}, {id: 'city-roads/construction-cone', w: 0.8}, {id: 'car/sedan', w: 2.4, scale: 0.95},
      {id: 'car/taxi', w: 2.4, scale: 0.95}, {id: 'city-commercial/detail-parasol-a', w: 2}, {id: 'nature/plant_bush', w: 1.4},
    ],
    fg: ['nature/plant_bushDetailed', 'city-roads/light-square'],
  },
  airfield: {
    near: [ind('a'), ind('c'), ind('e'), ind('g'), {id: 'car/truck-flat', w: 3.5}, {id: 'car/delivery', w: 3.5}, tree('tree_pineTallA'), tree('tree_pineRoundB')],
    far: [ind('b'), ind('d'), ind('h'), tree('tree_pineTallC', 2.4), tree('tree_pineRoundD', 2.4), tree('tree_pineTallD', 2.4)],
    ground: '#9DB05A', silhouette: '#93A66E', horizon: 'hills',
    props: [
      {id: 'car/cone', w: 0.8}, {id: 'survival/barrel', w: 0.8}, {id: 'car/truck-flat', w: 2.8, scale: 1.0},
      {id: 'car/delivery', w: 2.8, scale: 1.0}, {id: 'city-roads/construction-light', w: 1},
    ],
    fg: ['survival/barrel', 'nature/plant_bushDetailed'],
  },
  office: {
    near: [], far: [], ground: P.wood, silhouette: '#8C97B5', horizon: 'skyline',
    props: [
      {id: 'furniture/desk', w: 2}, {id: 'furniture/chairDesk', w: 1}, {id: 'furniture/bookcaseOpen', w: 1.8},
      {id: 'furniture/pottedPlant', w: 1}, {id: 'furniture/trashcan', w: 0.8}, {id: 'furniture/computerScreen', w: 1},
    ],
    fg: ['furniture/pottedPlant', 'furniture/plantSmall2'],
  },
  newsroom: {
    near: [], far: [], ground: '#C9CFDE', silhouette: '#8C97B5', horizon: 'skyline',
    props: [
      {id: 'furniture/desk', w: 2}, {id: 'furniture/computerScreen', w: 1}, {id: 'furniture/chairModernCushion', w: 1},
      {id: 'furniture/lampSquareFloor', w: 0.8}, {id: 'furniture/speaker', w: 0.8},
    ],
    fg: ['furniture/pottedPlant', 'furniture/lampSquareFloor'],
  },
  home: {
    near: [], far: [], ground: P.wood, silhouette: '#8FA36A', horizon: 'hills',
    props: [
      {id: 'furniture/loungeSofa', w: 2.6}, {id: 'furniture/tableCoffee', w: 1.6}, {id: 'furniture/pottedPlant', w: 1},
      {id: 'furniture/lampRoundFloor', w: 0.8}, {id: 'furniture/sideTable', w: 1},
    ],
    fg: ['furniture/pottedPlant', 'furniture/plantSmall2', 'furniture/loungeChair'],
  },
};
