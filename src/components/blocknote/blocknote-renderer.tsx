'use client';

import { useState } from 'react';
import { Block } from '@blocknote/core';
import { BlockNoteEditor } from '@/components/blocknote/blocknote-editor';

export default function BlockNoteRenderer() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div className="flex flex-col gap-10 p-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-2">Editor Mode</h2>
        <BlockNoteEditor content={blocks} onChange={(val) => setBlocks(val)} editable={true} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Viewer Mode</h2>
        <BlockNoteEditor content={blocks} editable={false} />
      </div>
    </div>
  );
}
