'use client';
import { useState } from 'react';
import { ScrollText, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState('raw');

  return (
    <div className='h-full bg-zinc-900/30 border-l border-zinc-800 flex flex-col'>
      <div className='p-2 border-b border-zinc-800'>
        <div className='w-full grid grid-cols-2 bg-zinc-950/50 p-1 rounded-lg gap-1'>
          <button
            onClick={() => setActiveTab('raw')}
            className={cn(
              'flex items-center justify-center text-xs py-1.5 rounded-md transition-all',
              activeTab === 'raw' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <ScrollText size={12} className='mr-2'/> Data
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex items-center justify-center text-xs py-1.5 rounded-md transition-all',
              activeTab === 'settings' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Settings2 size={12} className='mr-2'/> Config
          </button>
        </div>
      </div>

      <div className='flex-1 p-4 overflow-y-auto'>
        {activeTab === 'raw' && (
          <div className='text-xs text-zinc-500 space-y-4'>
            <p>Select a product to view raw metadata attributes.</p>
            <div className='h-32 rounded bg-zinc-900/50 border border-zinc-800/50 border-dashed animate-pulse'></div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className='text-xs text-zinc-500 space-y-4'>
            <div className='space-y-2'>
              <label className='block text-zinc-400 font-medium'>Auto-Ingest</label>
              <div className='h-8 bg-zinc-900 rounded border border-zinc-800'></div>
            </div>
            <p>Workflow settings and manual overrides.</p>
          </div>
        )}
      </div>
    </div>
  );
}
