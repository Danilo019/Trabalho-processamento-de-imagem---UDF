##GERANDO MATRIZ

import tkinter as tk
from tkinter import filedialog
import cv2

def carregar_imagem():
    # Abre uma janela de diálogo para selecionar uma imagem
    caminho_imagem = filedialog.askopenfilename()
    
    # Carrega a imagem usando OpenCV
    imagem = cv2.imread(caminho_imagem)

    # Converte a imagem para escala de cinza
    imagem_grayscale = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)

    # Exemplo de processamento de imagem - aqui, apenas mostramos as dimensões da imagem
    altura, largura = imagem_grayscale.shape
    print("Altura da imagem:", altura)
    print("Largura da imagem:", largura)

# Cria uma janela
janela = tk.Tk()
janela.title("Processamento de Imagem")

# Cria um botão para carregar a imagem
botao_carregar = tk.Button(janela, text="Carregar Imagem", command=carregar_imagem)
botao_carregar.pack()

# Inicia o loop principal da janela
janela.mainloop()
