import RNFS from 'react-native-fs';
import { CycleData } from '../types/cycle';

export const exportCiclosParaJsonl = async (cycles: CycleData[]) => {
  const unsynchronized = cycles.filter(c => !c.isSynchronized);
  if (unsynchronized.length === 0) return null;

  const jsonl = unsynchronized.map(c => JSON.stringify(c)).join('\n');

  const path = `${RNFS.DocumentDirectoryPath}/sync_servidor.jsonl`;
  await RNFS.writeFile(path, jsonl, 'utf8');

  return path;
};
