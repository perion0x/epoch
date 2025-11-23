'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { InitializeEditorPlugin } from './InitializeEditorPlugin';

const theme = {
  paragraph: 'koenig-editor-paragraph',
  heading: {
    h1: 'koenig-editor-heading-h1',
    h2: 'koenig-editor-heading-h2',
    h3: 'koenig-editor-heading-h3',
  },
  quote: 'koenig-editor-quote',
  list: {
    nested: {
      listitem: 'koenig-editor-nested-listitem',
    },
    ol: 'koenig-editor-list-ol',
    ul: 'koenig-editor-list-ul',
    listitem: 'koenig-editor-listitem',
  },
  link: 'koenig-editor-link',
  text: {
    bold: 'koenig-editor-text-bold',
    italic: 'koenig-editor-text-italic',
    code: 'koenig-editor-text-code',
  },
};

function onError(error: Error) {
  console.error(error);
}

interface KoenigEditorProps {
  initialValue?: string;
  initialMarkdown?: string;
  onChange?: (html: string, markdown: string) => void;
  placeholder?: string;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'code') => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        selection.formatText(format);
      }
    });
  };

  const formatHeading = (level: 1 | 2 | 3) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const anchorNode = selection.anchor.getNode();
        const heading = $createHeadingNode(`h${level}`);
        if (anchorNode.getParent()) {
          anchorNode.replace(heading);
        }
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const anchorNode = selection.anchor.getNode();
        const quote = $createQuoteNode();
        if (anchorNode.getParent()) {
          anchorNode.replace(quote);
        }
      }
    });
  };

  return (
    <div className="koenig-toolbar">
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatText('bold')}
        title="Bold (Ctrl+B)"
        onMouseDown={(e) => e.preventDefault()}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatText('italic')}
        title="Italic (Ctrl+I)"
        onMouseDown={(e) => e.preventDefault()}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatText('code')}
        title="Code"
        onMouseDown={(e) => e.preventDefault()}
      >
        &lt;/&gt;
      </button>
      <div className="koenig-toolbar-divider" />
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatHeading(1)}
        title="Heading 1"
        onMouseDown={(e) => e.preventDefault()}
      >
        H1
      </button>
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatHeading(2)}
        title="Heading 2"
        onMouseDown={(e) => e.preventDefault()}
      >
        H2
      </button>
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatHeading(3)}
        title="Heading 3"
        onMouseDown={(e) => e.preventDefault()}
      >
        H3
      </button>
      <div className="koenig-toolbar-divider" />
      <button
        type="button"
        className="koenig-toolbar-button"
        onClick={() => formatQuote()}
        title="Quote"
        onMouseDown={(e) => e.preventDefault()}
      >
        &quot;
      </button>
    </div>
  );
}

function OnChangePluginWrapper({ onChange }: { onChange?: (html: string, markdown: string) => void }) {
  const [editor] = useLexicalComposerContext();

  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);

          // Simple markdown conversion (basic)
          const markdown = htmlString
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .trim();

          onChange?.(htmlString, markdown);
        });
      }}
    />
  );
}

export function KoenigEditor({
  initialValue,
  initialMarkdown,
  onChange,
  placeholder = 'Start writing...',
}: KoenigEditorProps) {
  const initialConfig = {
    namespace: 'koenig-editor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  };

  return (
    <div className="koenig-editor-wrapper">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="koenig-editor-container">
          <ToolbarPlugin />
          <div className="koenig-editor-inner">
            <InitializeEditorPlugin initialValue={initialValue} initialMarkdown={initialMarkdown} />
            <RichTextPlugin
              contentEditable={<ContentEditable className="koenig-editor-input" />}
              placeholder={<div className="koenig-editor-placeholder">{placeholder}</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePluginWrapper onChange={onChange} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
