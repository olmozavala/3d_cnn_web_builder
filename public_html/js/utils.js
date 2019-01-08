/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function addYOffset(lay_list, offset){
	for(var i=0; i < lay_list.length; i++){
		lay_list[i].y -= offset;
	}
	return lay_list;
}

function addXOffset(lay_list, offset){
	for(var i=0; i < lay_list.length; i++){
		lay_list[i].x += offset;
	}
	return lay_list;
}

function addImageCube(obj, x, y, path, numimgs, imgsize){
	var space = 25/numimgs
	for(var i=0; i<numimgs;i++){
		obj.append('image')
			.attr( 'href', path)
			.attr( 'x', x+i*space)
			.attr( 'y', y+i*space)
			.attr( 'width', imgsize)
			.attr( 'height', imgsize);
	}
}