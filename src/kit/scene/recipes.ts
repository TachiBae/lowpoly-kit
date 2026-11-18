export type RecipeId = 'closeUp' | 'medium' | 'wide' | 'overShoulder' | 'lowHero' | 'insert';

export type Recipe = {
  dist: number; // camera to subject, horizontal
  camY: number; // absolute camera height (insert: relative to the prop, see ShotScene `propY`)
  targetY: number; // look-at height
  fov: number; // vertical degrees
  fg: 'bold' | 'subtle' | 'none';
  fgD: number; // foreground distance from the camera
  blur: number;
  focusRange: number;
};

export const recipes: Record<RecipeId, Recipe> = {
  closeUp: {dist: 5.4, camY: 2.1, targetY: 1.65, fov: 34, fg: 'bold', fgD: 1.5, blur: 4.5, focusRange: 1.4},
  medium: {dist: 8.6, camY: 2.4, targetY: 1.35, fov: 38, fg: 'subtle', fgD: 2.0, blur: 3.5, focusRange: 2.2},
  wide: {dist: 13.0, camY: 2.7, targetY: 1.15, fov: 44, fg: 'subtle', fgD: 2.6, blur: 3, focusRange: 4},
  // camera sits behind a second person (the "shoulder"), who is the blurred foreground
  overShoulder: {dist: 4.6, camY: 2.05, targetY: 1.7, fov: 36, fg: 'none', fgD: 0, blur: 4.5, focusRange: 1.4},
  lowHero: {dist: 5.6, camY: 0.75, targetY: 1.55, fov: 40, fg: 'bold', fgD: 1.6, blur: 4, focusRange: 1.6},
  insert: {dist: 3.0, camY: 0.9, targetY: 0, fov: 34, fg: 'subtle', fgD: 1.2, blur: 4.5, focusRange: 1.0},
};

/** Foreground side rotation: pass consecutive shotIndex values for consecutive shots. */
export const FG_SIDES = ['bottomLeft', 'right', 'bottomRight', 'left'] as const;
