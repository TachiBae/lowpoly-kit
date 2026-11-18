import {Config} from '@remotion/cli/config';

// WebGL (Three.js) needs a real GL backend when rendering headless.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
