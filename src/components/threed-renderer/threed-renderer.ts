import { Component, Input } from '@angular/core';
import * as THREE from 'three';
import * as Stats from 'three/examples/js/libs/stats.min.js';

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
			boxWidth, boxHeight, container, stats;

		init();
		animate();

		function init() {

			container = document.getElementById( 'threeDshowBox' );
			boxWidth = document.getElementsByTagName( 'threed-renderer' )[0].parentElement.clientWidth;
			boxHeight = document.getElementsByTagName( 'threed-renderer' )[0].parentElement.clientHeight - 19;

			camera = new THREE.PerspectiveCamera( 260, boxWidth / boxHeight, 1, 1000 );

			scene = new THREE.Scene();

			geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
			geometry.scale( -1, 1, 1 );

			var loader = new THREE.CubeTextureLoader();

			var textureCube = loader.load(cubeImg);

			material = new THREE.MeshBasicMaterial( { envMap: textureCube } );

			mesh = new THREE.Mesh( geometry, material );

			scene.add( mesh );

			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( boxWidth, boxHeight );
			container.appendChild( renderer.domElement );

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.width = '100%';
			stats.domElement.style.height = '50px';
			
      document.getElementById('statsBox').appendChild(stats.domElement);

			container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    	container.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

    	container.addEventListener( 'touchstart', onDocumentTouchStart, false );
    	container.addEventListener( 'touchmove', onDocumentTouchMove, false );

    	//window.addEventListener( 'resize', onWindowResize, false );
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

    	stats.update();

		}

		// function onWindowResize() {

  //   	camera.aspect = window.innerWidth / window.innerHeight;
  //   	camera.updateProjectionMatrix();

  //   	renderer.setSize( window.innerWidth, window.innerHeight );

		// }

		function onDocumentMouseDown( event ) {

    	event.preventDefault();
    	console.log(isUserInteracting);

    	if(isUserInteracting){
    		isUserInteracting = false;
    	}else{
    		isUserInteracting = true;
   		}

    	container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    	container.addEventListener( 'mouseup', onDocumentMouseUp, false );

		}

		function onDocumentMouseMove( event ) {

    	var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    	var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    	lon -= movementX * 0.1;
    	lat += movementY * 0.1;

		}

		function onDocumentMouseUp( event ) {

    	container.removeEventListener( 'mousemove', onDocumentMouseMove );
    	container.removeEventListener( 'mouseup', onDocumentMouseUp );

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
