export type V3 = [number, number, number];

export type HairStyle = 'swept' | 'bob' | 'buzz' | 'bun' | 'curly' | 'long' | 'bald' | 'pigtails' | 'ponytail' | 'afro' | 'mohawk' | 'spiky' | 'sidePart' | 'topknot' | 'shaggy';
export type OutfitStyle = 'leatherJacket' | 'suit' | 'hoodie' | 'labCoat' | 'tee' | 'uniform' | 'spacesuit' | 'apron' | 'sweater' | 'raincoat' | 'overalls' | 'dress' | 'vest' | 'chef';

export type PersonSpec = {
  /** Shown in the gallery and used as a seed so each character's facets differ. */
  name: string;
  skin: string;
  hair: {style: HairStyle; color: string};
  outfit: {
    style: OutfitStyle;
    main: string; // jacket / coat / hoodie / suit color
    inner: string; // shirt or tee under it
    pants: string;
    shoes?: string;
    accent?: string; // tie, belt, patches, trims
    shine?: number; // 0 matte cloth .. 1 glossy leather / vinyl
  };
  accessories?: {
    glasses?: 'rect' | 'round';
    glassesColor?: string;
    hat?: 'cap' | 'hardhat' | 'beret' | 'beanie' | 'chef' | 'headband';
    hatColor?: string;
    badge?: string; // badge color on the chest
    headset?: boolean;
  };
  face?: {
    noseStyle?: 'button' | 'long' | 'none';
    freckles?: boolean;
  };
  build?: {
    height?: number; // 1 = default
    width?: number; // 1 = default
    head?: number; // 1 = default (already oversized)
  };
};

export type Mouth = 'closed' | 'small' | 'open' | 'wide' | 'o' | 'smile' | 'frown' | 'grin' | 'tongue' | 'smirk' | 'kiss' | 'teeth';

export type Expression = {
  eyeScale?: number; // 0.8 squint .. 1.35 shocked
  look?: [number, number]; // pupil offset, -1..1
  blink?: number; // 0 open .. 1 closed
  brows?: 'neutral' | 'worried' | 'angry' | 'raised' | 'sad' | 'skeptical' | 'flat';
  eyeShape?: 'dot' | 'happy' | 'sleepy' | 'wink' | 'sparkle' | 'squint';
  mouth?: Mouth;
  mouthOpen?: number; // 0..1, overrides the mouth shape height (lip sync)
  sweat?: boolean;
  blush?: boolean;
  /** Two small floating hearts beside the head (love). */
  hearts?: boolean;
};

/** Arm build. classic = original (v1). tube = one tapered faceted tube. clay = tapered smooth tube. refined = separate tapered pieces. */
export type ArmStyle = 'classic' | 'tube' | 'clay' | 'refined';

/** Torso build. classic = 8-sided can + shoulder caps (v1). shaped = lathe profile with sloped shoulders. */
export type BodyStyle = 'classic' | 'shaped';

export type HandPose = 'relaxed' | 'fist' | 'point' | 'open' | 'thumbsUp' | 'wave';

export type Pose = {
  handL?: HandPose;
  handR?: HandPose;
  lean?: number; // radians, forward +
  turn?: number; // body yaw
  head?: V3; // head rotation
  armL?: V3; // shoulder rotation, arms hang down at 0
  armR?: V3;
  elbowL?: number; // forearm bend, radians
  elbowR?: number;
  legL?: number; // hip swing
  legR?: number;
  bob?: number; // vertical offset (squash/hop)
  squash?: number; // 1 = none, <1 squash, >1 stretch
  kneeL?: number; // knee bend, radians (M4)
  kneeR?: number;
  hips?: number; // vertical hip drop (M4)
  shift?: number; // sideways weight shift
};
