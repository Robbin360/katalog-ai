"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import SidebarList from '@/components/dashboard/SidebarList';
import MainStage from '@/components/dashboard/MainStage';
import ControlPanel from '@/components/dashboard/ControlPanel';

export default function Home() {
  return (
    <main className='h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans'>
      {/* Grupo de Paneles Redimensionables */}
      <ResizablePanelGroup direction='horizontal'>

        {/* PANEL IZQUIERDO: INVENTARIO & SUBIDA */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className='min-w-[280px]'>
          <SidebarList />
        </ResizablePanel>

        <ResizableHandle className='bg-zinc-800 w-[1px] hover:bg-indigo-500 transition-colors' />

        {/* PANEL CENTRAL: EL RESULTADO (CANVAS) */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <MainStage />
        </ResizablePanel>

        <ResizableHandle className='bg-zinc-800 w-[1px] hover:bg-indigo-500 transition-colors' />

        {/* PANEL DERECHO: CONFIGURACIÓN IA */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35} className='min-w-[300px]'>
          <ControlPanel />
        </ResizablePanel>

      </ResizablePanelGroup>
    </main>
  );
}