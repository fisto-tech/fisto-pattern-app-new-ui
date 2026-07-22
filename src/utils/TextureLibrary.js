export const getTextureLibrary = () => {
  // Use Vite's import.meta.glob to dynamically import all texture images
  const textureFiles = import.meta.glob('../assets/images/Editor 1/Texture/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}', { eager: true, query: '?url', import: 'default' });
  
  const library = {};
  const textureRoot = '../assets/images/Editor 1/Texture/';

  const titleCase = (value) =>
    value
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const ensureTexture = (categoryName, textureId) => {
    if (!library[categoryName]) {
      library[categoryName] = {};
    }

    if (!library[categoryName][textureId]) {
      const textureName = textureId.split('/').pop();
      library[categoryName][textureId] = {
        name: titleCase(textureName),
        maps: {},
      };
    }

    return library[categoryName][textureId];
  };

  const getMapType = (fileName) => {
    const lowerFileName = fileName.toLowerCase();
    const baseName = lowerFileName.replace(/\.[^.]+$/, '');

    if (lowerFileName.includes('preview')) return 'preview';
    if (baseName === 'image' || /^img\d+$/.test(baseName)) return 'albedo';
    if (lowerFileName.includes('albedo') || lowerFileName.includes('basecolor') || lowerFileName.includes('diffuse')) return 'albedo';
    if (lowerFileName.includes('ambient') || lowerFileName.includes('_ao') || lowerFileName.includes('-ao')) return 'ao';
    if (lowerFileName.includes('normal')) return 'normal';
    if (lowerFileName.includes('roughness')) return 'roughness';
    if (lowerFileName.includes('metallic') || lowerFileName.includes('metalness') || lowerFileName.includes('metal') || lowerFileName.includes('specular')) return 'metallic';
    if (lowerFileName.includes('height') || lowerFileName.includes('displacement')) return 'height';

    return 'albedo';
  };

  for (const path in textureFiles) {
    const url = textureFiles[path];
    
    // Path looks like:
    // ../assets/images/Editor 1/Texture/Paper/green sprinkle/paper1/image.png
    const relativePath = path.replace(textureRoot, '');
    const parts = relativePath.split('/');
    if (parts.length < 2) continue;
    
    const fileName = parts.pop(); // corkboard3b-albedo.png
    const categoryName = parts.shift(); // Wood, Paper, Floral, etc.
    const textureId = parts.join('/');
    if (!textureId) continue;
    
    // Some directories might have .txt or desktop.ini which are ignored by the glob.

    const item = ensureTexture(categoryName, textureId);
    const mapType = getMapType(fileName);

    if (mapType === 'preview') {
      item.preview = url;
    } else if (mapType === 'albedo') {
      item.maps.albedo = url;
      if (!item.preview) {
        item.preview = url;
      }
    } else {
      item.maps[mapType] = url;
    }
  }

  // Set previews only using the original color (albedo) image
  for (const cat in library) {
    for (const tex in library[cat]) {
      const item = library[cat][tex];
      if (!item.preview) {
        item.preview =
          item.maps.albedo ||
          item.maps.ao ||
          item.maps.normal ||
          item.maps.roughness ||
          item.maps.metallic ||
          item.maps.height;
      }
    }
  }

  // Convert to array format for easy mapping in UI
  const formattedLibrary = Object.keys(library).map(category => ({
    category,
    textures: Object.keys(library[category]).map(key => ({
      id: key,
      ...library[category][key]
    }))
  }));

  return formattedLibrary;
};
