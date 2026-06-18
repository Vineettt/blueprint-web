'use client';

import { BlockNoteSchema, defaultBlockSpecs, Block } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface Props {
  content?: Block[];
  onChange?: (json: Block[]) => void;
  editable?: boolean;
}

const textOnlyBlockSpecs = Object.fromEntries(
  Object.entries(defaultBlockSpecs).filter(
    ([key]) => !['image', 'video', 'audio', 'file'].includes(key)
  )
);

const textOnlySchema = BlockNoteSchema.create({
  blockSpecs: textOnlyBlockSpecs as typeof defaultBlockSpecs,
});

export function BlockNoteEditor({ content, onChange, editable = true }: Props) {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    schema: textOnlySchema,
    initialContent: content,
  });

  useEffect(() => {
    if (!editor || !content) return;

    const currentJson = JSON.stringify(editor.document);
    const nextJson = JSON.stringify(content);

    if (currentJson !== nextJson) {
      editor.replaceBlocks(editor.document, content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full border rounded-xl p-2 bg-background text-foreground shadow-sm min-h-[200px]">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        onChange={() => {
          onChange?.(editor.document);
        }}
      />
    </div>
  );
}
