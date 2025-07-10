# MinetrackApp

## 📦 Instalação

1. **Baixe o APK de instalação:**  
   [Link para download do APK](COLE_O_LINK_AQUI)

2. **Instale em seu dispositivo Android:**  
   Pode ser necessário permitir instalação de fontes desconhecidas nas configurações do aparelho.

3. **Ou rode localmente:**
   ```sh
   git clone <repo>
   cd MinetrackApp
   npm install
   npx react-native run-android
   ```

---

## ▶️ Como usar

- Abra o app e clique em **SIMULAR LEITURA** para simular o ciclo do caminhão.
- A interface exibirá:
  - **Etapa Atual**: status determinado pela lógica
  - **Equipamento de Carga**: conforme leitura
  - **Ponto de Basculamento**: conforme leitura
  - **Velocidade Atual**: convertida de m/s para km/h
  - **Dados Sincronizados**: indica se há pendências ou se tudo foi enviado
- O ciclo completo é registrado automaticamente.
- Quando a rede for detectada (simulada), os ciclos completos são exportados para o arquivo `sync_servidor.jsonl`.

---

## 📂 Local do Arquivo de Exportação

### **Arquivo JSONL Gerado**

O arquivo `sync_servidor.jsonl` é gerado automaticamente quando:

- ✅ Ciclos completos são finalizados (estágio "TRÂNSITO VAZIO")
- ✅ A sincronização é executada (automática ou manual)
- ✅ O app tem permissões de escrita no armazenamento

### **Localização do Arquivo**

#### **📱 No Dispositivo Android:**

```
/data/data/com.minetrackapp/files/sync_servidor.jsonl
```

#### **📁 Caminho Completo:**

```
[Storage Interno do App]/files/sync_servidor.jsonl
```

### **Como Acessar o Arquivo**

#### **🔧 Método 1: Android Studio Device File Explorer**

1. Abra o Android Studio
2. Conecte o dispositivo via USB
3. Vá em **Device File Explorer**
4. Navegue até: `data/data/com.minetrackapp/files/`
5. Baixe o arquivo `sync_servidor.jsonl`

#### **📱 Método 2: Gerenciador de Arquivos com Root**

1. Instale um gerenciador de arquivos com acesso root (ex: Root Explorer)
2. Navegue até: `/data/data/com.minetrackapp/files/`
3. Copie o arquivo `sync_servidor.jsonl`

#### **💻 Método 3: ADB (Android Debug Bridge)**

```bash
# Conectar ao dispositivo
adb shell

# Navegar até o diretório
cd /data/data/com.minetrackapp/files/

# Listar arquivos
ls -la

# Copiar arquivo para o computador
adb pull /data/data/com.minetrackapp/files/sync_servidor.jsonl ./sync_servidor.jsonl
```

### **📋 Formato do Arquivo JSONL**

O arquivo contém **uma linha JSON por ciclo completo**:

```jsonl
{"ciclo_id":"CYCLE_1703123456789_abc123","data_inicio":"2024-01-15T10:30:00.000Z","data_fim":"2024-01-15T10:45:00.000Z","etapas":[{"etapa":"EM CARREGAMENTO","timestamp":"2024-01-15T10:30:00.000Z"},{"etapa":"TRÂNSITO CHEIO","timestamp":"2024-01-15T10:35:00.000Z"},{"etapa":"EM BASCULAMENTO","timestamp":"2024-01-15T10:40:00.000Z"},{"etapa":"TRÂNSITO VAZIO","timestamp":"2024-01-15T10:45:00.000Z"}],"equipamento_id":"","equipamento_carga":"ESC-002","ponto_basculamento":{"X":-23.5505,"Y":-46.6333},"status_sincronizacao":"SINCRONIZADO"}
{"ciclo_id":"CYCLE_1703123456789_def456","data_inicio":"2024-01-15T11:00:00.000Z","data_fim":"2024-01-15T11:15:00.000Z","etapas":[{"etapa":"EM CARREGAMENTO","timestamp":"2024-01-15T11:00:00.000Z"},{"etapa":"TRÂNSITO CHEIO","timestamp":"2024-01-15T11:05:00.000Z"},{"etapa":"EM BASCULAMENTO","timestamp":"2024-01-15T11:10:00.000Z"},{"etapa":"TRÂNSITO VAZIO","timestamp":"2024-01-15T11:15:00.000Z"}],"equipamento_id":"","equipamento_carga":"ESC-002","ponto_basculamento":{"X":-23.5505,"Y":-46.6333},"status_sincronizacao":"SINCRONIZADO"}
```

### **🔍 Estrutura de Cada Linha JSON**

```json
{
  "ciclo_id": "CYCLE_[timestamp]_[random]",
  "data_inicio": "2024-01-15T10:30:00.000Z",
  "data_fim": "2024-01-15T10:45:00.000Z",
  "etapas": [
    {
      "etapa": "EM CARREGAMENTO",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "etapa": "TRÂNSITO CHEIO",
      "timestamp": "2024-01-15T10:35:00.000Z"
    },
    {
      "etapa": "EM BASCULAMENTO",
      "timestamp": "2024-01-15T10:40:00.000Z"
    },
    {
      "etapa": "TRÂNSITO VAZIO",
      "timestamp": "2024-01-15T10:45:00.000Z"
    }
  ],
  "equipamento_id": "",
  "equipamento_carga": "ESC-002",
  "ponto_basculamento": {
    "X": -23.5505,
    "Y": -46.6333
  },
  "status_sincronizacao": "SINCRONIZADO"
}
```

### **📊 Informações do Arquivo**

- **Formato**: JSONL (JSON Lines) - uma linha JSON por registro
- **Encoding**: UTF-8
- **Tamanho**: Variável conforme número de ciclos
- **Atualização**: Automática após cada sincronização
- **Backup**: Não há backup automático - faça cópia manual se necessário

### **⚠️ Importante**

- O arquivo só é criado após **ciclos completos** serem sincronizados
- Para forçar a criação, use o botão **"FORÇAR SINCRONIZAÇÃO"** na tela de configurações
- O arquivo pode ser validado usando o botão **"🔍 VALIDAR ARQUIVO JSONL"**
- Para testar a criação, use o botão **"🧪 TESTAR CRIAÇÃO DE ARQUIVO"**

---

## 🏗️ Arquitetura de Software

O projeto segue uma arquitetura **modular e orientada a serviços**, visando clareza, testabilidade e facilidade de manutenção. As principais camadas e padrões utilizados são:

### **1. Camada de Componentes (src/components/)**

- Componentes visuais reutilizáveis (ex: Box, Button, Icon, Text, Screen)
- Responsáveis apenas pela apresentação e interação visual

### **2. Camada de Telas (src/screens/)**

- Cada tela representa um fluxo principal do app (Home, Settings, History)
- Usa componentes e hooks para montar a interface e lógica de interação

### **3. Camada de Serviços (src/services/)**

- **SimulationService**: Gerencia a leitura linha a linha dos dados simulados
- **CycleService**: Implementa toda a lógica de negócio para identificar etapas do ciclo, registrar e completar ciclos
- **SyncService**: Gerencia a sincronização offline/online, controle de pendências e exportação para arquivo
- **FileService**: Responsável por leitura/escrita de arquivos locais (JSONL)
- **StorageService**: Abstrai o uso do AsyncStorage para persistência local

### **4. Tipos e Modelos (src/types/)**

- Todas as estruturas de dados (SensorData, CycleData, SyncData, etc.) são fortemente tipadas em TypeScript
- Facilita a validação, manutenção e evolução do código

### **5. Hooks Customizados (src/hooks/)**

- Hooks para lógica de interface e integração com serviços (ex: useHomeScreen)

### **Padrões e Decisões**

- **Injeção de dependências via hooks e refs**: Serviços são instanciados e referenciados por hooks, facilitando testes e isolamento
- **Separação de responsabilidades**: Cada serviço tem uma responsabilidade única e clara
- **Baixo acoplamento**: Telas e componentes não conhecem detalhes internos dos serviços
- **Fácil testabilidade**: Lógica de negócio pode ser testada isoladamente

### **Motivação**

Essa arquitetura foi escolhida para garantir:

- **Escalabilidade**: Fácil adicionar novas telas, sensores ou regras de negócio
- **Manutenção**: Mudanças em uma camada não afetam as demais
- **Testes**: Serviços e lógica de ciclo podem ser testados sem interface
- **Clareza**: Código organizado, fácil de entender e evoluir

---

## ❗ Dívidas Técnicas

---

**Dúvidas ou sugestões? Fique à vontade para abrir uma issue ou entrar em contato!**
