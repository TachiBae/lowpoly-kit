import React from 'react';
import {Composition, Folder} from 'remotion';
import {KitGallery} from './kit/KitGallery';
import {ExampleShort, EXAMPLE_FRAMES} from './examples/ExampleShort';
import {withLook} from './kit/look';
import {LookLab, LOOKLAB_FRAMES} from './kit/LookLab';
import {DaylightLab, DAYLIGHTLAB_FRAMES} from './kit/DaylightLab';
import {BackdropTest, BACKDROPTEST_FRAMES} from './kit/scene/BackdropTest';
import {DaylightLab2, DAYLIGHTLAB2_FRAMES} from './kit/DaylightLab2';
const DL2 = withLook(() => <DaylightLab2 />, 'v2');
import {ArmLab, ARMLAB_FRAMES} from './kit/ArmLab';
const ALab = withLook(() => <ArmLab />, 'v2');
import {BodyLab, BODYLAB_FRAMES} from './kit/BodyLab';
const BLab = withLook(() => <BodyLab />, 'v2');
import {PresetLab, PRESETLAB_FRAMES} from './kit/PresetLab';
const PLab = withLook(() => <PresetLab />, 'v2');
import {EdgeLab, EDGELAB_FRAMES} from './kit/EdgeLab';
const ELab = withLook(() => <EdgeLab />, 'v2');
import {CastTurnaround, CAST_TURNAROUND_FRAMES, CastExpressions, CAST_EXPRESSIONS_FRAMES} from './kit/CastSheets';
const CTurn = withLook(() => <CastTurnaround />, 'v2');
const CExp = withLook(() => <CastExpressions />, 'v2');
import {SetLab, SETLAB_FRAMES} from './kit/SetLab';
const SLab = withLook(() => <SetLab />, 'v2');
import {HandLab, HANDLAB_FRAMES} from './kit/HandLab';
import {ActLab, ACTLAB_FRAMES} from './kit/ActLab';
import {GestureLab, GESTURELAB_FRAMES} from './kit/GestureLab';
import {GestureCheck, GESTURECHECK_FRAMES} from './kit/GestureCheck';
const GestureCheckV2 = withLook(() => <GestureCheck />, 'v2');
const GestureLabV2 = withLook(() => <GestureLab />, 'v2');
const ActLabV2 = withLook(() => <ActLab />, 'v2');
const HLab = withLook(() => <HandLab />, 'v2');
const BTest = withLook(() => <BackdropTest />, 'v2');
const DLClean = withLook(() => <DaylightLab edge="clean" />, 'v2');
const DLSoft = withLook(() => <DaylightLab edge="soft" />, 'v2');
const DLOutline = withLook(() => <DaylightLab edge="outline" />, 'v2');

const LookLabV1 = withLook(LookLab, 'v1');
const LookLabV2 = withLook(LookLab, 'v2');

const Example = withLook(() => <ExampleShort />, 'v2');

const vertical = {width: 1080, height: 1920, fps: 30};

/** Kit labs (one per feature) + an example Short. Add your own compositions here. */
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Kit">
      <Composition id="KitGallery" component={KitGallery} durationInFrames={240} {...vertical} />
      <Composition id="LookLab" component={LookLabV1} durationInFrames={LOOKLAB_FRAMES} {...vertical} />
      <Composition id="LookLab-v2" component={LookLabV2} durationInFrames={LOOKLAB_FRAMES} {...vertical} />
      <Composition id="DaylightLab" component={DLClean} durationInFrames={DAYLIGHTLAB_FRAMES} {...vertical} />
      <Composition id="DaylightLab-soft" component={DLSoft} durationInFrames={DAYLIGHTLAB_FRAMES} {...vertical} />
      <Composition id="BackdropTest" component={BTest} durationInFrames={BACKDROPTEST_FRAMES} {...vertical} />
      <Composition id="DaylightLab2" component={DL2} durationInFrames={DAYLIGHTLAB2_FRAMES} {...vertical} />
      <Composition id="ArmLab" component={ALab} durationInFrames={ARMLAB_FRAMES} {...vertical} />
      <Composition id="BodyLab" component={BLab} durationInFrames={BODYLAB_FRAMES} {...vertical} />
      <Composition id="PresetLab" component={PLab} durationInFrames={PRESETLAB_FRAMES} {...vertical} />
      <Composition id="EdgeLab" component={ELab} durationInFrames={EDGELAB_FRAMES} {...vertical} />
      <Composition id="CastTurnaround" component={CTurn} durationInFrames={CAST_TURNAROUND_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="CastExpressions" component={CExp} durationInFrames={CAST_EXPRESSIONS_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="SetLab" component={SLab} durationInFrames={SETLAB_FRAMES} {...vertical} />
      <Composition id="ActLab" component={ActLabV2} durationInFrames={ACTLAB_FRAMES} {...vertical} />
      <Composition id="GestureLab" component={GestureLabV2} durationInFrames={GESTURELAB_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="GestureCheck" component={GestureCheckV2} durationInFrames={GESTURECHECK_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="HandLab" component={HLab} durationInFrames={HANDLAB_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="DaylightLab-outline" component={DLOutline} durationInFrames={DAYLIGHTLAB_FRAMES} {...vertical} />
    </Folder>
    <Folder name="Examples">
      <Composition id="ExampleShort" component={Example} durationInFrames={EXAMPLE_FRAMES} {...vertical} />
    </Folder>
  </>
);
