import { Component, Input } from '@angular/core';
import * as THREE from 'three';
import { CanvasRenderer } from "./CanvasRenderer";

@Component({
  selector: 'threed-renderer',
  templateUrl: 'threed-renderer.html'
})
export class ThreedRendererComponent {

	@Input() 
	set cubeImg(cubeImg: Array<string>) {
    this.ThreeRender(THREE, cubeImg);
  }

  constructor() {
    console.log('Hello ThreedRendererComponent Component');
  }

  ThreeRender = function(THREE, cubeImg: Array<string>) {
  	var camera, scene, renderer;

		var texture_placeholder,
			isUserInteracting = false,
			onMouseDownMouseX = 0, onMouseDownMouseY = 0,
			lon = -90, onMouseDownLon = 0,
			lat = 0, onMouseDownLat = 0,
			phi = 0, theta = 0,
			target = new THREE.Vector3(),
			boxWidth, boxHeight;

		init();
		animate();

		function init() {

			var container, mesh;

			container = document.getElementById( 'threeDshowBox' );

			boxWidth = window.innerWidth;
			boxHeight = window.innerHeight - 100;

			camera = new THREE.PerspectiveCamera( 75, boxWidth / boxHeight, 1, 1100 );

			scene = new THREE.Scene();

			texture_placeholder = document.createElement( 'canvas' );
			texture_placeholder.width = 128;
			texture_placeholder.height = 128;

			var context = texture_placeholder.getContext( '2d' );
			context.fillStyle = 'rgb( 200, 200, 200 )';
			context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );

			var materials = [];

			for (let i = 0; i < cubeImg.length; i++) {
				materials.push(loadTexture(cubeImg[i]));
			}

			var geometry = new THREE.BoxGeometry( 300, 300, 300, 7, 7, 7 );
			geometry.scale( - 1, 1, 1 );

			mesh = new THREE.Mesh( geometry, materials );
			scene.add( mesh );

			for ( var i = 0, l = mesh.geometry.vertices.length; i < l; i ++ ) {

				var vertex = mesh.geometry.vertices[ i ];

				vertex.normalize();
				vertex.multiplyScalar( 550 );

			}

			renderer = new CanvasRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			container.appendChild( renderer.domElement );

			document.addEventListener( 'mousedown', onDocumentMouseDown, false );
			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
			document.addEventListener( 'mouseup', onDocumentMouseUp, false );
			document.addEventListener( 'wheel', onDocumentMouseWheel, false );

			document.addEventListener( 'touchstart', onDocumentTouchStart, false );
			document.addEventListener( 'touchmove', onDocumentTouchMove, false );

			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function loadTexture( path ) {

			var texture = new THREE.Texture( texture_placeholder );
			var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

			var image = new Image();
			image.onload = function () {

				texture.image = this;
				texture.needsUpdate = true;

			};
			image.src = path;

			return material;

		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function onDocumentMouseDown( event ) {

			event.preventDefault();

			isUserInteracting = true;

			onMouseDownMouseX = event.clientX;
			onMouseDownMouseY = event.clientY;

			onMouseDownLon = lon;
			onMouseDownLat = lat;

		}

		function onDocumentMouseMove( event ) {

			if ( isUserInteracting === true ) {

				lon = ( onMouseDownMouseX - event.clientX ) * 0.1 + onMouseDownLon;
				lat = ( event.clientY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;

			}
		}

		function onDocumentMouseUp( event ) {

			isUserInteracting = false;

		}

		function onDocumentMouseWheel( event ) {

			var fov = camera.fov + event.deltaY * 0.05;

			camera.fov = THREE.Math.clamp( fov, 10, 75 );

			camera.updateProjectionMatrix();

		}

		function onDocumentTouchStart( event ) {

			if ( event.touches.length == 1 ) {

				event.preventDefault();

				onMouseDownMouseX = event.touches[ 0 ].pageX;
				onMouseDownMouseY = event.touches[ 0 ].pageY;

				onMouseDownLon = lon;
				onMouseDownLat = lat;

			}
		}

		function onDocumentTouchMove( event ) {

			if ( event.touches.length == 1 ) {

				event.preventDefault();

				lon = ( onMouseDownMouseX - event.touches[0].pageX ) * 0.1 + onMouseDownLon;
				lat = ( event.touches[0].pageY - onMouseDownMouseY ) * 0.1 + onMouseDownLat;

			}

		}

		function animate() {

			requestAnimationFrame( animate );
			update();

		}

		function update() {

			if ( isUserInteracting === false ) {

				lon += 0.1;

			}

			lat = Math.max( - 85, Math.min( 85, lat ) );
			phi = THREE.Math.degToRad( 90 - lat );
			theta = THREE.Math.degToRad( lon );

			target.x = 500 * Math.sin( phi ) * Math.cos( theta );
			target.y = 500 * Math.cos( phi );
			target.z = 500 * Math.sin( phi ) * Math.sin( theta );

			camera.position.copy( target ).negate();
			camera.lookAt( target );

			renderer.render( scene, camera );

		}
	}

}
