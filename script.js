const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 390;
canvas.height = 844;

// Spielerposition
let player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  radius: 15,
  color: '#000'
};

// Spielfelder (Kreise)
let circles = [];
const circleRadius = 25;
let currentLevel = 0; // Start bei Level 0
let savedMoney = 300; // Fester Startwert
let skippedProducts = 20; // Start mit 20 nicht gekauften Produkten
let toggleSide = true; // True = links, False = rechts

// Kreise generieren
function generateCircles(count) {
  const xOffset = canvas.width / 4; // Offset für Zickzack-Muster

  for (let i = 0; i < count; i++) {
    const isLevelCircle = (circles.length + 1) % 5 === 0; // Jeder 5. Kreis ist ein Level-Kreis
    const x = toggleSide ? xOffset : canvas.width - xOffset; // Wechselt zwischen links und rechts
    const y = circles.length === 0 ? canvas.height - 100 : circles[0].y - 120; // Positioniert neue Kreise oben
    toggleSide = !toggleSide; // Seite wechseln

    circles.unshift({
      x: x,
      y: y,
      radius: circleRadius,
      isLevelCircle: isLevelCircle,
      color: isLevelCircle ? '#333' : 'transparent',
      outline: '#000',
      level: isLevelCircle ? Math.floor(circles.length / 5) + 1 : null // Level korrekt berechnen
    });
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();
}

function drawCircles() {
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.strokeStyle = circle.outline;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Level-Text zeichnen
    if (circle.isLevelCircle && circle.level) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Level ${circle.level}`, circle.x, circle.y);
    }
  });
}

function drawStats() {
  // Zeichne Level-Anzeige oben links auf dem Canvas
  ctx.fillStyle = '#000';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top'; // Zeichnet den Text innerhalb des Canvas
  ctx.fillText(`Level: ${currentLevel}`, 10, 10);

  // Zeichne gespartes Geld
  ctx.fillText(`Gespart: ${savedMoney}€`, 10, 30);

  // Zeichne nicht gekaufte Produkte
  ctx.fillText(`Produkte: ${skippedProducts}`, 10, 50);
}

function moveToNextCircle() {
  if (skippedProducts > 0) {
    // Suche den nächsten Kreis basierend auf der Entfernung oberhalb des Spielers
    let nextCircle = null;
    let minDistance = Infinity;

    circles.forEach(circle => {
      if (circle.y < player.y) {
        const distance = player.y - circle.y;
        if (distance < minDistance) {
          minDistance = distance;
          nextCircle = circle;
        }
      }
    });

    if (nextCircle) {
      // Spieler springt auf den nächsten Kreis
      player.x = nextCircle.x;
      player.y = nextCircle.y;
      skippedProducts--; // Nicht gekaufte Produkte verringern

      // Wenn ein Level-Kreis erreicht wird, aktualisiere das aktuelle Level
      if (nextCircle.isLevelCircle) {
        currentLevel = nextCircle.level;
      }

      // Verschiebe Kreise und Spieler nach unten, wenn Spieler die obere Hälfte erreicht
      if (player.y <= canvas.height / 2) {
        const shift = canvas.height / 2 - player.y;
        player.y += shift; // Halte den Spieler in der oberen Hälfte
        circles.forEach(circle => {
          circle.y += shift; // Verschiebe alle Kreise nach unten
        });

        // Generiere neue Kreise oben
        generateCircles(3); // 3 neue Kreise hinzufügen
      }
    } else {
      console.error("Kein weiterer Kreis verfügbar!");
    }
  } else {
    alert("Keine nicht gekauften Produkte mehr verfügbar!");
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStats(); // Zeichne Statistiken
  drawCircles();
  drawPlayer(); // Spieler wird NACH den Kreisen gezeichnet
  requestAnimationFrame(animate);
}

// Steuerung
canvas.addEventListener('click', () => {
  moveToNextCircle();
});

// Initialisiere das Spiel
generateCircles(10); // Starte mit 10 Kreisen
animate();