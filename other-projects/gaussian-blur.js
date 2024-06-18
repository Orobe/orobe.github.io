let canvas;
let inputImg;
let outputImg;

let MAX_RADIUS = 1000;

function setup() {
    let input = createFileInput(loadImg, false).elt;
    input.classList.add('form-control');
    input.id = 'file-input';
    input.setAttribute('accept', '.jpg,.png');
    input.remove();
    document.getElementById('input-form').appendChild(input);
    canvas = createCanvas(300, 300);
    calculateResizeCanvas();
    pixelDensity(1);
    document.getElementById('radius-slider').value = 1;
    document.getElementById('notification-close').addEventListener('click', () => {
        document.getElementById('notification').classList.remove('notification-show');
    })

    let range = document.getElementById('radius-slider');
    let field = document.getElementById('radius-value');
    range.addEventListener('input', function (e) {
        field.value = e.target.value;
    });
    field.addEventListener('input', function (e) {
        if (e.target.value > MAX_RADIUS) e.target.value = MAX_RADIUS;
        range.value = e.target.value;
    });
}

let showInput = true;
function draw() {
    background(255);
    noStroke();
    if (inputImg && showInput) image(inputImg, 0, 0, width, height);
    else if (outputImg) image(outputImg, 0, 0, width, height);
    noLoop();
}

let fileName;
function loadImg(file) {
    if (file.type === 'image') {
        fileName = file.name;
        inputImg = loadImage(file.data, () => {
            document.getElementById('btn-start').disabled = false;
            showInput = true;
            calculateResizeCanvas();
        }, () => { alert('There was an error when loading the image. Please try again.'); });
    }
}

function calculateResizeCanvas() {
    let parent = canvas.elt.parentElement;
    let maxWidth = parent.offsetWidth;
    let maxHeight = parent.offsetHeight;

    if (inputImg) {
        let imgRatio = inputImg.width / inputImg.height;
        if (maxWidth >= inputImg.width && maxHeight >= inputImg.height) resizeCanvas(inputImg.width, inputImg.height);
        else {
            if (maxWidth >= inputImg.width) resizeCanvas(maxHeight * imgRatio, maxHeight);
            else if (maxHeight >= inputImg.height) resizeCanvas(maxWidth, maxWidth / imgRatio);
            else if (maxWidth >= maxHeight * imgRatio) resizeCanvas(maxHeight * imgRatio, maxHeight);
            else resizeCanvas(maxWidth, maxWidth / imgRatio);
        }
    }
    else resizeCanvas(maxWidth, maxHeight);
}

function windowResized() {
    calculateResizeCanvas();
}

let kernelRadius = 1;
let kernelSize;
let kernel = [];
let sum;
let a = 0;
let horizontalPass;

function generateKernel() {
    kernelRadius = parseInt(document.getElementById('radius-slider').value);
    kernelSize = kernelRadius * 2 + 1;
    kernel = [];
    horizontalPass = new Array(inputImg.width * inputImg.height * 4);
    sum = 0;

    let sigma = max(kernelRadius / 2, 1);

    for (let i = -kernelRadius; i < kernelRadius + 1; i++) {
        let expNumerator = -(i * i);
        let expDenominator = 2 * sigma * sigma;
        let eExp = Math.exp(expNumerator / expDenominator);
        let kernelVal = eExp / (2 * PI * sigma * sigma);
        kernel[i + kernelRadius] = kernelVal;
        sum += kernelVal;
    }
    for (let i = 0; i < kernelSize; i++)
        kernel[i] /= sum;

}

let w;
let h;
function filterImage() {
    w = inputImg.width;
    h = inputImg.height;
    outputImg = createImage(w, h);
    inputImg.loadPixels();
    outputImg.loadPixels();

    processFilterHorizontal();
}

let j = 0;
function processFilterHorizontal() {
    for (let i = 0; i < w; i++) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumA = 0;

        for (let x = 0; x < kernelSize; x++) {
            let xIndex = i + x - kernelRadius;
            if (xIndex < 0) xIndex = 0;
            else if (xIndex >= w) xIndex = w - 1;
            let tileIndex = (xIndex + j * w) * 4;

            sumR += kernel[x] * inputImg.pixels[tileIndex];
            sumG += kernel[x] * inputImg.pixels[tileIndex + 1];
            sumB += kernel[x] * inputImg.pixels[tileIndex + 2];
            sumA += kernel[x] * inputImg.pixels[tileIndex + 3];
        }
        let index = (i + j * w) * 4;
        horizontalPass[index] = sumR;
        horizontalPass[index + 1] = sumG;
        horizontalPass[index + 2] = sumB;
        horizontalPass[index + 3] = sumA;
    }
    j++;
    if (j < h) setTimeout(processFilterHorizontal, 0);
    else {
        j = 0;
        processFilterVertical();
    }
}

function processFilterVertical() {
    for (let i = 0; i < w; i++) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumA = 0;

        for (let y = 0; y < kernelSize; y++) {
            let yIndex = j + y - kernelRadius;
            if (yIndex < 0) yIndex = 0;
            else if (yIndex >= h) yIndex = h - 1;
            let tileIndex = (i + yIndex * w) * 4;
            sumR += kernel[y] * horizontalPass[tileIndex];
            sumG += kernel[y] * horizontalPass[tileIndex + 1];
            sumB += kernel[y] * horizontalPass[tileIndex + 2];
            sumA += kernel[y] * horizontalPass[tileIndex + 3];
        }

        let index = (i + j * w) * 4;
        outputImg.pixels[index] = sumR;
        outputImg.pixels[index + 1] = sumG;
        outputImg.pixels[index + 2] = sumB;
        outputImg.pixels[index + 3] = sumA;
    }
    j++;
    if (j < h) setTimeout(processFilterVertical, 0);
    else {
        j = 0;
        outputImg.updatePixels();
        showInput = false;
        redraw();
        document.getElementById('file-input').value = "";
        document.getElementById('btn-start').disabled = false;
        document.getElementById('btn-download').disabled = false;
        document.getElementById('file-input').disabled = false;
        document.getElementById('input-overlay').classList.remove('overlay-show');
        document.getElementById('notification').classList.add('notification-show');

    }
}

function startFilter() {
    if (!inputImg) {
        alert('Please upload an image before pressing the start button.');
        return;
    }
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-download').disabled = true;
    document.getElementById('file-input').disabled = true;
    document.getElementById('input-overlay').classList.add('overlay-show');
    generateKernel();
    filterImage();
}

function downloadOutput() {
    if (!outputImg) {
        alert('Download is not ready yet!');
        return;
    }
    outputImg.save('median-blur');
}