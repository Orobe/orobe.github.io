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
    document.getElementById('notification-close').addEventListener('click', () => {
        document.getElementById('notification').classList.remove('notification-show');
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

let kernelX_v = [ 1, 2, 1 ];
let kernelX_h = [ 1, 0, -1 ];
let kernelY_v = [ 1, 0, -1 ];
let kernelY_h = [ 1, 2, 1 ];

let values;
let values_x;
let values_y;

let w;
let h;
function detectEdges() {
    w = inputImg.width;
    h = inputImg.height;

    values = new Array(w);
    values_x = new Array(w);
    values_y = new Array(w);
    
    for(let i = 0; i < w; i++){
        values[i] = new Array(h);
        values_x[i] = new Array(h);
        values_y[i] = new Array(h);
    }

    inputImg.filter(GRAY);
    inputImg.filter(BLUR, 1);
    outputImg = createImage(w, h);
    inputImg.loadPixels();
    outputImg.loadPixels();

    detectEdgesHorizontal();
}

let j = 0;
function detectEdgesHorizontal() {
    for (let i = 0; i < w; i++) {
        let totalX = 0;
        let totalY = 0;

        for (let x = 0; x < kernelX_v.length; x++) {
            let xIndex = i + x - kernelX_v.length;
            if (xIndex < 0) xIndex = 0;
            else if (xIndex >= w) xIndex = w - 1;
            let tileIndex = (xIndex + j * w) * 4;

            totalX += kernelX_v[x] * inputImg.pixels[tileIndex];
            totalY += kernelY_v[x] * inputImg.pixels[tileIndex];
        }

        values_x[i][j] = totalX;
        values_y[i][j] = totalY;
    }
    j++;
    if (j < h) setTimeout(detectEdgesHorizontal, 0);
    else {
        j = 0;
        detectEdgesVertical();
    }
}

function detectEdgesVertical() {
    for (let i = 0; i < w; i++) {
        let totalY = 0;
        let totalX = 0;

        for (let y = 0; y < kernelX_h.length; y++) {
            let yIndex = j + y - kernelX_h.length;
            if (yIndex < 0) yIndex = 0;
            else if (yIndex >= h) yIndex = h - 1;

            totalX += kernelX_h[y] * values_x[i][yIndex];
            totalY += kernelY_h[y] * values_y[i][yIndex];
        }

        values[i][j] = sqrt(pow(totalX, 2) + pow(totalY, 2));
    }
    j++;
    if (j < h) setTimeout(detectEdgesVertical, 0);
    else {
        j = 0;
        getLimitValues();
        setEdgeValues();
    }
}

let min;
let max;

function getLimitValues() {
    max = min = values[0][0];
    for(let i = 1; i < w; i++)
        for(let j = 1; j < h; j++) {
            if(max < values[i][j]) max = values[i][j];
            if(min > values[i][j]) min = values[i][j];
        }
}

function setEdgeValues() {
    for (let i = 0; i < w; i++) {
        let index = (i + j * w) * 4;
        let val = map(values[i][j], min, max, 0, 255);
        outputImg.pixels[index] = val;
        outputImg.pixels[index + 1] = val;
        outputImg.pixels[index + 2] = val;
        outputImg.pixels[index + 3] = 255;
    }
    j++;
    if (j < h) setTimeout(setEdgeValues, 0);
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
    detectEdges();
}

function downloadOutput() {
    if (!outputImg) {
        alert('Download is not ready yet!');
        return;
    }
    outputImg.save('sobel-operator');
}