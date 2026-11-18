import type {Expression, Pose} from './types';

/** Named expressions: spread into <Person expression={...}>. */
export const expressions = {
  neutral: {} as Expression,
  happy: {eyeShape: 'happy', mouth: 'grin', blush: true} as Expression,
  excited: {eyeShape: 'sparkle', eyeScale: 1.2, mouth: 'wide', brows: 'raised'} as Expression,
  shocked: {eyeScale: 1.35, mouth: 'o', brows: 'raised'} as Expression,
  worried: {mouth: 'frown', brows: 'worried', sweat: true} as Expression,
  sad: {eyeShape: 'sleepy', look: [0, -0.6], mouth: 'frown', brows: 'sad'} as Expression,
  angry: {eyeScale: 0.85, eyeShape: 'squint', mouth: 'teeth', brows: 'angry'} as Expression,
  skeptical: {mouth: 'smirk', brows: 'skeptical', eyeShape: 'squint'} as Expression,
  smug: {mouth: 'smirk', eyeShape: 'sleepy', brows: 'skeptical', look: [-0.3, 0]} as Expression,
  wink: {eyeShape: 'wink', mouth: 'smile'} as Expression,
  silly: {mouth: 'tongue', eyeShape: 'wink', blush: true} as Expression,
  love: {eyeShape: 'happy', mouth: 'smile', blush: true, hearts: true} as Expression,
  thinking: {look: [0.7, 0.6], mouth: 'small', brows: 'skeptical'} as Expression,
} satisfies Record<string, Expression>;

/** Named poses: spread into <Person pose={...}>. */
export const poses = {
  idle: {} as Pose,
  wave: {armL: [0, 0, 2.05], elbowL: 0.5, handL: 'wave'} as Pose,
  point: {armL: [-0.35, 0, 1.4], elbowL: 0.05, handL: 'point'} as Pose,
  thumbsUp: {armL: [-1.0, 0, 0.3], elbowL: 1.2, handL: 'thumbsUp'} as Pose,
  shrug: {armL: [0, 0, 0.9], armR: [0, 0, -0.9], elbowL: 0.9, elbowR: 0.9, handL: 'open', handR: 'open', head: [0, 0, 0.12]} as Pose,
  facepalm: {armL: [-1.8, 0, 0.1], elbowL: 2.0, handL: 'open', lean: 0.12, head: [0.25, 0, 0]} as Pose,
  cheer: {armL: [0, 0, 2.7], armR: [0, 0, -2.7], handL: 'fist', handR: 'fist', bob: 0.08, squash: 1.04} as Pose,
  crossedArms: {armL: [-0.9, 0, 0.5], armR: [-0.9, 0, -0.5], elbowL: 1.9, elbowR: 1.9, handL: 'fist', handR: 'fist'} as Pose,
  lean: {lean: 0.2, head: [0.1, 0, 0]} as Pose,
  surprised: {armL: [0, 0, 0.8], armR: [0, 0, -0.8], handL: 'open', handR: 'open', squash: 1.06, lean: -0.08} as Pose,
} satisfies Record<string, Pose>;
