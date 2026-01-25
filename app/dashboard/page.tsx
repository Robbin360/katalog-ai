"use client"

import SidebarList from '@/components/dashboard/SidebarList';
import MainStage from '@/components/dashboard/MainStage';
import ControlPanel from '@/components/dashboard/ControlPanel';

export default function DashboardPage() {
  return (
    <main className='h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans'>

      {/* ESTRUCTURA DE REJILLA ESTÁTICA (GRID BLINDADO) */}
      {/* Definimos las columnas exactas: 25% | 50% | 25% */}
      <div className="grid grid-cols-[25%_50%_25%] h-full w-full">

        {/* PANEL IZQUIERDO: INVENTARIO & SUBIDA */}
        {/* min-w-0 es VITAL: impide que el contenido interno estire la columna a la fuerza */}
        <div className="h-full border-r border-zinc-800 overflow-hidden min-w-0 bg-zinc-950">
          <SidebarList />
        </div>

        {/* PANEL CENTRAL: RESULTADO (CANVAS) */}
        <div className="h-full overflow-hidden min-w-0 bg-black/20">
          <MainStage />
        </div>

        {/* PANEL DERECHO: CONFIGURACIÓN IA */}
        <div className="h-full border-l border-zinc-800 overflow-hidden min-w-0 bg-zinc-950">
          <ControlPanel />
        </div>

      </div>
    </main>
  );
}