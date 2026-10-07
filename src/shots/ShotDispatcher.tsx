import React from 'react';
import type {ShotProps} from '../timeline';
import {
  AICoreShot,
  LatticeShot,
  MainframeShot,
  TitleShot,
  YearWarpShot,
} from './HookShots';
import {
  FoundationShot,
  QuestionShot,
  RewindShot,
  TuringShot,
  TuringTestShot,
} from './IdeaShots';
import {
  AITermShot,
  DartmouthShot,
  RulesShot,
  SimulateShot,
  SymbolicShot,
} from './BirthShots';
import {
  CatRulesShot,
  CatsVaryShot,
  ExamplesShot,
  LearnRulesShot,
  MLTitleShot,
  PatternsShot,
} from './MLShots';
import {
  CatsDogsShot,
  DeepShot,
  NNIntroShot,
  NNLayersShot,
  TrainingShot,
} from './NNShots';
import {
  AlexNetShot,
  GPUShot,
  ScaleShot,
  ThreeShot,
} from './DLShots';
import {
  AttentionShot,
  CapabilitiesShot,
  LLMShot,
  Paper2017Shot,
  TransformerShot,
} from './TransformerShots';
import {
  BoomShot,
  ChatUIShot,
  ReleaseShot,
} from './ChatShots';
import {
  EmergeShot,
  LoopShot,
  NotProgShot,
} from './WhyShots';
import {
  BeginningShot,
  FinaleShot,
  RecapShot,
} from './EndShots';

const SHOT_REGISTRY: Record<string, React.FC<ShotProps>> = {
  mainframe: MainframeShot,
  yearwarp: YearWarpShot,
  aicore: AICoreShot,
  lattice: LatticeShot,
  title: TitleShot,

  rewind: RewindShot,
  question: QuestionShot,
  turing: TuringShot,
  turingtest: TuringTestShot,
  foundation: FoundationShot,

  dartmouth: DartmouthShot,
  aiterm: AITermShot,
  simulate: SimulateShot,
  symbolic: SymbolicShot,
  rules: RulesShot,

  catrules: CatRulesShot,
  catsvary: CatsVaryShot,
  learnrules: LearnRulesShot,
  mltitle: MLTitleShot,
  examples: ExamplesShot,
  patterns: PatternsShot,

  nnintro: NNIntroShot,
  nnlayers: NNLayersShot,
  catsdogs: CatsDogsShot,
  training: TrainingShot,
  deep: DeepShot,

  three: ThreeShot,
  gpu: GPUShot,
  alexnet: AlexNetShot,
  scale: ScaleShot,

  paper2017: Paper2017Shot,
  transformer: TransformerShot,
  attention: AttentionShot,
  llm: LLMShot,
  capabilities: CapabilitiesShot,

  release: ReleaseShot,
  chatui: ChatUIShot,
  boom: BoomShot,

  notprog: NotProgShot,
  loop: LoopShot,
  emerge: EmergeShot,

  recap: RecapShot,
  beginning: BeginningShot,
  finale: FinaleShot,
};

export const ShotDispatcher: React.FC<{
  shotId: string;
  dur: number;
  lines: ShotProps['lines'];
}> = ({shotId, dur, lines}) => {
  const Comp = SHOT_REGISTRY[shotId] ?? TitleShot;
  return <Comp dur={dur} lines={lines} />;
};
