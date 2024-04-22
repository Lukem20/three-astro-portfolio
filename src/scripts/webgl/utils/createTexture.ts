import {
    MeshBasicMaterial, 
    Texture, 
    TextureLoader,
} from 'three';

export function createTexture(p: string) {
    const textureLoader = new TextureLoader();
    const portfolioScreenshotImage:Texture = textureLoader.load(p);
    
    return new MeshBasicMaterial({ 
        map: portfolioScreenshotImage,

    });
}