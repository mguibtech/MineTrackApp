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

- O arquivo `sync_servidor.jsonl` é gerado em:
  ```
  [storage interno do app]/files/sync_servidor.jsonl
  ```
  - Em dispositivos Android, normalmente:
    `/data/data/com.minetrackapp/files/sync_servidor.jsonl`
  - Para acessar, use um gerenciador de arquivos com acesso root ou o Android Studio Device File Explorer.

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
