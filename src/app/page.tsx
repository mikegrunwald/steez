import { PreviewArea } from '@/components/preview/preview-area';
import { ControlPanel } from '@/components/panel/control-panel';

export default function EditorPage() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <PreviewArea />
      <ControlPanel />
    </div>
  );
}
