import RNFS from 'react-native-fs';
import { CicloCompleto } from '../store/useCycleStore';

export const exportCiclosParaJsonl = async (ciclos: CicloCompleto[]) => {
  const naoSincronizados = ciclos.filter(c => !c.sincronizado);
  if (naoSincronizados.length === 0) return null;

  const jsonl = naoSincronizados.map(c => JSON.stringify(c)).join('\n');

  const path = `${RNFS.DocumentDirectoryPath}/sync_servidor.jsonl`;
  await RNFS.writeFile(path, jsonl, 'utf8');

  return path;
};
