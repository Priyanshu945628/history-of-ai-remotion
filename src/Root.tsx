import React from 'react';
import {Composition} from 'remotion';
import {HistoryOfAI} from './Video';
import {timeline} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HistoryOfAI"
      component={HistoryOfAI}
      durationInFrames={timeline.totalFrames}
      fps={timeline.fps}
      width={1920}
      height={1080}
    />
  );
};
