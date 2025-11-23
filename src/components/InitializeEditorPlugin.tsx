import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { marked } from 'marked';

export function InitializeEditorPlugin({
  initialValue,
  initialMarkdown,
}: {
  initialValue?: string;
  initialMarkdown?: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialValue || initialMarkdown) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        if (initialValue) {
          // HTML content
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialValue, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);
        } else if (initialMarkdown) {
          // Markdown content - convert to HTML first
          const html = marked.parse(initialMarkdown) as string;
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);
        }
      });
    }
  }, [editor, initialValue, initialMarkdown]);

  return null;
}
