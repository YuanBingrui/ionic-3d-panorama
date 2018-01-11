import { Component, Input } from '@angular/core';
import * as THREE from 'three';


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
		var geometry, material, mesh;
		var target = new THREE.Vector3();

		var lon = -90, lat = 0,
			phi = 0, theta = 0,
			touchX, touchY, isUserInteracting = false,
			boxWidth, boxHeight;

		init();
		animate();

		function init() {

			var container;

			container = document.getElementById( 'threeDshowBox' );

			boxWidth = window.innerWidth;
			boxHeight = window.innerHeight - 100;

			camera = new THREE.PerspectiveCamera( 260, boxWidth / boxHeight, 1, 1000 );

			scene = new THREE.Scene();

			geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
			geometry.scale( -1, 1, 1 );

			var loader = new THREE.CubeTextureLoader();
			//loader.setPath( '../../static/cube/' );

			var textureCube = loader.load(cubeImg);

			material = new THREE.MeshBasicMaterial( { envMap: textureCube } );

			mesh = new THREE.Mesh( geometry, material );

			scene.add( mesh );

			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( boxWidth, boxHeight );
			container.appendChild( renderer.domElement );

			document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    	document.addEventListener( 'wheel', onDocumentMouseWheel, false );

    	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    	window.addEventListener( 'resize', onWindowResize, false );
  	}
  	function animate() {

    	requestAnimationFrame(animate);
    	if (isUserInteracting) {
				lon += 0.1;
			}
    	lat = Math.max( - 85, Math.min( 85, lat ) );
    	phi = THREE.Math.degToRad( 90 - lat );
    	theta = THREE.Math.degToRad( lon );

    	target.x = 500 * Math.sin( phi ) * Math.cos( theta );
    	target.y = 500 * Math.cos( phi );
    	target.z = 500 * Math.sin( phi ) * Math.sin( theta );

    	camera.lookAt( target );
    	renderer.render( scene, camera );

		}

		function onWindowResize() {

    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();

    	renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function onDocumentMouseDown( event ) {

    	event.preventDefault();
    	if(isUserInteracting){
    		isUserInteracting = false;
    	}else{
    		isUserInteracting = true;
   		}

    	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    	document.addEventListener( 'mouseup', onDocumentMouseUp, false );

		}

		function onDocumentMouseMove( event ) {

    	var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    	var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    	lon -= movementX * 0.1;
    	lat += movementY * 0.1;

		}

		function onDocumentMouseUp( event ) {

    	document.removeEventListener( 'mousemove', onDocumentMouseMove );
    	document.removeEventListener( 'mouseup', onDocumentMouseUp );

		}

		function onDocumentMouseWheel( event ) {
			if(camera.fov >= 260 && camera.fov <= 350){
				camera.fov += event.deltaY * 0.05;
				if(camera.fov === 255) {
					camera.fov = 260;
				}
				if(camera.fov === 355) {
					camera.fov = 350;
				}
				camera.updateProjectionMatrix();
			}
		}

		function onDocumentTouchStart( event ) {

    	event.preventDefault();

    	var touch = event.touches[ 0 ];

    	touchX = touch.screenX;
    	touchY = touch.screenY;

		}

		function onDocumentTouchMove( event ) {

    	event.preventDefault();

    	var touch = event.touches[ 0 ];

    	lon -= ( touch.screenX - touchX ) * 0.1;
    	lat += ( touch.screenY - touchY ) * 0.1;

    	touchX = touch.screenX;
    	touchY = touch.screenY;

		}
	}

}
