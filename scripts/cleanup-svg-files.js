const fs = require('fs');
const path = require('path');

// Função para remover arquivos SVG
function removeSvgFiles() {
  console.log('🧹 Limpando arquivos SVG desnecessários...');

  // Limpar arquivos SVG do Android
  const androidFolders = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
  ];

  androidFolders.forEach(folder => {
    const folderPath = path.join(
      __dirname,
      '..',
      'android',
      'app',
      'src',
      'main',
      'res',
      folder,
    );
    const svgPath = path.join(folderPath, 'ic_launcher.svg');

    if (fs.existsSync(svgPath)) {
      fs.unlinkSync(svgPath);
      console.log(`🗑️ Removido: ${svgPath}`);
    }
  });

  // Limpar arquivos SVG do iOS
  const iosPath = path.join(
    __dirname,
    '..',
    'ios',
    'MinetrackApp',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  const iosSvgFiles = [
    'icon_20@2x.svg',
    'icon_20@3x.svg',
    'icon_29@2x.svg',
    'icon_29@3x.svg',
    'icon_40@2x.svg',
    'icon_40@3x.svg',
    'icon_60@2x.svg',
    'icon_60@3x.svg',
    'icon_1024.svg',
  ];

  iosSvgFiles.forEach(file => {
    const svgPath = path.join(iosPath, file);
    if (fs.existsSync(svgPath)) {
      fs.unlinkSync(svgPath);
      console.log(`🗑️ Removido: ${svgPath}`);
    }
  });

  console.log('✅ Limpeza concluída!');
}

removeSvgFiles();
