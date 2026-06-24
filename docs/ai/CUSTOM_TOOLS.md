# Custom Tools Guidelines & Rules — Bullet Journal Planner

This document describes the custom utility scripts available in the `tools/` directory and outlines mandatory rules and workflows for using them.

---

## 🛠️ Tools disponíveis em `/tools`

Antes de explorar o projeto manualmente, sempre verifique se um dos scripts abaixo resolve a necessidade. Eles são otimizados para este projeto e reduzem o consumo de context window.

- **`tools/search_symbol <termo>`**  
  Um `grep` pré-configurado com as extensões corretas, excluindo automaticamente pastas como `node_modules`, `dist` e `.git`.
  
- **`tools/find_usages <símbolo>`**  
  Pesquisa todas as referências a um determinado símbolo usando limites de palavra (word boundary), fornecendo uma saída compactada.
  
- **`tools/list_changed_files [ref]`**  
  Lista os arquivos modificados desde o `HEAD` ou desde uma referência git informada.
  
- **`tools/summarize_file <caminho>`**  
  Exibe o topo e o fim de um arquivo sem precisar lê-lo por completo.

---

## ⚠️ Regras de Uso Obrigatórias

1. **Pesquisa Inicial OBRIGATÓRIA:**  
   Use `search_symbol` ou `find_usages` antes de abrir qualquer arquivo.
   
2. **Resumo OBRIGATÓRIO:**  
   Use `summarize_file` antes de ler um arquivo completo para decidir se a leitura na íntegra é necessária.
   
3. **Task Start OBRIGATÓRIO:**  
   Use `list_changed_files` no início de tarefas de revisão ou debugging.
   
4. **Leitura Sob Demanda:**  
   Só leia arquivos completos quando as ferramentas acima não forem suficientes para extrair a informação necessária.

---

## 🧭 Fluxos Recomendados

### 1. Análise de Impacto
1. Execute `tools/find_usages <símbolo>` para mapear as referências ao símbolo.
2. Execute `tools/summarize_file` nos arquivos de definição para revelar assinaturas e tipos.
3. Leia trechos específicos com offset nos pontos de chamada correspondentes se necessário.
4. **`tools/summarize_file` nos tipos dos parâmetros → revela hierarquia**
   - **⚠️ GATE OBRIGATÓRIO:** Se `find_usages` ou `search_symbol` encontrarem **mais de uma definição** com o mesmo nome (ex: dois `App` em arquivos diferentes), você DEVE verificar a hierarquia de tipos ANTES de concluir a análise.
   - Verifique se o tipo do parâmetro é uma classe do projeto ou uma interface implementada em múltiplos locais.
   - Em um monorepo, métodos homônimos em projetos diferentes são totalmente independentes. Nunca assuma que são a mesma coisa.
5. Se o escopo for restrito a um projeto (ex: "no projeto X"), mas encontrar definições do mesmo símbolo em outros projetos do monorepo, documente:  
   *"Este relatório cobre apenas o projeto X. Foram detectadas definições homônimas no projeto Y (caminho), mas elas não foram analisadas."*

### 2. Debugging / Investigação de Bugs
1. Execute `tools/list_changed_files` para focar nos arquivos alterados recentemente.
2. Execute `tools/search_symbol <termo relacionado>` para localizar onde o comportamento relevante é definido.
3. Execute `tools/summarize_file` nos arquivos candidatos para decidir quais merecem leitura completa.
