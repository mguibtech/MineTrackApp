# MinetrackApp

## 📦 Instalação

### **Pré-requisitos**

- Node.js (versão 16 ou superior)
- React Native CLI
- Android Studio (para desenvolvimento Android)
- JDK 11 ou superior

### **Instalação Local**

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/mguibtech/MineTrackApp
   cd MinetrackApp
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o ambiente Android:**

   ```bash
   # Certifique-se de que o ANDROID_HOME está configurado
   # Configure as variáveis de ambiente no ~/.bashrc ou ~/.zshrc:
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Execute o projeto:**

   ```bash
   # Para Android
   npx react-native run-android

   # Para iOS (apenas em macOS)
   npx react-native run-ios
   ```

### **Instalação via APK**

1. **Baixe o APK de instalação:**  
   [Link para download do APK](https://drive.google.com/file/d/13BxzRSADe5MfiwMob0zKhc5ItHOaKZSO/view?usp=sharing)

2. **Instale em seu dispositivo Android:**  
   Pode ser necessário permitir instalação de fontes desconhecidas nas configurações do aparelho.

---

## ▶️ Como usar

### **Funcionalidades Principais**

1. **Simulação de Leituras:**

   - Abra o app e clique em **SIMULAR LEITURA** para simular o ciclo do caminhão
   - A interface exibirá:
     - **Etapa Atual**: status determinado pela lógica
     - **Equipamento de Carga**: conforme leitura
     - **Ponto de Basculamento**: conforme leitura
     - **Velocidade Atual**: convertida de m/s para km/h
     - **Dados Sincronizados**: indica se há pendências ou se tudo foi enviado

2. **Histórico de Leituras:**

   - Acesse a aba **Histórico** para ver todas as leituras realizadas
   - Leituras são agrupadas por dia e separadas por status (Processadas/Pendentes)
   - Use pull-to-refresh para atualizar os dados
   - Clique em "Ver detalhes" para ver informações específicas de cada leitura

3. **Configurações:**
   - Acesse a aba **Configurações** para:
     - Forçar sincronização manual
     - Validar arquivo JSONL
     - Testar criação de arquivo
     - Debug do arquivo de sincronização

### **Fluxo de Dados**

1. **Simulação** → Gera dados de sensores simulados
2. **Processamento** → CycleService identifica etapas do ciclo
3. **Registro** → Ciclos completos são salvos localmente
4. **Sincronização** → Dados são exportados para `sync_servidor.jsonl`
5. **Histórico** → Leituras são exibidas na tela de histórico

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

## 🏗️ Arquitetura e Decisões Técnicas

### **Arquitetura Geral**

O projeto segue uma arquitetura **modular e orientada a serviços**, visando clareza, testabilidade e facilidade de manutenção. As principais camadas e padrões utilizados são:

### **1. Camada de Componentes (src/components/)**

- **Componentes visuais reutilizáveis**: Box, Button, Icon, Text, Screen
- **Responsabilidade única**: Apenas apresentação e interação visual
- **Design System**: Componentes seguem um sistema de design consistente
- **Props tipadas**: TypeScript garante type safety em todas as props

### **2. Camada de Telas (src/screens/)**

- **Cada tela representa um fluxo principal**: Home, Settings, History, Detail
- **Hooks customizados**: Lógica de interface isolada em hooks (ex: useHomeScreen)
- **Componentes compostos**: Telas usam componentes menores para montar interfaces complexas
- **Navegação**: Integração com React Navigation para roteamento

### **3. Camada de Serviços (src/services/)**

#### **SimulationService**

- **Responsabilidade**: Gerencia a leitura linha a linha dos dados simulados
- **Padrão**: Singleton com estado interno
- **Integração**: Fornece dados para CycleService

#### **CycleService**

- **Responsabilidade**: Implementa toda a lógica de negócio para identificar etapas do ciclo
- **Algoritmo**: Análise de dados de sensores para determinar estágio atual
- **Estados**: Gerencia transições entre estágios (CARREGAMENTO → TRÂNSITO → BASCULAMENTO)
- **Persistência**: Salva ciclos completos para sincronização

#### **SyncService**

- **Responsabilidade**: Gerencia a sincronização offline/online
- **Estratégia**: Queue de pendências com retry automático
- **Formato**: Exportação para JSONL conforme especificação
- **Controle**: Status de sincronização e logs detalhados

#### **FileService**

- **Responsabilidade**: Leitura/escrita de arquivos locais
- **Formato**: JSONL para compatibilidade com sistemas externos
- **Localização**: Armazenamento interno do app
- **Validação**: Verificação de integridade dos arquivos

#### **StorageService**

- **Responsabilidade**: Abstrai o uso do AsyncStorage
- **Chaves**: Sistema de chaves organizado por domínio
- **Fallback**: Tratamento de erros de persistência

### **4. Tipos e Modelos (src/types/)**

- **TypeScript**: Todas as estruturas de dados são fortemente tipadas
- **Interfaces**: SensorData, CycleData, SyncData, etc.
- **Validação**: Type safety em tempo de compilação
- **Documentação**: Tipos servem como documentação viva do código

### **5. Hooks Customizados (src/hooks/)**

- **useHomeScreen**: Lógica específica da tela principal
- **useAppTheme**: Gerenciamento de tema e cores
- **useAppSafeArea**: Tratamento de safe area
- **useNetworkStatus**: Monitoramento de conectividade
- **useSyncCiclos**: Lógica de sincronização

### **Decisões Técnicas Importantes**

#### **1. Separação de Responsabilidades**

- **Motivo**: Facilita manutenção e testes
- **Implementação**: Cada serviço tem uma responsabilidade única e clara
- **Benefício**: Mudanças em uma camada não afetam as demais

#### **2. Injeção de Dependências via Hooks**

- **Motivo**: Facilita testes e isolamento
- **Implementação**: Serviços são instanciados e referenciados por hooks
- **Benefício**: Baixo acoplamento entre componentes

#### **3. Sistema de Arquivos JSONL**

- **Motivo**: Compatibilidade com sistemas externos
- **Implementação**: Uma linha JSON por registro
- **Benefício**: Fácil parsing e streaming de dados

#### **4. Lógica de Ciclo Inteligente**

- **Motivo**: Identificação automática de estágios
- **Implementação**: Análise de dados de sensores e GPS
- **Benefício**: Reduz intervenção manual

#### **5. Sincronização Offline-First**

- **Motivo**: Funcionamento sem conectividade
- **Implementação**: Queue de pendências com retry
- **Benefício**: Robustez em ambientes instáveis

### **Padrões Utilizados**

- **Singleton**: Para serviços que precisam de estado global
- **Observer**: Para notificações de mudanças de estado
- **Factory**: Para criação de objetos complexos
- **Strategy**: Para diferentes algoritmos de processamento
- **Template Method**: Para fluxos de sincronização

### **Motivação da Arquitetura**

Essa arquitetura foi escolhida para garantir:

- **Escalabilidade**: Fácil adicionar novas telas, sensores ou regras de negócio
- **Manutenção**: Mudanças em uma camada não afetam as demais
- **Testes**: Serviços e lógica de ciclo podem ser testados sem interface
- **Clareza**: Código organizado, fácil de entender e evoluir
- **Performance**: Carregamento otimizado e gerenciamento de memória eficiente

---

## 🚧 Dívidas Técnicas

### **1. Testes Automatizados**

**Status**: ❌ Não implementado  
**Impacto**: Médio  
**Descrição**: O projeto não possui testes unitários, de integração ou E2E implementados.

**Solução Proposta**:

- Implementar testes unitários para serviços (CycleService, SyncService)
- Adicionar testes de integração para fluxos principais
- Implementar testes E2E com Detox ou similar

### **2. Tratamento de Erros Robusto**

**Status**: ⚠️ Parcialmente implementado  
**Impacto**: Alto  
**Descrição**: Alguns cenários de erro não são tratados adequadamente.

**Solução Proposta**:

- Implementar Error Boundary para React
- Adicionar retry automático para operações de rede
- Melhorar feedback visual para erros
- Implementar logging estruturado

### **3. Persistência de Dados Avançada**

**Status**: ⚠️ Básico implementado  
**Impacto**: Médio  
**Descrição**: Usa AsyncStorage básico, sem versionamento ou migração.

**Solução Proposta**:

- Implementar SQLite ou Realm para dados complexos
- Adicionar sistema de versionamento de schema
- Implementar backup automático
- Adicionar compressão para dados históricos

### **4. Performance e Otimização**

**Status**: ⚠️ Funcional mas não otimizado  
**Impacto**: Baixo  
**Descrição**: Algumas operações podem ser otimizadas.

**Solução Proposta**:

- Implementar virtualização para listas grandes
- Otimizar re-renders com React.memo
- Implementar lazy loading para componentes
- Adicionar cache para dados frequentemente acessados

### **5. Segurança**

**Status**: ❌ Não implementado  
**Impacto**: Alto  
**Descrição**: Não há criptografia ou validação de dados sensíveis.

**Solução Proposta**:

- Implementar criptografia para dados sensíveis
- Adicionar validação de entrada
- Implementar autenticação se necessário
- Adicionar certificados SSL para comunicação

### **6. Acessibilidade**

**Status**: ❌ Não implementado  
**Impacto**: Médio  
**Descrição**: Não há suporte para leitores de tela ou navegação por teclado.

**Solução Proposta**:

- Adicionar labels para leitores de tela
- Implementar navegação por teclado
- Adicionar contraste adequado
- Implementar suporte a VoiceOver/TalkBack

### **7. Internacionalização**

**Status**: ❌ Não implementado  
**Impacto**: Baixo  
**Descrição**: Textos hardcoded em português.

**Solução Proposta**:

- Implementar i18n com react-i18next
- Separar textos em arquivos de tradução
- Adicionar suporte a múltiplos idiomas

### **8. Monitoramento e Analytics**

**Status**: ❌ Não implementado  
**Impacto**: Médio  
**Descrição**: Não há telemetria ou monitoramento de erros.

**Solução Proposta**:

- Implementar Crashlytics ou similar
- Adicionar analytics de uso
- Implementar logging remoto
- Adicionar métricas de performance

### **9. CI/CD**

**Status**: ❌ Não implementado  
**Impacto**: Médio  
**Descrição**: Não há pipeline de build automatizado.

**Solução Proposta**:

- Implementar GitHub Actions ou similar
- Adicionar testes automatizados no pipeline
- Implementar deploy automático
- Adicionar análise de código estático

### **10. Documentação de API**

**Status**: ⚠️ Parcial  
**Impacto**: Baixo  
**Descrição**: Documentação básica, pode ser expandida.

**Solução Proposta**:

- Documentar todas as interfaces públicas
- Adicionar exemplos de uso
- Implementar JSDoc completo
- Criar documentação interativa

---

## 📝 Conclusão

O MinetrackApp é uma aplicação robusta e bem estruturada que demonstra boas práticas de desenvolvimento React Native. A arquitetura modular facilita manutenção e evolução, enquanto as funcionalidades atendem aos requisitos especificados.

As dívidas técnicas identificadas são comuns em projetos em desenvolvimento e podem ser priorizadas conforme a necessidade do projeto. A base sólida da arquitetura facilita a implementação dessas melhorias no futuro.
