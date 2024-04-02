document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('abrir-button').addEventListener('click', openImage);
    document.getElementById('processar-button').addEventListener('click', processImage);
});

function openImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);

        const canvasOriginal = document.getElementById('canvas-original');
        const contextOriginal = canvasOriginal.getContext('2d');
        const imageOriginal = new Image();
        imageOriginal.src = url;

        imageOriginal.onload = () => {
            canvasOriginal.width = imageOriginal.width;
            canvasOriginal.height = imageOriginal.height;
            contextOriginal.drawImage(imageOriginal, 0, 0);

            updateMatrix('original', imageOriginal.width, imageOriginal.height, contextOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height).data);
        };

        const canvasProcessed = document.getElementById('canvas-processada');
        const contextProcessed = canvasProcessed.getContext('2d');
        const imageProcessed = new Image();
        imageProcessed.src = url;

        imageProcessed.onload = () => {
            canvasProcessed.width = imageProcessed.width;
            canvasProcessed.height = imageProcessed.height;
            contextProcessed.drawImage(imageProcessed, 0, 0);

            updateMatrix('processed', imageProcessed.width, imageProcessed.height, contextProcessed.getImageData(0, 0, canvasProcessed.width, canvasProcessed.height).data);
        };
    });

    input.click();
}

function processImage() {
    const optionMenu = document.getElementById('option-menu');
    const optionValue = optionMenu.value;
    const inputAngulo = document.getElementById('input-angulo');
    const angulo = parseInt(inputAngulo.value, 10);

    const canvasOriginal = document.getElementById('canvas-original');
    const contextOriginal = canvasOriginal.getContext('2d');
    const imageDataOriginal = contextOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);

    const canvasProcessed = document.getElementById('canvas-processada');
    const contextProcessed = canvasProcessed.getContext('2d');

    switch (optionValue) {
        case 'Pixelar':
            pixelate(imageDataOriginal, angulo);
            break;
        case 'Negativar':
            negativate(imageDataOriginal);
            break;
        case 'Espelhar':
            flip(imageDataOriginal, 'horizontal');
            break;
        case 'Rotacionar':
            rotate(imageDataOriginal, angulo);
            break;
        default:
            break;
    }

    contextProcessed.putImageData(imageDataOriginal, 0, 0);
    updateMatrix('processed', canvasOriginal.width, canvasOriginal.height, imageDataOriginal.data);
}

function updateMatrix(type, width, height, data) {
    let matrixString = '';
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const pos = (i * width + j) * 4;
            matrixString += `${data[pos]}, ${data[pos + 1]}, ${data[pos + 2]}\n`;
        }
        if (type === 'processed') {
            matrixString += '\n';
        }
    }

    const textarea = document.getElementById(`matriz-text-${type}`);
    textarea.value = matrixString;

    const scrollbar = document.getElementById(`scrollbar-${type}`);
    scrollbar.scrollTop = scrollbar.scrollHeight;
}

function pixelate(imageData, size) {
    const width = imageData.width;
    const height = imageData.height;
    const newWidth = Math.ceil(width / size) * size;
    const newHeight = Math.ceil(height / size) * size;
    const newImageData = new ImageData(newWidth, newHeight);
    const pixelsPerBlock = size * size;

    for (let y = 0; y < newHeight; y += size) {
        for (let x = 0; x < newWidth; x += size) {
            let red = 0,
                green = 0,
                blue = 0,
                alpha = 0;

            for (let blockY = 0; blockY < size; blockY++) {
                for (let blockX = 0; blockX < size; blockX++) {
                    const nx = x + blockX;
                    const ny = y + blockY;
                    const index = (ny * width + nx) * 4;
                    red += imageData.data[index];
                    green += imageData.data[index + 1];
                    blue += imageData.data[index + 2];
                    alpha += imageData.data[index + 3];
                }
            }

            red /= pixelsPerBlock;
            green /= pixelsPerBlock;
            blue /= pixelsPerBlock;
            alpha /= pixelsPerBlock;

            for (let blockY = 0; blockY < size; blockY++) {
                for (let blockX = 0; blockX < size; blockX++) {
                    const nx = x + blockX;
                    const ny = y + blockY;
                    const index = (ny * newWidth + nx) * 4;
                    newImageData.data[index] = red;
                    newImageData.data[index + 1] = green;
                    newImageData.data[index + 2] = blue;
                    newImageData.data[index + 3] = alpha;
                }
            }
        }
    }

    imageData.data.set(newImageData.data);
}

function negativate(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
}

function flip(imageData, direction) {
    const { width, height, data } = imageData;
    const flipped = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let targetX, targetY;

            if (direction === 'horizontal') {
                targetX = width - x - 1;
                targetY = y;
            } else if (direction === 'vertical') {
                targetX = x;
                targetY = height - y - 1;
            }

            const targetIndex = (targetY * width + targetX) * 4;
            flipped[targetIndex] = data[index];
            flipped[targetIndex + 1] = data[index + 1];
            flipped[targetIndex + 2] = data[index + 2];
            flipped[targetIndex + 3] = data[index + 3];
        }
    }

    imageData.data.set(flipped);
}

function rotate(imageData, angle) {
    const { width, height, data } = imageData;
    const rotated = new Uint8ClampedArray(data.length);

    const centerX = width / 2;
    const centerY = height / 2;
    const angleRad = (angle * Math.PI) / 180;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const rotatedX = Math.round(
                (x - centerX) * Math.cos(angleRad) - (y - centerY) * Math.sin(angleRad) + centerX
            );
            const rotatedY = Math.round(
                (x - centerX) * Math.sin(angleRad) + (y - centerY) * Math.cos(angleRad) + centerY
            );

            if (rotatedX >= 0 && rotatedX < width && rotatedY >= 0 && rotatedY < height) {
                const index = (y * width + x) * 4;
                const rotatedIndex = (rotatedY * width + rotatedX) * 4;
                rotated[rotatedIndex] = data[index];
                rotated[rotatedIndex + 1] = data[index + 1];
                rotated[rotatedIndex + 2] = data[index + 2];
                rotated[rotatedIndex + 3] = data[index + 3];
            }
        }
    }

    imageData.data.set(rotated);
}
