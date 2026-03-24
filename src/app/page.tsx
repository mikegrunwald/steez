import { PreviewArea } from '@/components/preview/preview-area';
import { ControlPanel } from '@/components/panel/control-panel';

export default function EditorPage() {
  return (
    <div className="flex h-screen">
      <PreviewArea />
      <ControlPanel />
    </div>
  );
}
