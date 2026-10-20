// ===================================================
// 專題：學習一 - p5.js 程式碼拖曳測驗系統 (sketch.js)
// ===================================================

let myGifImage = null;
let isGifLoaded = false;
let fireworks = [];
let isSubmitted = false;
let finalScore = 0;
let submitButton = null;
let draggedCard = null;
let dragOffsetX = 0, dragOffsetY = 0;

const quizData = [
  { id: 1, question: "1. 繪製圓心在 (100,100)，直徑 50 的圓形指令為？", correct: "ellipse(100, 100, 50, 50)", matchedCard: null },
  { id: 2, question: "2. 設定畫布背景為純黑色的指令為？", correct: "background(0)", matchedCard: null },
  { id: 3, question: "3. 設定填滿顏色為紅色的指令為？", correct: "fill(255, 0, 0)", matchedCard: null },
  { id: 4, question: "4. 建立寬 800、高 600 畫布的初始化指令為？", correct: "createCanvas(800, 600)", matchedCard: null },
  { id: 5, question: "5. 繪製矩形從 (50,50) 開始，寬 100 高 60 的指令為？", correct: "rect(50, 50, 100, 60)", matchedCard: null },
  { id: 6, question: "6. 控制外框線條粗細為 4 像素的指令為？", correct: "strokeWeight(4)", matchedCard: null }
];
let cards = [];

function preload() {
  try {
    myGifImage = loadImage('assets/animation.gif', () => { isGifLoaded = true; }, () => { isGifLoaded = false; });
  } catch (e) { isGifLoaded = false; }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initQuizLayout();
  createSubmitButton();
}

function draw() {
  background(245, 247, 250);
  drawHeader();
  drawTopGifSection();
  drawDropZones();
  drawCards();

  if (isSubmitted) {
    drawResultBoard();
    if (finalScore >= 60) updateAndDrawConfetti();
  }
}

function initQuizLayout() {
  cards = [];
  let answers = quizData.map(q => q.correct);
  shuffleArray(answers);

  let cardW = min(width * 0.28, 220);
  let cardH = 45;
  let startY = height - 130;

  for (let i = 0; i < 6; i++) {
    let col = i % 3;
    let row = Math.floor(i / 3);
    let gapX = (width - cardW * 3) / 4;
    let posX = gapX + col * (cardW + gapX);
    let posY = startY + row * (cardH + 15);

    cards.push({
      text: answers[i],
      x: posX, y: posY, homeX: posX, homeY: posY,
      w: cardW, h: cardH, isPlaced: false, targetIdx: -1
    });
  }
}

function drawHeader() {
  fill(30, 41, 59); noStroke(); textSize(22); textStyle(BOLD);
  text("💻 學習一：p5.js 程式碼卡片拖曳測驗", width / 2, 30);
  textSize(13); textStyle(NORMAL); fill(100, 116, 139);
  text("請將下方的程式碼卡片拖曳至對應題目框中，完成後點擊交卷", width / 2, 58);
}

function drawTopGifSection() {
  let x = width / 2, y = 115, w = 120, h = 75;
  fill(255); stroke(226, 232, 240); strokeWeight(2);
  rect(x - w/2 - 10, y - h/2 - 5, w + 20, h + 10, 12);

  if (isGifLoaded && myGifImage) {
    imageMode(CENTER);
    image(myGifImage, x, y, w, h);
  } else {
    push();
    translate(x, y); noFill(); stroke(99, 102, 241, 180); strokeWeight(3);
    rotate(frameCount * 0.02); rect(-25, -25, 50, 50, 8);
    pop();
    fill(79, 70, 229); noStroke(); textSize(11); textStyle(BOLD);
    text("p5.js CODE", x, y);
  }
}

function drawDropZones() {
  let startY = 175;
  let zoneW = min(width * 0.42, 360);
  let zoneH = 50;

  for (let i = 0; i < quizData.length; i++) {
    let col = i % 2;
    let row = Math.floor(i / 2);
    let gapX = (width - zoneW * 2) / 3;
    let posX = gapX + col * (zoneW + gapX);
    let posY = startY + row * (zoneH + 20);

    quizData[i].x = posX; quizData[i].y = posY; quizData[i].w = zoneW; quizData[i].h = zoneH;

    if (isSubmitted) {
      if (quizData[i].matchedCard && quizData[i].matchedCard.text === quizData[i].correct) {
        fill(220, 252, 231); stroke(34, 197, 94);
      } else {
        fill(254, 226, 226); stroke(239, 68, 68);
      }
    } else {
      fill(255); stroke(203, 213, 225);
    }
    strokeWeight(2);
    rect(posX, posY, zoneW, zoneH, 8);

    fill(51, 65, 85); noStroke(); textAlign(LEFT, CENTER); textSize(12); textStyle(BOLD);
    text(quizData[i].question, posX + 10, posY + 15);
  }
}

function drawCards() {
  textAlign(CENTER, CENTER); textSize(12);
  for (let card of cards) {
    push();
    fill(card === draggedCard ? 238 : 255, 242, 255);
    stroke(99, 102, 241); strokeWeight(2);
    rect(card.x, card.y, card.w, card.h, 8);
    fill(30, 27, 75); noStroke(); textStyle(BOLD);
    text(card.text, card.x + card.w/2, card.y + card.h/2);
    pop();
  }
}

function mousePressed() {
  if (isSubmitted) return;
  for (let i = cards.length - 1; i >= 0; i--) {
    let c = cards[i];
    if (mouseX >= c.x && mouseX <= c.x + c.w && mouseY >= c.y && mouseY <= c.y + c.h) {
      draggedCard = c;
      dragOffsetX = mouseX - c.x;
      dragOffsetY = mouseY - c.y;
      if (c.isPlaced && c.targetIdx !== -1) {
        quizData[c.targetIdx].matchedCard = null;
        c.isPlaced = false; c.targetIdx = -1;
      }
      break;
    }
  }
}

function mouseDragged() {
  if (draggedCard) {
    draggedCard.x = mouseX - dragOffsetX;
    draggedCard.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (!draggedCard) return;
  let snapped = false;
  for (let i = 0; i < quizData.length; i++) {
    let q = quizData[i];
    if (mouseX >= q.x && mouseX <= q.x + q.w && mouseY >= q.y && mouseY <= q.y + q.h) {
      if (q.matchedCard && q.matchedCard !== draggedCard) {
        q.matchedCard.isPlaced = false;
        q.matchedCard.x = q.matchedCard.homeX;
        q.matchedCard.y = q.matchedCard.homeY;
        q.matchedCard.targetIdx = -1;
      }
      draggedCard.x = q.x + q.w - draggedCard.w - 8;
      draggedCard.y = q.y + q.h - draggedCard.h - 4;
      draggedCard.isPlaced = true;
      draggedCard.targetIdx = i;
      q.matchedCard = draggedCard;
      snapped = true;
      break;
    }
  }
  if (!snapped) {
    draggedCard.x = draggedCard.homeX;
    draggedCard.y = draggedCard.homeY;
    draggedCard.isPlaced = false;
    draggedCard.targetIdx = -1;
  }
  draggedCard = null;
}

function createSubmitButton() {
  submitButton = createButton("送出答案，交卷看成績 🚀");
  positionSubmitButton();
  submitButton.style("background-color", "#4F46E5");
  submitButton.style("color", "#FFF");
  submitButton.style("font-weight", "bold");
  submitButton.style("padding", "12px 28px");
  submitButton.style("border", "none");
  submitButton.style("border-radius", "30px");
  submitButton.style("cursor", "pointer");
  submitButton.mousePressed(calculateScore);
}

function positionSubmitButton() {
  if (submitButton) submitButton.position(width / 2 - 100, height - 60);
}

function calculateScore() {
  let correct = 0;
  for (let q of quizData) {
    if (q.matchedCard && q.matchedCard.text === q.correct) correct++;
  }
  finalScore = Math.round((correct / quizData.length) * 100);
  isSubmitted = true;
  submitButton.hide();
  if (finalScore >= 60) createConfetti();
}

function drawResultBoard() {
  fill(15, 23, 42, 180); rect(0, 0, width, height);
  let w = min(width * 0.8, 420), h = 260, x = width/2 - w/2, y = height/2 - h/2;
  fill(255); stroke(226, 232, 240); strokeWeight(2); rect(x, y, w, h, 16);
  textAlign(CENTER, CENTER); fill(30, 41, 59); textSize(22); textStyle(BOLD);
  text("🎉 測驗結果結算", width/2, y + 45);
  textSize(42); fill(finalScore >= 60 ? color(34, 197, 94) : color(239, 68, 68));
  text(finalScore + " 分", width/2, y + 105);
  textSize(12); fill(148, 163, 184);
  text("（點擊任意處重新挑戰）", width/2, y + 215);
}

function mouseClicked() {
  if (isSubmitted) {
    isSubmitted = false; finalScore = 0;
    quizData.forEach(q => q.matchedCard = null);
    initQuizLayout();
    submitButton.show();
  }
}

function createConfetti() {
  fireworks = [];
  let colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  for (let i = 0; i < 120; i++) {
    fireworks.push({ x: width/2, y: height/2, vx: random(-8, 8), vy: random(-14, -4), size: random(6, 12), color: random(colors), gravity: 0.25, rotation: random(TWO_PI), vRot: random(-0.1, 0.1) });
  }
}

function updateAndDrawConfetti() {
  for (let p of fireworks) {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rotation += p.vRot;
    push(); translate(p.x, p.y); rotate(p.rotation); fill(p.color); noStroke();
    rect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initQuizLayout();
  positionSubmitButton();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}