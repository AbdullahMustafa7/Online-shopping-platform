const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [192, 256, 384, 512];
const bgColor = '#16a34a'; // FreshCart green
const textColor = '#ffffff';

async function generateIcons() {
    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, size * 0.2); // 20% border radius
        ctx.fill();

        // Text (FC)
        ctx.fillStyle = textColor;
        const fontSize = size * 0.45;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FC', size / 2, size / 2);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`./public/icon-${size}x${size}.png`, buffer);
        console.log(`Generated icon-${size}x${size}.png`);
    }
}

generateIcons().catch(console.error);
