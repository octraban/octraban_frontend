import React, { useEffect, useRef } from 'react';
import * as Monaco from 'monaco-editor';

interface EditorProps {
  file: {
    path: string;
    content: string;
    language: string;
  };
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ file, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (!editorRef.current) {
        editorRef.current = Monaco.editor.create(containerRef.current, {
          value: file.content,
          language: file.language,
          theme: 'vs-dark',
          automaticLayout: true,
        });

        editorRef.current.onDidChangeModelContent(() => {
          const content = editorRef.current?.getValue() || '';
          onChange(content);
        });
      } else {
        editorRef.current.setValue(file.content);
        Monaco.editor.setModelLanguage(editorRef.current.getModel()!, file.language);
      }
    }

    return () => {
      // Keep editor instance alive for reuse
    };
  }, [file, onChange]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Editor;
