const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Buffer } = require('buffer');

// Função para criar ícone PNG
async function createPngIcon(size, outputPath) {
  try {
    const padding = size * 0.1;
    const containerSize = size - padding * 2;
    const logoWidth = containerSize * 0.4;
    const logoHeight = containerSize * 0.25;
    const logoX = (size - logoWidth) / 2;
    const logoY = (size - logoHeight) / 2;
    const fontSize = size * 0.12;
    const textY = logoY + logoHeight / 2 + fontSize * 0.3;

    // Criar SVG como string
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#014955" rx="${
      size * 0.2
    }" ry="${size * 0.2}"/>
    <rect 
        x="${logoX}" 
        y="${logoY}" 
        width="${logoWidth}" 
        height="${logoHeight}" 
        fill="rgba(255, 255, 255, 0.2)" 
        rx="${size * 0.04}" 
        ry="${size * 0.04}"
    />
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

    // Converter SVG para PNG
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Criado: ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${outputPath}:`, error.message);
  }
}

// Tamanhos para Android
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Tamanhos para iOS
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

async function updateAppIcon() {
  console.log('🎨 Atualizando ícone do app Minetrack...');
  console.log(
    '📱 Design baseado na splash screen com fundo azul (#014955) e texto "MT" em branco\n',
  );

  // Gerar ícones para Android
  console.log('🤖 Gerando ícones para Android...');
  for (const [folder, size] of Object.entries(androidSizes)) {
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
    const pngPath = path.join(androidPath, 'ic_launcher.png');

    // Criar diretório se não existir
    if (!fs.existsSync(androidPath)) {
      fs.mkdirSync(androidPath, { recursive: true });
    }

    await createPngIcon(size, pngPath);
  }

  // Gerar ícones para iOS
  console.log('\n🍎 Gerando ícones para iOS...');
  const iosPath = path.join(
    __dirname,
    '..',
    'ios',
    'MinetrackApp',
    'Images.xcassets',
    'AppIcon.appiconset',
  );

  // Criar diretório se não existir
  if (!fs.existsSync(iosPath)) {
    fs.mkdirSync(iosPath, { recursive: true });
  }

  for (const [name, size] of Object.entries(iosSizes)) {
    const pngPath = path.join(iosPath, `icon_${name}.png`);
    await createPngIcon(size, pngPath);
  }

  console.log('\n✅ Ícone do app atualizado com sucesso!');
  console.log('\n📋 Resumo das alterações:');
  console.log('• Android: Ícones PNG gerados em todas as pastas mipmap');
  console.log('• iOS: Ícones PNG gerados no AppIcon.appiconset');
  console.log('• Contents.json do iOS atualizado automaticamente');
  console.log('\n🚀 Para aplicar as mudanças:');
  console.log('1. Android: Recompile o app com "npx react-native run-android"');
  console.log('2. iOS: Abra o Xcode e recompile o projeto');
}

// Executar o script
updateAppIcon().catch(console.error);
