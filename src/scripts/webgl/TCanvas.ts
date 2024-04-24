import * as THREE from 'three';
import { gl } from './core/WebGL';
import { mouse3d } from './utils/Mouse3D';
import { Assets, loadAssets } from './utils/assetLoader';
import { createTexture } from './utils/createTexture';

export class TCanvas {
	private assets: Assets = {
		images: {
			paths: [
				'images/color.jpg', // CAPSTONE
				'images/abts1.jpg',
				'images/hh1.JPG',
				'images/sb1.jpg',
				'images/sisisBarbershop2.jpg',
				'images/bit.JPG',
				'images/color.jpg', // 7DS
				'images/hbc1.JPG',

				'images/color.jpg', // CAPSTONE
				'images/abts2.jpg',
				'images/hh2.JPG',
				'images/sb2.jpg',
				'images/sisisBarbershop1.jpg',
				'images/bit2.JPG',
				'images/color.jpg', // 7DS
				'images/hbc2.JPG',
			]
		},
	}

	private topWheel = new THREE.Group();
	private bottomWheel = new THREE.Group();
	private wheelCarousel = new THREE.Group();

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

		this.topWheel.name = 'topWheel';
		this.bottomWheel.name = 'bottomWheel';
		this.wheelCarousel.name = 'wheelCarousel;'
	}

	// Create the wheel-carousel
	private createObjects() {
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

			// Mesh
			topMesh = new THREE.Mesh(geometry, material);
			topMesh.name = `${this.assets.images.paths[i]} top`;
			topMesh.position.set(
				Math.cos(radianInterval * i) * wheelRadius,
				Math.sin(radianInterval * i) * wheelRadius,
				-1
			);

			bottomMesh = topMesh.clone();
			bottomMesh.name = `RoundedRectangle_${i} bottom`;
			bottomMesh.position.set(
				Math.cos(radianInterval * i) * wheelRadius,
				Math.sin(radianInterval * i) * wheelRadius,
				-1
			);

			this.topWheel.add(topMesh);
			this.bottomWheel.add(bottomMesh);
		}

		this.topWheel.translateY(3.85);
		this.bottomWheel.translateY(-3.45);

		    // Scroll event listeners
			let scrollSpeed = 0.0;
		
			// Spin wheel on scroll
			document.addEventListener('wheel', event => {	

				// Normalize scroll speed to be 360 degree
				scrollSpeed = (event.deltaY / 360) / 2;
				
				// Rotate each wheel using the scroll.
				this.topWheel.rotateZ(-1.0 * scrollSpeed);
				this.bottomWheel.rotateZ(-1.0 * scrollSpeed);
		
				// Adjust photo rotation after scroll movement
				for (let i = 0; i < numberOfImgages; i++) {
					this.topWheel.children[i].rotateZ(scrollSpeed);
					this.bottomWheel.children[i].rotateZ(scrollSpeed);
				}
			});

		this.wheelCarousel.add(this.topWheel);
		this.wheelCarousel.add(this.bottomWheel);

		gl.scene.add(this.wheelCarousel);
	} 

	private mouse = new THREE.Vector2();
	private raycaster = new THREE.Raycaster();

	private animate = () => {
		// Update mouse position
		this.mouse.x = (mouse3d.position.x + 1) / 2;
		this.mouse.y = (mouse3d.position.y + 1) / 2;

		// Update the raycaster with the current mouse position
		this.raycaster.setFromCamera(this.mouse, gl.camera);

		// const intersects = this.raycaster.intersectObjects(this.wheelCarousel.children, true);
		// if (intersects.length > 0) {
		// 	// Mouse is hovering over an object
		// 	const intersectedObject = intersects[0].object;

		// 	intersectedObject.material.transparent = true;
		// 	intersectedObject.material.opacity = 0.1;
		// } 

		// Check for intersections in the top wheel
		const intersectsTop = this.raycaster.intersectObjects(this.topWheel.children, true);
		if (intersectsTop.length > 0) {
			// Mouse is hovering over an object in the top wheel
			const intersectedObject = intersectsTop[0].object;
			intersectedObject.material.transparent = true;
			intersectedObject.material.opacity = 0.1;
		} else {
			// No intersection in the top wheel, reset opacity
			this.topWheel.children.forEach(child => {
				child.material.transparent = false;
				child.material.opacity = 1;
			});
		}
	
		// Check for intersections in the bottom wheel
		const intersectsBottom = this.raycaster.intersectObjects(this.bottomWheel.children, true);
		if (intersectsBottom.length > 0) {
			// Mouse is hovering over an object in the bottom wheel
			const intersectedObject = intersectsBottom[0].object;
			intersectedObject.material.transparent = true;
			intersectedObject.material.opacity = 0.1;
		} else {
			// No intersection in the bottom wheel, reset opacity
			this.bottomWheel.children.forEach(child => {
				child.material.transparent = false;
				child.material.opacity = 1;
			});
		}

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