import NodeSidebar from '../sidebar/NodeSidebar';
import FlowCanvas from '../canvas/FlowCanvas';
import DebugDrawer from '../debug/DebugDrawer';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NodeSidebar />
        <FlowCanvas />
      </div>
      <DebugDrawer />
    </div>
  );
}
