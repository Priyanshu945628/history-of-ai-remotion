import {Config} from '@remotion/cli/config';

// WebGL (three.js) needs ANGLE on Windows, and swangle/egl on headless Linux (CI).
if (process.platform === 'win32') {
  Config.setChromiumOpenGlRenderer('angle');
} else {
  Config.setChromiumOpenGlRenderer('swangle');
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
