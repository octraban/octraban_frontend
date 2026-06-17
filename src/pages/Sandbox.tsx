import React, { useState, useRef, useEffect } from 'react';
import '../styles/Sandbox.css';
import Editor from '../components/Editor';
import FileExplorer from '../components/FileExplorer';
import Terminal from '../components/Terminal';
import Preview from '../components/Preview';

interface SandboxFile {
  path: string;
  content: string;
  language: string;
}

const Sandbox: React.FC = () => {
  const [files, setFiles] = useState<Map<string, SandboxFile>>(new Map());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const webcontainerRef = useRef<any>(null);

  const currentFile = selectedFile ? files.get(selectedFile) : null;

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
  };

  const handleFileChange = (content: string) => {
    if (selectedFile) {
      const updatedFile = { ...files.get(selectedFile)!, content };
      setFiles(new Map(files).set(selectedFile, updatedFile));
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTerminalOutput(['$ node src/index.js', 'Starting execution...']);
    // WebContainer execution will be added in next step
    setIsRunning(false);
  };

  return (
    <div className="sandbox-container">
      <div className="sandbox-header">
        <h1>Soroban Sandbox</h1>
        <button onClick={handleRun} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>

      <div className="sandbox-layout">
        <FileExplorer files={Array.from(files.values())} selectedFile={selectedFile} onSelectFile={handleFileSelect} />

        <div className="editor-section">
          {currentFile ? (
            <Editor file={currentFile} onChange={handleFileChange} />
          ) : (
            <div className="placeholder">Select a file to edit</div>
          )}
        </div>

        <div className="right-panel">
          <Preview />
          <Terminal output={terminalOutput} />
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
