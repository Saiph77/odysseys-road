import type { ContentRegistry } from '../core/contracts';

export const contentRegistry: ContentRegistry = {
  'origin-captions': {
    lines: ['I · 海难与记忆'],
    align: 'center',
    variant: 'chapter',
  },
  'ithaca-card': {
    lines: ['II · 没有主人的伊萨卡'],
    align: 'center',
    variant: 'chapter',
  },
  'trials-card': {
    lines: ['III · 试炼'],
    align: 'center',
    variant: 'chapter',
  },
  'stinger-title': {
    lines: ['归航', "Odyssey's Road"],
    align: 'center',
    variant: 'title',
  },
  'stinger-outro': {
    lines: [
      '素材来源：《THE ODYSSEY》官方预告片',
      '仅用于非商业学习与展示 · 滚动返回顶部',
    ],
    align: 'center',
    variant: 'outro',
  },
};
