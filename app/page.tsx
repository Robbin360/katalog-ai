import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import SidebarList from '@/components/dashboard/SidebarList';
import MainStage from '@/components/dashboard/MainStage';
import ControlPanel from '@/components/dashboard/ControlPanel';

export default function Home() {
  return (
    <main className='h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className='min-w-[250px]'>
          <SidebarList />
        </ResizablePanel>

        <ResizableHandle className='bg-zinc-800 w-[1px]' />

        <ResizablePanel defaultSize={60}>
          <MainStage />
        </ResizablePanel>

        <ResizableHandle className='bg-zinc-800 w-[1px]' />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ControlPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
