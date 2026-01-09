import React, { useState } from 'react';
import { OCRWorkspace } from './OCRWorkspace';
import { WhiteboardWorkspace } from './WhiteboardWorkspace';

interface WorkspaceProps {
  onBack: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  initialMode?: 'OCR' | 'WHITEBOARD';
}

export const Workspace: React.FC<WorkspaceProps> = ({ onBack, initialMode = 'OCR' }) => {
  // Simple router logic inside the workspace wrapper
  const [mode, setMode] = useState<'OCR' | 'WHITEBOARD'>(initialMode);

  if (mode === 'WHITEBOARD') {
      return <WhiteboardWorkspace onBack={onBack} />;
  }

  return <OCRWorkspace onBack={onBack} />;
};