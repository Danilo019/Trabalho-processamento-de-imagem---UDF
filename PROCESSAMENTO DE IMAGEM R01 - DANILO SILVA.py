import cv2
import os
import tkinter as tk
from tkinter import filedialog
from tkinter import messagebox
from PIL import Image, ImageTk
import numpy as np

def processar_imagem(imagem):
    # Processar Imagem
    # Seu código de processamento de imagem aqui

    # Pixelizar Imagem
    pixelizada = pixelizar_imagem(imagem, 10)

    # Inverter Cores
    invertida = inverter_cores(imagem)

    # Espelhar Imagem
    espelhada = espelhar_imagem(imagem)

    # Rotacionar Imagem
    rotacionada = rotacionar_imagem(imagem, 45)

    return pixelizada, invertida, espelhada, rotacionada

def pixelizar_imagem(imagem, tamanho):
    # Dividir imagem em quadrados iguais
    altura, largura, _ = imagem.shape
    altura_celula = altura // tamanho
    largura_celula = largura // tamanho

    # Substituir cada quadrado pela cor média
    for i in range(tamanho):
        for j in range(tamanho):
            regiao_interesse = imagem[i * altura_celula:(i + 1) * altura_celula,
                                   j * largura_celula:(j + 1) * largura_celula]
            cor_media = np.average(regiao_interesse, axis=None)
            imagem[i * altura_celula:(i + 1) * altura_celula,
                   j * largura_celula:(j + 1) * largura_celula] = [cor_media] * 3

    return imagem

def inverter_cores(imagem):
    return cv2.bitwise_not(imagem)

def espelhar_imagem(imagem, eixo=0):
    return cv2.flip(imagem, eixo)

def rotacionar_imagem(imagem, angulo):
    (altura, largura) = imagem.shape[:2]
    centro = (largura // 2, altura // 2)

    # Rotacionar sem manter o tamanho original
    M = cv2.getRotationMatrix2D(centro, angulo, 1.0)
    rotacionada = cv2.warpAffine(imagem, M, (largura, altura))

    return rotacionada

def selecionar_imagem():
    file_path = filedialog.askopenfilename(filetypes=[('Arquivos de Imagem', '*.jpg *.jpeg *.png')])
    if file_path:
        imagem = cv2.imread(file_path)
        imagem_tk = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(imagem, cv2.COLOR_BGR2RGB)))
        image_label.config(image=imagem_tk)
        image_label.image = imagem_tk
        global imagem_original
        imagem_original = imagem.copy()

def processar_imagem_click(botao):
    global imagem_original, botao_rotacionar  # Adicionando botao_rotacionar ao escopo global
    if imagem_original is None:
        messagebox.showerror("Erro", "Por favor, selecione uma imagem primeiro.")
        return
    imagem = imagem_original.copy()
    pixelizada, invertida, espelhada, rotacionada = processar_imagem(imagem)
    botao_pixelizar.config(image=ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(pixelizada, cv2.COLOR_BGR2RGB))))
    botao_pixelizar.image = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(pixelizada, cv2.COLOR_BGR2RGB)))
    botao_inverter.config(image=ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(invertida, cv2.COLOR_BGR2RGB))))
    botao_inverter.image = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(invertida, cv2.COLOR_BGR2RGB)))
    botao_espelhar.config(image=ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(espelhada, cv2.COLOR_BGR2RGB))))
    botao_espelhar.image = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(espelhada, cv2.COLOR_BGR2RGB)))
    botao_rotacionar.config(image=ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(rotacionada, cv2.COLOR_BGR2RGB))))
    botao_rotacionar = tk.Button(root, text="Rotacionar", command=lambda: processar_imagem_click(botao_rotacionar)); botao_rotacionar.pack(padx=10, pady=10)


root = tk.Tk()

imagem_original = None

image_label = tk.Label(root)
image_label.pack(padx=10, pady=10)

selecionar_button = tk.Button(root, text="Selecionar Imagem", command=selecionar_imagem)
selecionar_button.pack(padx=10, pady=10)

botao_pixelizar = tk.Button(root, text="Pixelizar", command=lambda: processar_imagem_click(botao_pixelizar))
botao_pixelizar.pack(padx=10, pady=10)

botao_inverter = tk.Button(root, text="Inverter Cores", command=lambda: processar_imagem_click(botao_inverter))
botao_inverter.pack(padx=10, pady=10)

botao_espelhar = tk.Button(root, text="Espelhar", command=lambda: processar_imagem_click(botao_espelhar))
botao_espelhar.pack(padx=10, pady=10)

botao_rotacionar = tk.Button(root, text="Rotacionar", command=lambda: processar_imagem_click(botao_rotacionar))
botao_rotacionar.pack(padx=10, pady=10)

root.mainloop()


