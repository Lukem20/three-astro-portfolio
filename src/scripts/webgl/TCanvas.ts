import * as THREE from 'three';
import { gl } from './core/WebGL';
import { Assets, loadAssets } from './utils/assetLoader';
import { createTexture } from './utils/createTexture';
import { controls } from './utils/OrbitControls';

export class TCanvas {
	private assets: Assets = {
		images: {
			paths: [
				'images/color.jpg',
				'images/abts1.jpg',
				'images/abts2.jpg',
				'images/bit.JPG',
				'images/bit2.JPG',
				'images/hbc1.JPG',
				'images/hbc2.JPG',
				'images/hbcLogo.JPG',
				'images/hh1.JPG',
				'images/hh2.JPG',
				'images/sb1.jpg',
				'images/sb2.jpg',
				'images/sisisBarbershop1.jpg',
				'images/sisisBarbershop2.jpg',
				'images/whatDesigner1.JPG',
				'images/whatDesigner2.JPG',
			]
		},
	}

	// Async load images, then initialize the canvas
	constructor(private container: HTMLElement) {
		loadAssets(this.assets).then(() => {
			this.init();
			this.createObjects();
			gl.requestAnimationFrame(this.animate);
		});
	}

	private init() {
		gl.setup(this.container);
		gl.scene.background = new THREE.Color('#012');
		gl.camera.position.z = 2;
	}

	// Create the wheel-carousel
	private createObjects() {
		let topWheel = new THREE.Group();
		let bottomWheel = new THREE.Group();
		let wheelCarousel = new THREE.Group();

		// Geometry
		const roundedRectangelSize = 1;
		const geometry = this.RoundedRectangle(roundedRectangelSize, roundedRectangelSize, 0.05, 10);

		let material = null;
		let topMesh = null;
		let bottomMesh = null;

		// For each asset image loaded, create a square.
		const numberOfImgages = this.assets.images.paths.length;
		const wheelRadius = 3;
		const radianInterval = (2 * Math.PI) / numberOfImgages;
		for (let i = 0; i < numberOfImgages; i++) {

			// Material
			material = createTexture(this.assets.images.paths[i]);
			console.log(material);

			// Mesh
			topMesh = new THREE.Mesh(geometry, material);
			topMesh.position.set(
				Math.cos(radianInterval * i) * wheelRadius,
				Math.sin(radianInterval * i) * wheelRadius,
				-1
			);

			bottomMesh = topMesh.clone();
			bottomMesh.position.set(
				Math.cos(radianInterval * i) * wheelRadius,
				Math.sin(radianInterval * i) * wheelRadius,
				-1
			);

			topWheel.add(topMesh);
			bottomWheel.add(bottomMesh);
		}

		topWheel.translateY(3.85);
		bottomWheel.translateY(-3.45);

		    // Scroll event listeners
			let scrollSpeed = 0.0;
		
			// Spin wheel on scroll
			document.addEventListener('wheel', event => {	

				// Normalize scroll speed to be 360 degree
				scrollSpeed = (event.deltaY / 360) / 2;
				
				// Rotate each wheel using the scroll.
				topWheel.rotateZ(-1.0 * scrollSpeed);
				bottomWheel.rotateZ(-1.0 * scrollSpeed);
		
				// Adjust photo rotation after scroll movement
				for (let i = 0; i < numberOfImgages; i++) {
					topWheel.children[i].rotateZ(scrollSpeed);
					bottomWheel.children[i].rotateZ(scrollSpeed);
				}
			});

		wheelCarousel.add(topWheel);
		wheelCarousel.add(bottomWheel);

		gl.scene.add(wheelCarousel);
	}

	private animate = () => {
		// Remove controls before deployment
		controls.update();
		gl.render();
	}

	dispose() {
		gl.dispose();
	}


	// https://discourse.threejs.org/t/roundedrectangle-squircle/28645
	// @params: width, height, radius corner, smoothness  
	private RoundedRectangle(w:number, h:number, r:number, s:number) {
		const wi:number = w / 2 - r;		// inner width
		const hi:number = h / 2 - r;		// inner height
		const w2:number = w / 2;			// half width
		const h2:number = h / 2;			// half height
		const ul:number = r / w;			// u left
		const ur:number = ( w - r ) / w;	// u right
		const vl:number = r / h;			// v low
		const vh:number = ( h - r ) / h;	// v high
		
		let positions = [
			-wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
			-wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
			-w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
			-w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
			 wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
			 wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
		];
		
		let uvs = [
			ul,  0, ur,  0, ur,  1,
			ul,  0, ur,  1, ul,  1,
			 0, vl, ul, vl, ul, vh,
			 0, vl, ul, vh,  0, vh,
			ur, vl,  1, vl,  1, vh,
			ur, vl,  1, vh,	ur, vh 
		];
		
		let phia = 0; 
		let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
		
		for ( let i = 0; i < s * 4; i ++ ) {
			phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
			
			cosa = Math.cos( phia );
			sina = Math.sin( phia );
			cosb = Math.cos( phib );
			sinb = Math.sin( phib );
			
			xc = i < s || i >= 3 * s ? wi : - wi;
			yc = i < 2 * s ? hi : -hi;
		
			positions.push( xc, yc, 0, xc + r * cosa, yc + r * sina, 0,  xc + r * cosb, yc + r * sinb, 0 );
			
			uc =  i < s || i >= 3 * s ? ur : ul;
			vc = i < 2 * s ? vh : vl;
			
			uvs.push( uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb );
			
			phia = phib;
		}
		
		const geometry = new THREE.BufferGeometry( );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
		geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
		
		return geometry;
	}
}