import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WidgetRenderer } from './GameWidgets';
import { WidgetType } from '../types';
import { describe, it, expect, vi } from 'vitest';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle" />,
  XCircle: () => <div data-testid="x-circle" />,
  HelpCircle: () => <div data-testid="help-circle" />,
  MapPin: () => <div data-testid="map-pin" />,
  Flag: () => <div data-testid="flag" />,
  RotateCcw: () => <div data-testid="rotate-ccw" />,
  Puzzle: () => <div data-testid="puzzle" />,
  List: () => <div data-testid="list" />,
  GripVertical: () => <div data-testid="grip-vertical" />,
  Type: () => <div data-testid="type" />,
  Check: () => <div data-testid="check" />,
  X: () => <div data-testid="x" />,
}));

describe('WidgetRenderer', () => {
  it('renders RelatedTopics widget', () => {
    const data = { topics: ['DNA', 'RNA'] };
    render(<WidgetRenderer widget={{ type: WidgetType.RelatedTopics, data }} />);
    expect(screen.getByText('#DNA')).toBeInTheDocument();
    expect(screen.getByText('#RNA')).toBeInTheDocument();
  });

  it('renders TrueFalse widget', () => {
    const data = { 
      question: 'Is the earth flat?', 
      isTrue: false, 
      explanation: 'No, it is a spheroid.' 
    };
    render(<WidgetRenderer widget={{ type: WidgetType.TrueFalse, data }} />);
    expect(screen.getByText('Is the earth flat?')).toBeInTheDocument();
    expect(screen.getByText('אמת או שקר?')).toBeInTheDocument();
  });

  it('renders MultipleChoice widget', () => {
    const data = {
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      explanation: 'Basic math.'
    };
    render(<WidgetRenderer widget={{ type: WidgetType.MultipleChoice, data }} />);
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders Cloze widget', () => {
    const data = {
      sentenceParts: ['The ', ' is blue.'],
      hiddenWords: ['sky'],
      distractors: ['grass', 'dirt']
    };
    render(<WidgetRenderer widget={{ type: WidgetType.Cloze, data }} />);
    expect(screen.getByText('The')).toBeInTheDocument();
    expect(screen.getByText('is blue.')).toBeInTheDocument();
  });

  it('renders CausalChain widget', () => {
    const data = {
      title: 'Water Cycle',
      steps: ['Evaporation', 'Condensation', 'Precipitation']
    };
    render(<WidgetRenderer widget={{ type: WidgetType.CausalChain, data }} />);
    expect(screen.getByText('שרשרת הסיבות')).toBeInTheDocument();
    expect(screen.getByText('Water Cycle')).toBeInTheDocument();
  });
});
