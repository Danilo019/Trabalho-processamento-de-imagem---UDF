// Adiciona ouvintes de eventos aos botões para executar ações quando clicados
document.getElementById('botao-abrir').addEventListener('click', abrirImagem);
document.getElementById('botao-processar').addEventListener('click', processarImagem);
document.getElementById('botao-escalar').addEventListener('click', escalarImagem);

// Função para lidar com a abertura de imagem
function abrirImagem() {
  // Cria um elemento de input para selecionar arquivos
  const input = document.createElement('input');
  input.type = 'file'; // Define o tipo como arquivo
  input.accept = 'image/*'; // Aceita apenas arquivos de imagem

  // Adiciona um ouvinte de eventos para quando o arquivo é selecionado
  input.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Obtém o arquivo selecionado
    const url = URL.createObjectURL(file); // Cria uma URL para o arquivo

    const canvasOriginal = document.getElementById('canvas-original');
    const contextOriginal = canvasOriginal.getContext('2d');
    const imagemOriginal = new Image(); // Cria um objeto de imagem
    imagemOriginal.src = url; // Define a URL da imagem

    // Quando a imagem é carregada, redimensiona para caber no canvas e atualiza a matriz de pixels
    imagemOriginal.onload = () => {
      const maxWidth = canvasOriginal.width;
      const maxHeight = canvasOriginal.height;
      const width = imagemOriginal.width;
      const height = imagemOriginal.height;

      let novaLargura = width;
      let novaAltura = height;

      // Redimensiona a imagem para caber no canvas se for muito grande
      if (width > height) {
        if (width > maxWidth) {
          novaAltura *= maxWidth / width;
          novaLargura = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          novaLargura *= maxHeight / height;
          novaAltura = maxHeight;
        }
      }

      // Redimensiona o canvas para as dimensões da imagem e desenha a imagem
      canvasOriginal.width = novaLargura;
      canvasOriginal.height = novaAltura;
      contextOriginal.drawImage(imagemOriginal, 0, 0, novaLargura, novaAltura);

      // Atualiza a matriz de pixels do canvas original
      atualizarMatriz('original', novaLargura, novaAltura, contextOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height).data);
    };
  });

  // Simula um clique no input de arquivo para abrir a janela de seleção de arquivo
  input.click();
}

// Função para lidar com o processamento de imagem
function processarImagem() {
  // Obtém a opção selecionada no menu
  const menuOpcoes = document.getElementById('menu-opcoes');
  const valorOpcao = menuOpcoes.value;

  // Obtém os valores de ângulo e deslocamento dos inputs
  const inputAngulo = document.getElementById('input-angulo');
  const angulo = parseInt(inputAngulo.value, 10);
  const inputDeslocamentoX = document.getElementById('input-deslocamento-x');
  const deslocamentoX = parseInt(inputDeslocamentoX.value, 10);
  const inputDeslocamentoY = document.getElementById('input-deslocamento-y');
  const deslocamentoY = parseInt(inputDeslocamentoY.value, 10);

  // Obtém o canvas original e seu contexto
  const canvasOriginal = document.getElementById('canvas-original');
  const contextOriginal = canvasOriginal.getContext('2d');
  const dadosImagemOriginal = contextOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);

  // Executa uma ação com base na opção selecionada no menu
  switch (valorOpcao) {
    case 'Pixelar':
      pixelizar(dadosImagemOriginal, 10); // Alterado o tamanho do pixel para 10 (por exemplo)
      break;
    case 'Negativar':
      negativar(dadosImagemOriginal);
      break;
    case 'Espelhar':
      espelhar(dadosImagemOriginal, 'horizontal');
      break;
    case 'Rotacionar':
      rotacionar(dadosImagemOriginal, angulo);
      break;
    case 'Deslocar':
      deslocar(dadosImagemOriginal, deslocamentoX, deslocamentoY); // Aplica o deslocamento
      break;
    default:
      break;
  }

  // Obtém o canvas processado e seu contexto
  const canvasProcessada = document.getElementById('canvas-processada');
  const contextProcessada = canvasProcessada.getContext('2d');

  // Define a largura e altura do canvas processado como a mesma do canvas original
  canvasProcessada.width = canvasOriginal.width;
  canvasProcessada.height = canvasOriginal.height;

  // Desenha os dados de imagem processados no canvas processado
  contextProcessada.putImageData(dadosImagemOriginal, 0, 0);

  // Atualiza a matriz de pixels do canvas processado
  atualizarMatriz('processada', canvasOriginal.width, canvasOriginal.height, dadosImagemOriginal.data);
}

// Função para atualizar a matriz de pixels
function atualizarMatriz(tipo, largura, altura, dados) {
  let matrizString = '';
  // Itera sobre cada linha e coluna do canvas
  for (let i = 0; i < altura; i++) {
    for (let j = 0; j < largura; j++) {
      const posicao = (i * largura + j) * 4; // Calcula o índice no array de dados de imagem
      matrizString += `${dados[posicao]}, ${dados[posicao + 1]}, ${dados[posicao + 2]}\n`; // Adiciona os valores de cor à string
    }
    if (tipo === 'processada') {
      matrizString += '\n'; // Adiciona uma nova linha entre as linhas da matriz
    }
  }

  // Define o valor da string da matriz no textarea correspondente
  const textarea = document.getElementById(`matriz-text-${tipo}`);
  textarea.value = matrizString;

  // Faz a barra de rolagem da textarea rolar para baixo
  const scrollbar = document.getElementById(`scrollbar-${tipo}`);
  scrollbar.scrollTop = scrollbar.scrollHeight;
}

// Função para pixelizar a imagem
function pixelizar(dadosImagem, tamanho) {
  const largura = dadosImagem.width;
  const altura = dadosImagem.height;

  // Itera sobre cada bloco na imagem
  for (let y = 0; y < altura; y += tamanho) {
    for (let x = 0; x < largura; x += tamanho) {
      let vermelho = 0,
        verde = 0,
        azul = 0,
        alfa = 0;
      const maxX = Math.min(x + tamanho, largura);
      const maxY = Math.min(y + tamanho, altura);
      const pixelsPorBloco = (maxX - x) * (maxY - y);

      // Calcula a média dos valores de cor em um bloco
      for (let blocoY = y; blocoY < maxY; blocoY++) {
        for (let blocoX = x; blocoX < maxX; blocoX++) {
          const indice = (blocoY * largura + blocoX) * 4;
          vermelho += dadosImagem.data[indice];
          verde += dadosImagem.data[indice + 1];
          azul += dadosImagem.data[indice + 2];
          alfa += dadosImagem.data[indice + 3];
        }
      }

      vermelho /= pixelsPorBloco;
      verde /= pixelsPorBloco;
      azul /= pixelsPorBloco;
      alfa /= pixelsPorBloco;

      // Define os valores médios de cor para todos os pixels no bloco
      for (let blocoY = y; blocoY < maxY; blocoY++) {
        for (let blocoX = x; blocoX < maxX; blocoX++) {
          const indice = (blocoY * largura + blocoX) * 4;
          dadosImagem.data[indice] = vermelho;
          dadosImagem.data[indice + 1] = verde;
          dadosImagem.data[indice + 2] = azul;
          dadosImagem.data[indice + 3] = alfa;
        }
      }
    }
  }
}

// Função para negativar a imagem
function negativar(dadosImagem) {
  const dados = dadosImagem.data;
  // Itera sobre cada pixel na imagem e negativa os valores de cor
  for (let i = 0; i < dados.length; i += 4) {
    dados[i] = 255 - dados[i];
    dados[i + 1] = 255 - dados[i + 1];
    dados[i + 2] = 255 - dados[i + 2];
  }
}

// Função para espelhar a imagem
function espelhar(dadosImagem, direcao) {
  const { width, height, data } = dadosImagem;
  const espelhado = new Uint8ClampedArray(data.length);

  // Itera sobre cada pixel na imagem e espelha horizontal ou verticalmente
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const indice = (y * width + x) * 4;
      let alvoX, alvoY;

      if (direcao === 'horizontal') {
        alvoX = width - x - 1;
        alvoY = y;
      } else if (direcao === 'vertical') {
        alvoX = x;
        alvoY = height - y - 1;
      }

      const indiceAlvo = (alvoY * width + alvoX) * 4;
      espelhado[indiceAlvo] = data[indice];
      espelhado[indiceAlvo + 1] = data[indice + 1];
      espelhado[indiceAlvo + 2] = data[indice + 2];
      espelhado[indiceAlvo + 3] = data[indice + 3];
    }
  }

  // Atualiza os dados da imagem com os dados espelhados
  dadosImagem.data.set(espelhado);
}

// Função para rotacionar a imagem
function rotacionar(dadosImagem, angulo) {
  const { width, height, data } = dadosImagem;
  const rotacionado = new Uint8ClampedArray(data.length);

  // Calcula o centro da imagem e o ângulo em radianos
  const centroX = width / 2;
  const centroY = height / 2;
  const anguloRad = (angulo * Math.PI) / 180;

  // Itera sobre cada pixel na imagem e rotaciona
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rotacionadoX = Math.round(
        (x - centroX) * Math.cos(anguloRad) - (y - centroY) * Math.sin(anguloRad) + centroX
      );
      const rotacionadoY = Math.round(
        (x - centroX) * Math.sin(anguloRad) + (y - centroY) * Math.cos(anguloRad) + centroY
      );

      if (rotacionadoX >= 0 && rotacionadoX < width && rotacionadoY >= 0 && rotacionadoY < height) {
        const indice = (y * width + x) * 4;
        const indiceRotacionado = (rotacionadoY * width + rotacionadoX) * 4;
        rotacionado[indiceRotacionado] = data[indice];
        rotacionado[indiceRotacionado + 1] = data[indice + 1];
        rotacionado[indiceRotacionado + 2] = data[indice + 2];
        rotacionado[indiceRotacionado + 3] = data[indice + 3];
      }
    }
  }

  // Atualiza os dados da imagem com os dados rotacionados
  dadosImagem.data.set(rotacionado);
}

// Função para deslocar a imagem
function deslocar(dadosImagem, deslocamentoX, deslocamentoY) {
  const { width, height, data } = dadosImagem;
  const deslocado = new Uint8ClampedArray(data.length);

  // Itera sobre cada pixel na imagem e aplica o deslocamento
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const indice = (y * width + x) * 4;
      const deslocadoX = x + deslocamentoX;
      const deslocadoY = y + deslocamentoY;

      if (deslocadoX >= 0 && deslocadoX < width && deslocadoY >= 0 && deslocadoY < height) {
        const indiceDeslocado = (deslocadoY * width + deslocadoX) * 4;
        deslocado[indiceDeslocado] = data[indice];
        deslocado[indiceDeslocado + 1] = data[indice + 1];
        deslocado[indiceDeslocado + 2] = data[indice + 2];
        deslocado[indiceDeslocado + 3] = data[indice + 3];
      }
    }
  }

  // Atualiza os dados da imagem com os dados deslocados
  dadosImagem.data.set(deslocado);
}

// Função para escalonar a imagem
function escalarImagem() {
  // Obtém os fatores de escala X e Y dos inputs
  const inputEscalaX = document.getElementById('input-escala-x');
  const escalaX = parseFloat(inputEscalaX.value);
  const inputEscalaY = document.getElementById('input-escala-y');
  const escalaY = parseFloat(inputEscalaY.value);

  // Obtém o canvas original e seu contexto
  const canvasOriginal = document.getElementById('canvas-original');
  const contextOriginal = canvasOriginal.getContext('2d');
  const dadosImagemOriginal = contextOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);

  // Calcula a nova largura e altura da imagem escalada
  const novaLargura = canvasOriginal.width * escalaX;
  const novaAltura = canvasOriginal.height * escalaY;

  // Cria um novo canvas para a imagem escalada
  const canvasEscalar = document.createElement('canvas');
  canvasEscalar.width = novaLargura;
  canvasEscalar.height = novaAltura;
  const contextEscalar = canvasEscalar.getContext('2d');
  // Desenha a imagem original no novo canvas, aplicando o fator de escala
  contextEscalar.drawImage(canvasOriginal, 0, 0, novaLargura, novaAltura);

  // Obtém o canvas processado e seu contexto
  const canvasProcessada = document.getElementById('canvas-processada');
  canvasProcessada.width = novaLargura;
  canvasProcessada.height = novaAltura;
  const contextProcessada = canvasProcessada.getContext('2d');
  // Desenha a imagem escalada no canvas processado
  contextProcessada.drawImage(canvasEscalar, 0, 0, novaLargura, novaAltura);
}
