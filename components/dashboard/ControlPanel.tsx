"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Wand2, Save } from "lucide-react"

export default function ControlPanel() {
  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Wand2 className="w-3 h-3" /> Configuración de IA
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">

          {/* Tono de Voz */}
          <div className="space-y-3">
            <Label className="text-zinc-300">Tono de Voz</Label>
            <Input
              defaultValue="Sarcástico y con emojis"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-indigo-500/50"
            />
            <p className="text-[10px] text-zinc-500">Define la personalidad del agente.</p>
          </div>

          {/* Creatividad */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-zinc-300">Nivel de Creatividad</Label>
              <span className="text-xs text-indigo-400">Alta</span>
            </div>
            <Slider defaultValue={[80]} max={100} step={1} className="py-2" />
          </div>

          {/* Opciones Extra */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400 cursor-pointer">Usar Emojis</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400 cursor-pointer">SEO Optimizado</Label>
              <Switch defaultChecked />
            </div>
          </div>

        </div>
      </ScrollArea>

      {/* Footer de Acción */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/10">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
          <Save className="w-4 h-4 mr-2" /> Guardar Reglas
        </Button>
      </div>
    </div>
  )
}