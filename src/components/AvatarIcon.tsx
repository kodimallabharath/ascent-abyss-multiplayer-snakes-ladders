import React from 'react';
import { AvatarSymbol } from '../types/game';
import {
  CircleDot,
  Triangle,
  Square,
  Gem,
  Hexagon,
  Plus,
  Star,
  Crown,
  Shield,
  Zap,
  Flame,
  Moon,
  Sun,
  Compass,
  Heart,
  Sparkles,
} from 'lucide-react';

interface AvatarIconProps {
  symbol?: AvatarSymbol;
  className?: string;
  size?: number;
}

export interface AvatarSymbolDefinition {
  id: AvatarSymbol;
  name: string;
  category: 'Geometric' | 'Symbolic';
}

export const AVATAR_SYMBOLS_LIST: AvatarSymbolDefinition[] = [
  // Minimalist Geometric Shapes
  { id: 'circle', name: 'Circle', category: 'Geometric' },
  { id: 'triangle', name: 'Triangle', category: 'Geometric' },
  { id: 'square', name: 'Square', category: 'Geometric' },
  { id: 'diamond', name: 'Diamond', category: 'Geometric' },
  { id: 'hexagon', name: 'Hexagon', category: 'Geometric' },
  { id: 'cross', name: 'Cross', category: 'Geometric' },
  // Minimalist Emblems & Symbols
  { id: 'star', name: 'Star', category: 'Symbolic' },
  { id: 'crown', name: 'Crown', category: 'Symbolic' },
  { id: 'shield', name: 'Shield', category: 'Symbolic' },
  { id: 'lightning', name: 'Bolt', category: 'Symbolic' },
  { id: 'flame', name: 'Flame', category: 'Symbolic' },
  { id: 'moon', name: 'Crescent', category: 'Symbolic' },
  { id: 'sun', name: 'Sun', category: 'Symbolic' },
  { id: 'compass', name: 'Compass', category: 'Symbolic' },
  { id: 'heart', name: 'Heart', category: 'Symbolic' },
  { id: 'sparkle', name: 'Sparkle', category: 'Symbolic' },
];

export const AvatarIcon: React.FC<AvatarIconProps> = ({
  symbol = 'star',
  className = 'w-4 h-4',
  size,
}) => {
  const props = { className, size };

  switch (symbol) {
    case 'circle':
      return <CircleDot {...props} />;
    case 'triangle':
      return <Triangle {...props} />;
    case 'square':
      return <Square {...props} />;
    case 'diamond':
      return <Gem {...props} />;
    case 'hexagon':
      return <Hexagon {...props} />;
    case 'cross':
      return <Plus {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'crown':
      return <Crown {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'lightning':
      return <Zap {...props} />;
    case 'flame':
      return <Flame {...props} />;
    case 'moon':
      return <Moon {...props} />;
    case 'sun':
      return <Sun {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'heart':
      return <Heart {...props} />;
    case 'sparkle':
      return <Sparkles {...props} />;
    default:
      return <Star {...props} />;
  }
};
