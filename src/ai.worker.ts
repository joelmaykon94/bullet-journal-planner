import { pipeline, env } from '@huggingface/transformers';

// Configurar para desabilitar modelos locais e buscar diretamente do Hub do Hugging Face
env.allowLocalModels = false;

// Otimizações de desempenho para ONNX Runtime WASM (Executado no CPU)
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.simd = true;
  env.backends.onnx.wasm.numThreads = typeof navigator !== 'undefined'
    ? Math.min(4, navigator.hardwareConcurrency || 4)
    : 4;
}

let generator: any = null;

async function getGenerator(progressCallback: (progress: any) => void) {
  if (generator) return generator;

  // Carregamos o modelo Qwen2.5-0.5B-Instruct quantizado em 4 bits (q4)
  // Tentamos primeiro WebGPU (aceleração por hardware até 20x mais rápida) e depois WASM CPU como fallback.
  try {
    console.log("Tentando inicializar Qwen2.5 via WebGPU...");
    generator = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
      progress_callback: progressCallback,
      dtype: 'q4',
      device: 'webgpu',
    });
    console.log("Qwen2.5 carregado com sucesso via WebGPU!");
  } catch (webgpuError) {
    console.warn("WebGPU indisponível no navegador/hardware. Utilizando WASM CPU como fallback.", webgpuError);
    generator = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
      progress_callback: progressCallback,
      dtype: 'q4',
      device: 'cpu',
    });
    console.log("Qwen2.5 carregado com sucesso via WASM CPU!");
  }

  return generator;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === 'load') {
    try {
      await getGenerator((progress: any) => {
        if (progress.status === 'progress') {
          self.postMessage({
            type: 'progress',
            data: {
              file: progress.file,
              progress: progress.progress,
              loaded: progress.loaded,
              total: progress.total,
            },
          });
        } else if (progress.status === 'ready') {
          self.postMessage({
            type: 'file_ready',
            data: { file: progress.file },
          });
        }
      });
      self.postMessage({ type: 'ready' });
    } catch (err: any) {
      self.postMessage({ type: 'error', data: err.message || err });
    }
  }

  else if (type === 'generate') {
    try {
      const { text, maxTokens, mode = 'split' } = data;
      const defaultMaxTokens = mode === 'optimize' ? 30 : 80;
      const finalMaxTokens = maxTokens || defaultMaxTokens;
      const gen = await getGenerator(() => {});

      let formattedPrompt = '';
      if (mode === 'optimize') {
        formattedPrompt = `<|im_start|>system
Reescreva a tarefa de forma mais concreta e curta, iniciando com um verbo de ação. Escreva APENAS a tarefa reescrita.<|im_end|>
<|im_start|>user
Reescreva: Estudar matemática<|im_end|>
<|im_start|>assistant
Abrir o livro e resolver 3 exercícios<|im_end|>
<|im_start|>user
Reescreva: ${text}<|im_end|>
<|im_start|>assistant
`;
      } else if (mode === 'advise') {
        formattedPrompt = text;
      } else {
        formattedPrompt = `<|im_start|>system
Divida a tarefa em 3 a 4 micro-passos sequenciais muito simples em pt-BR. Escreva APENAS a lista começando com "- Passo X:". Sem introduções.<|im_end|>
<|im_start|>user
Divida: Lavar a louça<|im_end|>
<|im_start|>assistant
- Passo 1: Separar os copos e pratos na pia
- Passo 2: Ensaboar a esponja
- Passo 3: Lavar copos e pratos
- Passo 4: Enxaguar a pia<|im_end|>
<|im_start|>user
Divida: ${text}<|im_end|>
<|im_start|>assistant
- Passo 1:`;
      }

      const output = await gen(formattedPrompt, {
        max_new_tokens: mode === 'advise' ? 80 : finalMaxTokens,
        temperature: mode === 'advise' ? 0.7 : 0.3, // Temperatura ligeiramente mais alta para aconselhamento interativo criativo
        top_k: 30,
        repetition_penalty: 1.2, // Penalidade contra repetições infinitas
        do_sample: true,
        return_full_text: false,
      });

      let generatedText = '';
      if (Array.isArray(output) && output[0]?.generated_text) {
        generatedText = output[0].generated_text;
      } else if (output[0]?.text) {
        generatedText = output[0].text;
      } else {
        generatedText = JSON.stringify(output);
      }

      // Remover prefixo caso o pipeline retorne o prompt completo
      if (generatedText.includes(formattedPrompt)) {
        generatedText = generatedText.replace(formattedPrompt, '');
      } else {
        // Remover tags ChatML residuais do assistant
        const assistantMarker = '<|im_start|>assistant';
        if (generatedText.includes(assistantMarker)) {
          generatedText = generatedText.split(assistantMarker).pop() || generatedText;
        }
      }

      // Recompor o resultado
      let cleanResult = '';
      if (mode === 'optimize' || mode === 'advise') {
        cleanResult = generatedText
          .replace(/<\|im_end\|>/g, '')
          .replace(/<\|im_start\|>/g, '')
          .replace(/^"|"$/g, '')
          .trim();
      } else {
        cleanResult = ('- Passo 1:' + generatedText)
          .replace(/<\|im_end\|>/g, '')
          .replace(/<\|im_start\|>/g, '')
          .trim();
      }

      self.postMessage({ type: 'result', data: cleanResult, mode });
    } catch (err: any) {
      self.postMessage({ type: 'error', data: err.message || err });
    }
  }
};
