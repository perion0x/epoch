'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Koenig to avoid SSR issues
const KoenigComposer = dynamic(
  () => import('@tryghost/koenig-lexical').then((mod) => mod.KoenigComposer),
  { ssr: false }
);

const KoenigEditor = dynamic(
  () => import('@tryghost/koenig-lexical').then((mod) => mod.KoenigEditor),
  { ssr: false }
);

interface KoenigEditorWrapperProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function KoenigEditorWrapper({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: KoenigEditorWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [editorContent, setEditorContent] = useState(initialContent);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (html: string) => {
    setEditorContent(html);
    if (onChange) {
      onChange(html);
    }
  };

  // Mock file uploader - required by Koenig but we'll implement later
  const useFileUpload = useCallback(() => {
    return {
      isLoading: false,
      progress: 0,
      upload: async (file: File) => {
        // For now, return a mock URL
        // TODO: Implement actual file upload to Walrus
        console.log('File upload not yet implemented:', file.name);
        return {
          url: URL.createObjectURL(file),
          fileName: file.name,
          mimeType: file.type,
        };
      },
    };
  }, []);

  const fileUploader = {
    useFileUpload,
  };

  if (!isClient) {
    return (
      <div
        className={className}
        style={{
          minHeight: '300px',
          padding: '20px',
          backgroundColor: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '6px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading editor...
      </div>
    );
  }

  // Pass undefined if initialContent is empty, otherwise pass the content
  const initialState = initialContent && initialContent.trim() !== '' ? initialContent : undefined;

  return (
    <div className={className}>
      <KoenigComposer
        initialEditorState={initialState}
        fileUploader={fileUploader}
        onError={(error: Error) => {
          console.error('Koenig editor error:', error);
        }}
      >
        <KoenigEditor
          onChange={handleChange}
          placeholder={placeholder}
          className="koenig-editor-wrapper"
        />
      </KoenigComposer>
    </div>
  );
}
