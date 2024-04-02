import cv2
import tkinter as tk
from tkinter import filedialog, LEFT, RIGHT, BOTTOM, Text, Scrollbar, Entry
from PIL import Image, ImageTk

# Função para abrir uma imagem do sistema de arquivos
def abrir_imagem():
    caminho_imagem = filedialog.askopenfilename()  # Abre uma caixa de diálogo para selecionar uma imagem
    if caminho_imagem:  # Verifica se um arquivo foi selecionado
        imagem = cv2.imread(caminho_imagem)  # Lê a imagem usando OpenCV
        exibir_imagem_original(imagem)  # Exibe a imagem original

# Função para exibir a imagem original no canvas
def exibir_imagem_original(imagem):
    global imagem_original  # Define a imagem original como uma variável global
    imagem_original = imagem.copy()  # Faz uma cópia da imagem original
    imagem = cv2.cvtColor(imagem, cv2.COLOR_BGR2RGB)  # Converte o formato de cores da imagem
    img = Image.fromarray(imagem)  # Converte a imagem para o formato do PIL
    img.thumbnail((400, 300))  # Redimensiona a imagem para caber no canvas
    img = ImageTk.PhotoImage(image=img)  # Converte a imagem para um formato adequado para exibição no tkinter
    canvas_original.delete("all")  # Limpa o canvas original
    canvas_original.create_image(0, 0, anchor=tk.NW, image=img)  # Exibe a imagem no canvas original
    canvas_original.image = img  # Mantém uma referência para a imagem

    # Exibir a matriz da imagem original
    matriz = converter_para_matriz(imagem_original)  # Converte a imagem original para uma matriz
    exibir_matriz_original(matriz)  # Exibe a matriz da imagem original

# Função para processar a imagem com base na operação selecionada
def processar_imagem():
    funcao = var.get()  # Obtém a operação selecionada pelo usuário
    if funcao == "Rotacionar":  # Se a operação for rotação
        angulo = int(entrada_angulo.get())  # Obtém o ângulo de rotação da entrada do usuário
    else:
        angulo = None
    imagem = imagem_original.copy()  # Faz uma cópia da imagem original
    imagem_processada = executar_processamento(funcao, imagem, angulo)  # Executa a operação de processamento selecionada
    exibir_imagem_processada(imagem_processada)  # Exibe a imagem processada

# Função para exibir a imagem processada no canvas
def exibir_imagem_processada(imagem):
    imagem = cv2.cvtColor(imagem, cv2.COLOR_BGR2RGB)  # Converte o formato de cores da imagem
    img = Image.fromarray(imagem)  # Converte a imagem para o formato do PIL
    img.thumbnail((400, 300))  # Redimensiona a imagem para caber no canvas
    img = ImageTk.PhotoImage(image=img)  # Converte a imagem para um formato adequado para exibição no tkinter
    canvas_processada.delete("all")  # Limpa o canvas processado
    canvas_processada.create_image(0, 0, anchor=tk.NW, image=img)  # Exibe a imagem no canvas processado
    canvas_processada.image = img  # Mantém uma referência para a imagem

    # Exibir a matriz da imagem processada
    matriz = converter_para_matriz(imagem)  # Converte a imagem processada para uma matriz
    exibir_matriz_processada(matriz)  # Exibe a matriz da imagem processada

# Função para converter uma imagem para uma matriz
def converter_para_matriz(imagem):
    return imagem.tolist()  # Converte a imagem para uma lista de listas representando a matriz de pixels

# Função para exibir a matriz da imagem original
def exibir_matriz_original(matriz):
    matriz_texto_original.delete(1.0, tk.END)  # Limpa o texto da matriz original
    for linha in matriz:
        matriz_texto_original.insert(tk.END, " ".join(map(str, linha)) + "\n")  # Exibe cada linha da matriz original no widget de texto

# Função para exibir a matriz da imagem processada
def exibir_matriz_processada(matriz):
    matriz_texto_processada.delete(1.0, tk.END)  # Limpa o texto da matriz processada
    for linha in matriz:
        matriz_texto_processada.insert(tk.END, " ".join(map(str, linha)) + "\n")  # Exibe cada linha da matriz processada no widget de texto

# Função para executar diferentes operações de processamento na imagem
def executar_processamento(funcao, imagem, angulo=None):
    if funcao == "Pixelar":
        return pixelar(imagem)  # Chama a função para pixelar a imagem
    elif funcao == "Negativar":
        return negativar(imagem)  # Chama a função para negativar a imagem
    elif funcao == "Espelhar":
        return espelhar(imagem)  # Chama a função para espelhar a imagem
    elif funcao == "Rotacionar":
        return rotacionar(imagem, angulo)  # Chama a função para rotacionar a imagem

# Função para pixelar a imagem
def pixelar(imagem, fator=10):
    altura, largura, _ = imagem.shape  # Obtém as dimensões da imagem
    imagem_pixelada = cv2.resize(imagem, (largura // fator, altura // fator), interpolation=cv2.INTER_NEAREST)  # Redimensiona a imagem para pixelá-la
    return cv2.resize(imagem_pixelada, (largura, altura), interpolation=cv2.INTER_NEAREST)  # Redimensiona a imagem para seu tamanho original

# Função para negativar a imagem
def negativar(imagem):
    return cv2.bitwise_not(imagem)  # Aplica a operação de negativo à imagem

# Função para espelhar a imagem
def espelhar(imagem):
    return cv2.flip(imagem, 1)  # Espelha a imagem horizontalmente

# Função para rotacionar a imagem
def rotacionar(imagem, angulo):
    altura, largura, _ = imagem.shape  # Obtém as dimensões da imagem
    ponto_central = (largura // 2, altura // 2)  # Calcula o ponto central da imagem
    matriz_rotacao = cv2.getRotationMatrix2D(ponto_central, angulo, 1.0)  # Calcula a matriz de rotação
    return cv2.warpAffine(imagem, matriz_rotacao, (largura, altura))  # Aplica a rotação à imagem

# Função para atualizar a imagem ao pressionar Enter ou perder o foco no campo de entrada do ângulo
def atualizar_angulo(event):
    processar_imagem()  # Processa a imagem novamente ao atualizar o ângulo

# Criar a janela principal
root = tk.Tk()
root.title("Processamento de Imagens")

# Criar um frame para conter a imagem original
frame_original = tk.Frame(root)
frame_original.pack(side=LEFT, padx=10, pady=10)

# Canvas para exibir imagem original
canvas_original = tk.Canvas(frame_original, width=400, height=300)
canvas_original.pack()

# Frame para conter a matriz da imagem original
frame_matriz_original = tk.Frame(frame_original)
frame_matriz_original.pack(pady=10)

# Label para a matriz da imagem original
matriz_label_original = tk.Label(frame_matriz_original, text="Matriz da Imagem Original:")
matriz_label_original.pack()

# Texto para exibir a matriz da imagem original
matriz_texto_original = Text(frame_matriz_original, height=10, width=50)
matriz_texto_original.pack()

# Barra de rolagem para a matriz da imagem original
scrollbar_original = Scrollbar(frame_matriz_original)
scrollbar_original.pack(side=RIGHT, fill=tk.Y)
matriz_texto_original.config(yscrollcommand=scrollbar_original.set)
scrollbar_original.config(command=matriz_texto_original.yview)

# Criar um frame para conter a imagem processada
frame_processada = tk.Frame(root)
frame_processada.pack(side=RIGHT, padx=10, pady=10)

# Canvas para exibir imagem processada
canvas_processada = tk.Canvas(frame_processada, width=400, height=300)
canvas_processada.pack()

# Frame para conter a matriz da imagem processada
frame_matriz_processada = tk.Frame(frame_processada)
frame_matriz_processada.pack(pady=10)

# Label para a matriz da imagem processada
matriz_label_processada = tk.Label(frame_matriz_processada, text="Matriz da Imagem Processada:")
matriz_label_processada.pack()

# Texto para exibir a matriz da imagem processada
matriz_texto_processada = Text(frame_matriz_processada, height=10, width=50)
matriz_texto_processada.pack()

# Barra de rolagem para a matriz da imagem processada
scrollbar_processada = Scrollbar(frame_matriz_processada)
scrollbar_processada.pack(side=RIGHT, fill=tk.Y)
matriz_texto_processada.config(yscrollcommand=scrollbar_processada.set)
scrollbar_processada.config(command=matriz_texto_processada.yview)

# Frame para conter as opções de funções
frame_opcoes = tk.Frame(root)
frame_opcoes.pack(pady=10)

# Botão para abrir imagem
abrir_button = tk.Button(frame_opcoes, text="Abrir Imagem", command=abrir_imagem)
abrir_button.grid(row=0, column=0, padx=5, pady=5)

# Opções de funções
funcoes = ["Pixelar", "Negativar", "Espelhar", "Rotacionar"]
var = tk.StringVar(frame_opcoes)
var.set(funcoes[0])  # Valor padrão
option_menu = tk.OptionMenu(frame_opcoes, var, *funcoes)
option_menu.config(width=15)  # Aumenta o tamanho do menu
option_menu.grid(row=0, column=1, padx=5, pady=5)

# Entrada para graus de rotação
entrada_angulo = Entry(frame_opcoes, width=10)
entrada_angulo.grid(row=0, column=2, padx=5, pady=5)
angulo_label = tk.Label(frame_opcoes, text="Graus de Rotação:")
angulo_label.grid(row=0, column=3, padx=5, pady=5)
entrada_angulo.bind("<Return>", atualizar_angulo)  # Atualizar ao pressionar Enter
entrada_angulo.bind("<FocusOut>", atualizar_angulo)  # Atualizar ao perder o foco

# Botão para processar imagem
processar_button = tk.Button(frame_opcoes, text="Processar Imagem", command=processar_imagem)
processar_button.grid(row=0, column=4, padx=5, pady=5)

# Executar a interface
root.mainloop()
