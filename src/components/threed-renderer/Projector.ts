import * as THREE from 'three';

export class RenderableObject {
	id : number = 0;
	object : any = null;
	z : number = 0;
	renderOrder : number = 0;

}

export class RenderableFace {
	id: number = 0;
	v1: any = new RenderableVertex();
	v2: any = new RenderableVertex();
	v3: any = new RenderableVertex();
	normalModel: any = new THREE.Vector3();
	vertexNormalsModel: any = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	vertexNormalsLength: number = 0;
	color: any = new THREE.Color();
	material: any = null;
	uvs: any = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];
	z: number = 0;
	renderOrder: number = 0;

};

export class RenderableVertex {
	position: any = new THREE.Vector3();
	positionWorld: any = new THREE.Vector3();
	positionScreen: any = new THREE.Vector4();
	visible: boolean = true;

	copy(vertex) {

		this.positionWorld.copy( vertex.positionWorld );
		this.positionScreen.copy( vertex.positionScreen );

	}

};

export class RenderableLine {
	id: number = 0;
	v1: any = new RenderableVertex();
	v2: any = new RenderableVertex();
	vertexColors: any = [ new THREE.Color(), new THREE.Color() ];
	material: any = null;
	z: number = 0;
	renderOrder: number = 0;

};

export class RenderableSprite {
	id: number = 0;
	object: any = null;
	x: number = 0;
	y: number = 0;
	z: number = 0;
	rotation: number = 0;
	scale: any = new THREE.Vector2();
	material: any = null;
	renderOrder: number = 0;

};


export class Projector {
	_object: any; _objectCount: any; _objectPool: Array<any> = []; _objectPoolLength: number = 0;
	_vertex: any; _vertexCount: any; _vertexPool: Array<any> = []; _vertexPoolLength: number = 0;
	_face: any; _faceCount: any; _facePool: Array<any> = []; _facePoolLength: number = 0;
	_line: any; _lineCount: any; _linePool: Array<any> = []; _linePoolLength: number = 0;
	_sprite: any; _spriteCount: any; _spritePool: Array<any> = []; _spritePoolLength: number = 0;

	_renderData: any = { objects: [], lights: [], elements: [] };

	_vector3: any = new THREE.Vector3();
	_vector4: any = new THREE.Vector4();

	_clipBox: any = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) );
	_boundingBox: any = new THREE.Box3();
	_points3: any = new Array( 3 );

	_viewMatrix: any = new THREE.Matrix4();
	_viewProjectionMatrix: any = new THREE.Matrix4();

	_modelMatrix: any;
	_modelViewProjectionMatrix: any = new THREE.Matrix4();

	_normalMatrix: any = new THREE.Matrix3();

	_frustum: any = new THREE.Frustum();

	_clippedVertex1PositionScreen: any = new THREE.Vector4();
	_clippedVertex2PositionScreen: any = new THREE.Vector4();

	constructor() {
    console.log('Projector.ts');
  }

  projectVector( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	unprojectVector( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	pickingRay() {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

	RenderList() {
		var _this = this;
		var normals = [];
		var colors = [];
		var uvs = [];

		var object = null;
		var material = null;

		var normalMatrix = new THREE.Matrix3();

		function setObject( value ) {

			object = value;
			material = object.material;

			normalMatrix.getNormalMatrix( object.matrixWorld );

			normals.length = 0;
			colors.length = 0;
			uvs.length = 0;

		}

		function projectVertex( vertex ) {

			var position = vertex.position;
			var positionWorld = vertex.positionWorld;
			var positionScreen = vertex.positionScreen;

			positionWorld.copy( position ).applyMatrix4( _this._modelMatrix );
			positionScreen.copy( positionWorld ).applyMatrix4( _this._viewProjectionMatrix );

			var invW = 1 / positionScreen.w;

			positionScreen.x *= invW;
			positionScreen.y *= invW;
			positionScreen.z *= invW;

			vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
					 positionScreen.y >= - 1 && positionScreen.y <= 1 &&
					 positionScreen.z >= - 1 && positionScreen.z <= 1;

		}

		function pushVertex( x, y, z ) {

			_this._vertex = _this.getNextVertexInPool();
			_this._vertex.position.set( x, y, z );

			projectVertex( _this._vertex );

		}

		function pushNormal( x, y, z ) {

			normals.push( x, y, z );

		}

		function pushColor( r, g, b ) {

			colors.push( r, g, b );

		}

		function pushUv( x, y ) {

			uvs.push( x, y );

		}

		function checkTriangleVisibility( v1, v2, v3 ) {

			if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

			_this._points3[ 0 ] = v1.positionScreen;
			_this._points3[ 1 ] = v2.positionScreen;
			_this._points3[ 2 ] = v3.positionScreen;

			return _this._clipBox.intersectsBox( _this._boundingBox.setFromPoints( _this._points3 ) );

		}

		function checkBackfaceCulling( v1, v2, v3 ) {

			return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
				    ( v2.positionScreen.y - v1.positionScreen.y ) -
				    ( v3.positionScreen.y - v1.positionScreen.y ) *
				    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

		}

		function pushLine( a, b ) {

			var v1 = _this._vertexPool[ a ];
			var v2 = _this._vertexPool[ b ];

			// Clip

			v1.positionScreen.copy( v1.position ).applyMatrix4( _this._modelViewProjectionMatrix );
			v2.positionScreen.copy( v2.position ).applyMatrix4( _this._modelViewProjectionMatrix );

			if ( _this.clipLine( v1.positionScreen, v2.positionScreen ) === true ) {

				// Perform the perspective divide
				v1.positionScreen.multiplyScalar( 1 / v1.positionScreen.w );
				v2.positionScreen.multiplyScalar( 1 / v2.positionScreen.w );

				_this._line = _this.getNextLineInPool();
				_this._line.id = object.id;
				_this._line.v1.copy( v1 );
				_this._line.v2.copy( v2 );
				_this._line.z = Math.max( v1.positionScreen.z, v2.positionScreen.z );
				_this._line.renderOrder = object.renderOrder;

				_this._line.material = object.material;

				if ( object.material.vertexColors === THREE.VertexColors ) {

					_this._line.vertexColors[ 0 ].fromArray( colors, a * 3 );
					_this._line.vertexColors[ 1 ].fromArray( colors, b * 3 );

				}

				_this._renderData.elements.push( _this._line );

			}

		}

		function pushTriangle( a, b, c ) {

			var v1 = _this._vertexPool[ a ];
			var v2 = _this._vertexPool[ b ];
			var v3 = _this._vertexPool[ c ];

			if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

			if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

				_this._face = _this.getNextFaceInPool();

				_this._face.id = object.id;
				_this._face.v1.copy( v1 );
				_this._face.v2.copy( v2 );
				_this._face.v3.copy( v3 );
				_this._face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
				_this._face.renderOrder = object.renderOrder;

				// use first vertex normal as face normal

				_this._face.normalModel.fromArray( normals, a * 3 );
				_this._face.normalModel.applyMatrix3( normalMatrix ).normalize();

				for ( var i = 0; i < 3; i ++ ) {

					var normal = _this._face.vertexNormalsModel[ i ];
					normal.fromArray( normals, arguments[ i ] * 3 );
					normal.applyMatrix3( normalMatrix ).normalize();

					var uv = _this._face.uvs[ i ];
					uv.fromArray( uvs, arguments[ i ] * 2 );

				}

				_this._face.vertexNormalsLength = 3;

				_this._face.material = object.material;

				_this._renderData.elements.push( _this._face );

			}

		}

		return {
			setObject: setObject,
			projectVertex: projectVertex,
			checkTriangleVisibility: checkTriangleVisibility,
			checkBackfaceCulling: checkBackfaceCulling,
			pushVertex: pushVertex,
			pushNormal: pushNormal,
			pushColor: pushColor,
			pushUv: pushUv,
			pushLine: pushLine,
			pushTriangle: pushTriangle
		};

	};

	renderList: any = this.RenderList();

	projectObject( object ) {

		if ( object.visible === false ) return;

		if ( object instanceof THREE.Light ) {

			this._renderData.lights.push( object );

		} else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points ) {

			if ( object.material.visible === false ) return;
			if ( object.frustumCulled === true && this._frustum.intersectsObject( object ) === false ) return;

			this.addObject( object );

		} else if ( object instanceof THREE.Sprite ) {

			if ( object.material.visible === false ) return;
			if ( object.frustumCulled === true && this._frustum.intersectsSprite( object ) === false ) return;

			this.addObject( object );

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			this.projectObject( children[ i ] );

		}
	}

	addObject( object ) {

		this._object = this.getNextObjectInPool();
		this._object.id = object.id;
		this._object.object = object;

		this._vector3.setFromMatrixPosition( object.matrixWorld );
		this._vector3.applyMatrix4( this._viewProjectionMatrix );
		this._object.z = this._vector3.z;
		this._object.renderOrder = object.renderOrder;

		this._renderData.objects.push( this._object );

	}

	projectScene( scene, camera, sortObjects, sortElements ) {

		this._faceCount = 0;
		this._lineCount = 0;
		this._spriteCount = 0;

		this._renderData.elements.length = 0;

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
		if ( camera.parent === null ) camera.updateMatrixWorld();

		this._viewMatrix.copy( camera.matrixWorldInverse );
		this._viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, this._viewMatrix );

		this._frustum.setFromMatrix( this._viewProjectionMatrix );

		//

		this._objectCount = 0;

		this._renderData.objects.length = 0;
		this._renderData.lights.length = 0;

		this.projectObject( scene );

		if ( sortObjects === true ) {

			this._renderData.objects.sort( this.painterSort );

		}

		//

		var objects = this._renderData.objects;

		for ( var o = 0, ol = objects.length; o < ol; o ++ ) {

			var object = objects[ o ].object;
			var geometry = object.geometry;

			this.renderList.setObject( object );

			this._modelMatrix = object.matrixWorld;

			this._vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;
					var groups = geometry.groups;

					if ( attributes.position === undefined ) continue;

					var positions = attributes.position.array;

					for ( let i = 0, l = positions.length; i < l; i += 3 ) {

						this.renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

					}

					if ( attributes.normal !== undefined ) {

						var normals = attributes.normal.array;

						for ( let i = 0, l = normals.length; i < l; i += 3 ) {

							this.renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

						}

					}

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;

						for ( let i = 0, l = uvs.length; i < l; i += 2 ) {

							this.renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

						}

					}

					if ( geometry.index !== null ) {

						var indices = geometry.index.array;

						if ( groups.length > 0 ) {

							for ( var g = 0; g < groups.length; g ++ ) {

								var group = groups[ g ];

								for ( let i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									this.renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

								}

							}

						} else {

							for ( let i = 0, l = indices.length; i < l; i += 3 ) {

								this.renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

							}

						}

					} else {

						for ( let i = 0, l = positions.length / 3; i < l; i += 3 ) {

							this.renderList.pushTriangle( i, i + 1, i + 2 );

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					var vertices = geometry.vertices;
					var faces = geometry.faces;
					var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

					this._normalMatrix.getNormalMatrix( this._modelMatrix );

					var material = object.material;

					var isMultiMaterial = Array.isArray( material );

					for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

						var vertex = vertices[ v ];

						this._vector3.copy( vertex );

						if ( material.morphTargets === true ) {

							var morphTargets = geometry.morphTargets;
							var morphInfluences = object.morphTargetInfluences;

							for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

								var influence = morphInfluences[ t ];

								if ( influence === 0 ) continue;

								var target = morphTargets[ t ];
								var targetVertex = target.vertices[ v ];

								this._vector3.x += ( targetVertex.x - vertex.x ) * influence;
								this._vector3.y += ( targetVertex.y - vertex.y ) * influence;
								this._vector3.z += ( targetVertex.z - vertex.z ) * influence;

							}

						}

						this.renderList.pushVertex( this._vector3.x, this._vector3.y, this._vector3.z );

					}

					for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

						var face = faces[ f ];

						material = isMultiMaterial === true
							 ? object.material[ face.materialIndex ]
							 : object.material;

						if ( material === undefined ) continue;

						var side = material.side;

						var v1 = this._vertexPool[ face.a ];
						var v2 = this._vertexPool[ face.b ];
						var v3 = this._vertexPool[ face.c ];

						if ( this.renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

						var visible = this.renderList.checkBackfaceCulling( v1, v2, v3 );

						if ( side !== THREE.DoubleSide ) {

							if ( side === THREE.FrontSide && visible === false ) continue;
							if ( side === THREE.BackSide && visible === true ) continue;

						}

						this._face = this.getNextFaceInPool();

						this._face.id = object.id;
						this._face.v1.copy( v1 );
						this._face.v2.copy( v2 );
						this._face.v3.copy( v3 );

						this._face.normalModel.copy( face.normal );

						if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

							this._face.normalModel.negate();

						}

						this._face.normalModel.applyMatrix3( this._normalMatrix ).normalize();

						var faceVertexNormals = face.vertexNormals;

						for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

							var normalModel = this._face.vertexNormalsModel[ n ];
							normalModel.copy( faceVertexNormals[ n ] );

							if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

								normalModel.negate();

							}

							normalModel.applyMatrix3( this._normalMatrix ).normalize();

						}

						this._face.vertexNormalsLength = faceVertexNormals.length;

						var vertexUvs = faceVertexUvs[ f ];

						if ( vertexUvs !== undefined ) {

							for ( var u = 0; u < 3; u ++ ) {

								this._face.uvs[ u ].copy( vertexUvs[ u ] );

							}

						}

						this._face.color = face.color;
						this._face.material = material;

						this._face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
						this._face.renderOrder = object.renderOrder;

						this._renderData.elements.push( this._face );

					}

				}

			} else if ( object instanceof THREE.Line ) {

				this._modelViewProjectionMatrix.multiplyMatrices( this._viewProjectionMatrix, this._modelMatrix );

				if ( geometry instanceof THREE.BufferGeometry ) {

					let attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						let positions = attributes.position.array;

						for ( let i = 0, l = positions.length; i < l; i += 3 ) {

							this.renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

						}

						if ( attributes.color !== undefined ) {

							var colors = attributes.color.array;

							for ( let i = 0, l = colors.length; i < l; i += 3 ) {

								this.renderList.pushColor( colors[ i ], colors[ i + 1 ], colors[ i + 2 ] );

							}

						}

						if ( geometry.index !== null ) {

							let indices = geometry.index.array;

							for ( let i = 0, l = indices.length; i < l; i += 2 ) {

								this.renderList.pushLine( indices[ i ], indices[ i + 1 ] );

							}

						} else {

							var step = object instanceof THREE.LineSegments ? 2 : 1;

							for ( let i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

								this.renderList.pushLine( i, i + 1 );

							}

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					let vertices = object.geometry.vertices;

					if ( vertices.length === 0 ) continue;

					v1 = this.getNextVertexInPool();
					v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( this._modelViewProjectionMatrix );

					let step = object instanceof THREE.LineSegments ? 2 : 1;

					for ( let v = 1, vl = vertices.length; v < vl; v ++ ) {

						v1 = this.getNextVertexInPool();
						v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( this._modelViewProjectionMatrix );

						if ( ( v + 1 ) % step > 0 ) continue;

						v2 = this._vertexPool[ this._vertexCount - 2 ];

						this._clippedVertex1PositionScreen.copy( v1.positionScreen );
						this._clippedVertex2PositionScreen.copy( v2.positionScreen );

						if ( this.clipLine( this._clippedVertex1PositionScreen, this._clippedVertex2PositionScreen ) === true ) {

							// Perform the perspective divide
							this._clippedVertex1PositionScreen.multiplyScalar( 1 / this._clippedVertex1PositionScreen.w );
							this._clippedVertex2PositionScreen.multiplyScalar( 1 / this._clippedVertex2PositionScreen.w );

							this._line = this.getNextLineInPool();

							this._line.id = object.id;
							this._line.v1.positionScreen.copy( this._clippedVertex1PositionScreen );
							this._line.v2.positionScreen.copy( this._clippedVertex2PositionScreen );

							this._line.z = Math.max( this._clippedVertex1PositionScreen.z, this._clippedVertex2PositionScreen.z );
							this._line.renderOrder = object.renderOrder;

							this._line.material = object.material;

							if ( object.material.vertexColors === THREE.VertexColors ) {

								this._line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
								this._line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

							}

							this._renderData.elements.push( this._line );

						}

					}

				}

			} else if ( object instanceof THREE.Points ) {

				this._modelViewProjectionMatrix.multiplyMatrices( this._viewProjectionMatrix, this._modelMatrix );

				if ( geometry instanceof THREE.Geometry ) {

					let vertices = object.geometry.vertices;

					for ( let v = 0, vl = vertices.length; v < vl; v ++ ) {

						let vertex = vertices[ v ];

						this._vector4.set( vertex.x, vertex.y, vertex.z, 1 );
						this._vector4.applyMatrix4( this._modelViewProjectionMatrix );

						this.pushPoint( this._vector4, object, camera );

					}

				} else if ( geometry instanceof THREE.BufferGeometry ) {

					let attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						let positions = attributes.position.array;

						for ( let i = 0, l = positions.length; i < l; i += 3 ) {

							this._vector4.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ], 1 );
							this._vector4.applyMatrix4( this._modelViewProjectionMatrix );

							this.pushPoint( this._vector4, object, camera );

						}

					}

				}

			} else if ( object instanceof THREE.Sprite ) {

				this._vector4.set( this._modelMatrix.elements[ 12 ], this._modelMatrix.elements[ 13 ], this._modelMatrix.elements[ 14 ], 1 );
				this._vector4.applyMatrix4( this._viewProjectionMatrix );

				this.pushPoint( this._vector4, object, camera );

			}

		}

		if ( sortElements === true ) {

			this._renderData.elements.sort( this.painterSort );

		}

		return this._renderData;

	};

	pushPoint( _vector4, object, camera ) {

		var invW = 1 / _vector4.w;

		_vector4.z *= invW;

		if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

			this._sprite = this.getNextSpriteInPool();
			this._sprite.id = object.id;
			this._sprite.x = _vector4.x * invW;
			this._sprite.y = _vector4.y * invW;
			this._sprite.z = _vector4.z;
			this._sprite.renderOrder = object.renderOrder;
			this._sprite.object = object;

			this._sprite.rotation = object.rotation;

			this._sprite.scale.x = object.scale.x * Math.abs( this._sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
			this._sprite.scale.y = object.scale.y * Math.abs( this._sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

			this._sprite.material = object.material;

			this._renderData.elements.push( this._sprite );

		}

	}

	// Pools

	getNextObjectInPool() {

		if ( this._objectCount === this._objectPoolLength ) {

			var object = new RenderableObject();
			this._objectPool.push( object );
			this._objectPoolLength ++;
			this._objectCount ++;
			return object;

		}

		return this._objectPool[ this._objectCount ++ ];

	}

	getNextVertexInPool() {

		if ( this._vertexCount === this._vertexPoolLength ) {

			var vertex = new RenderableVertex();
			this._vertexPool.push( vertex );
			this._vertexPoolLength ++;
			this._vertexCount ++;
			return vertex;

		}

		return this._vertexPool[ this._vertexCount ++ ];

	}

	getNextFaceInPool() {

		if ( this._faceCount === this._facePoolLength ) {

			var face = new RenderableFace();
			this._facePool.push( face );
			this._facePoolLength ++;
			this._faceCount ++;
			return face;

		}

		return this._facePool[ this._faceCount ++ ];


	}

	getNextLineInPool() {

		if ( this._lineCount === this._linePoolLength ) {

			var line = new RenderableLine();
			this._linePool.push( line );
			this._linePoolLength ++;
			this._lineCount ++;
			return line;

		}

		return this._linePool[ this._lineCount ++ ];

	}

	getNextSpriteInPool() {

		if ( this._spriteCount === this._spritePoolLength ) {

			var sprite = new RenderableSprite();
			this._spritePool.push( sprite );
			this._spritePoolLength ++;
			this._spriteCount ++;
			return sprite;

		}

		return this._spritePool[ this._spriteCount ++ ];

	}

	//

	painterSort( a, b ) {

		if ( a.renderOrder !== b.renderOrder ) {

			return a.renderOrder - b.renderOrder;

		} else if ( a.z !== b.z ) {

			return b.z - a.z;

		} else if ( a.id !== b.id ) {

			return a.id - b.id;

		} else {

			return 0;

		}

	}

	clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.

			bc1near = s1.z + s1.w,
			bc2near = s2.z + s2.w,
			bc1far = - s1.z + s1.w,
			bc2far = - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerp( s2, alpha1 );
				s2.lerp( s1, 1 - alpha2 );

				return true;

			}

		}

	}


}