import UserInputNode from './UserInputNode';
import LLMNode from './LLMNode';
import TTSNode from './TTSNode';
import EndNode from './EndNode';

export const nodeTypes = {
  'user-input': UserInputNode,
  'llm-node': LLMNode,
  'tts-node': TTSNode,
  'end-node': EndNode,
};
