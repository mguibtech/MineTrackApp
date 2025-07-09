const fs = require('fs');
const path = require('path');

// Função para criar um ícone SVG simples
function createAppIcon(size) {
  const padding = size * 0.1; // 10% de padding
  const containerSize = size - padding * 2;
  const logoWidth = containerSize * 0.4;
  const logoHeight = containerSize * 0.25;
  const logoX = (size - logoWidth) / 2;
  const logoY = (size - logoHeight) / 2;
  const fontSize = size * 0.12;
  const textY = logoY + logoHeight / 2 + fontSize * 0.3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Fundo azul escuro com bordas arredondadas -->
    <rect width="${size}" height="${size}" fill="#014955" rx="${
    size * 0.2
  }" ry="${size * 0.2}"/>
    
    <!-- Container do logo -->
    <rect 
        x="${logoX}" 
        y="${logoY}" 
        width="${logoWidth}" 
        height="${logoHeight}" 
        fill="rgba(255, 255, 255, 0.2)" 
        rx="${size * 0.04}" 
        ry="${size * 0.04}"
    />
    
    <!-- Texto "MT" -->
    <text 
        x="${size / 2}" 
        y="${textY}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="#FFFFFF" 
        text-anchor="middle"
    >
        MT
    </text>
</svg>`;
}

// Tamanhos necessários para Android
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Tamanhos necessários para iOS
const iosSizes = {
  '20@2x': 40,
  '20@3x': 60,
  '29@2x': 58,
  '29@3x': 87,
  '40@2x': 80,
  '40@3x': 120,
  '60@2x': 120,
  '60@3x': 180,
  1024: 1024,
};

// Criar diretórios se não existirem
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Gerar ícones para Android
console.log('Gerando ícones para Android...');
Object.entries(androidSizes).forEach(([folder, size]) => {
  const androidPath = path.join(
    __dirname,
    '..',
    'android',
    'app',
    'src',
    'main',
    'res',
    folder,
  );
  ensureDirectoryExists(androidPath);

  const svgContent = createAppIcon(size);
  const pngPath = path.join(androidPath, 'ic_launcher.png');

  // Por enquanto, vamos salvar como SVG e você pode converter manualmente
  const svgPath = path.join(androidPath, 'ic_launcher.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Criado: ${svgPath} (${size}x${size})`);
});

// Gerar ícones para iOS
console.log('Gerando ícones para iOS...');
const iosPath = path.join(
  __dirname,
  '..',
  'ios',
  'MinetrackApp',
  'Images.xcassets',
  'AppIcon.appiconset',
);
ensureDirectoryExists(iosPath);

Object.entries(iosSizes).forEach(([name, size]) => {
  const svgContent = createAppIcon(size);
  const svgPath = path.join(iosPath, `icon_${name}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Criado: ${svgPath} (${size}x${size})`);
});

console.log('\n✅ Ícones SVG gerados com sucesso!');
console.log('\n📝 Próximos passos:');
console.log(
  '1. Converta os arquivos SVG para PNG usando uma ferramenta online ou local',
);
console.log(
  '2. Para Android: Substitua os arquivos ic_launcher.png em cada pasta mipmap',
);
console.log(
  '3. Para iOS: Adicione os PNGs ao AppIcon.appiconset e atualize o Contents.json',
);
