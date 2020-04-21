/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function concatLayers(mysvg, pos,x,y,  level){
	// Retrieves the number of rows, cols, depth, etc from the first layer

	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? 0 :  _TOT_WEIGHTS;
	_TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? 0 :  _TOT_FLOPS ;
	var rows= pos[0].rows;
	var bands=0;
	var cx = 0;
	var offset = 10;
	var yoffset = -7;

	// Iterates over the layers in pos and draw the proper arrows
	for(var i =0; i< pos.length ; i++){
		// Adds up the number of bands
		bands += pos[i].bands;
		var cx = pos[i].x;
		var cy = pos[i].y-pos[i].rows*_SCALE_H*scale/2+yoffset;

		// If the position of 'concat layer' is above the current layer we add 
		// an offset
		var addY = 0;
		if(pos[i].y > y){
			addY = rows*_SCALE_H*scale/3 + offset;
		}else{
			addY = -rows*_SCALE_H*scale/3- offset;
		}
		if(pos[i].y === y){
			cy = pos[i].y;
			addY = 0;
		}
		var lx = drawArrowDash(mysvg,cx,cy,x,y+addY,eval('concat_color'+level))+20*scale;
	}

	var lay = pos[0];
	lay.bands = bands;
	lay.x = lx;
	lay = displayCNNLayer(mysvg,lay,box_color=concat_color1,txt_color='black', check_weights=false);
	return lay;
}

function addStream(mysvg, prevLay, start_filters ){
	var lay = Object.assign({},prevLay);
	var l1_1, l1_2, l1_3, l2_1, l2_2, l2_3, l3_1, l3_2, l3_3;
	lay = displayCNNLayer(mysvg,lay); // Input layer
	lay = addBatchNormalization(mysvg,lay);
	lay = addDropout(mysvg,lay,'Dropout');
	lay.filters = start_filters;
	[l1_1, l1_2, l1_3] = addLevel(mysvg,lay, 'down');
	[l2_1, l2_2, l2_3] = addLevel(mysvg,l1_3,'down');
	[l3_1, l3_2, l3_3] = addLevel(mysvg,l2_3,'down');
	return [ [l1_1, l1_2, l1_3], [l2_1, l2_2, l2_3], [l3_1, l3_2, l3_3]];
}

function addLevel(mysvg,prevLay,way='down',type_nn="3D"){
	var lay = Object.assign({},prevLay);
	var lay1, lay2, lay3;
	lay.filters = lay.filters*2;
	if(_TYPE_NN === "3D"){
		if(way==='up'){
			lay1 = addConvLayer3D(mysvg,lay);
			lay1 = addBatchNormalization(mysvg,lay1);
			lay1 = addDropout(mysvg,lay1,'');
			lay2 = addConvLayer3D(mysvg,lay1);
			lay2 = addBatchNormalization(mysvg,lay2);
			lay2 = addDropout(mysvg,lay2,'');
			lay3 = addDeconvLayer3D(mysvg,lay2);
		}else{
            // Original code:
			lay1 = addConvLayer3D(mysvg,lay);
//			lay1.filters = lay1.filters*2;
			lay2 = addConvLayer3D(mysvg,lay1);
			lay3 = addMaxPoolLayer(mysvg,lay2);
			// lay3.filters = lay3.filters*2;
		}
	}else{
		if(way==='up'){
			lay1 = addConvLayer2D(mysvg,lay);
			lay1 = addBatchNormalization(mysvg,lay1);
			lay1 = addDropout(mysvg,lay1,'Dropout');
			lay2 = addConvLayer2D(mysvg,lay1);
			lay2 = addBatchNormalization(mysvg,lay2);
			lay2 = addDropout(mysvg,lay2,'Dropout');
			lay3 = addDeconvLayer3D(mysvg,lay2);
		}else{
			lay1 = addConvLayer2D(mysvg,lay);
			lay1 = addBatchNormalization(mysvg,lay1);
			lay1 = addDropout(mysvg,lay1,'Dropout');
			// lay1.filters = lay1.filters*2;
			lay2 = addConvLayer2D(mysvg,lay1);
			lay2 = addBatchNormalization(mysvg,lay2);
			lay2 = addDropout(mysvg,lay2,'Dropout');
			lay3 = addMaxPoolLayer(mysvg,lay2);
		}
	}
	return [lay1, lay2, lay3];
}

function addMaxPoolLayer(obj,prevLay){
	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? 0 :  _TOT_WEIGHTS;
	var lay = Object.assign({},prevLay);
//	lay = drawVertArrow(obj,lay,'red');
	lay.x = drawHorArrow(obj,lay.x,lay.y,deconv_color);
    // Just adding one value for each rows*cols*depth*bands

	var currVal =(lay.rows*lay.cols*lay.depth*lay.bands*(_FILTER_SIZE+_FILTER_SIZE + 10))*lay.filters;
	if(_TYPE_NN === "3D"){
        currVal = lay.rows*lay.cols*lay.depth*lay.bands;
    }else{
        currVal = lay.rows*lay.cols*lay.bands;
    }
    _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;

	lay.rows = lay.rows/2;
	lay.cols = lay.cols/2;
	lay.depth = lay.depth/2;
	lay = displayCNNLayer(obj,lay,box_color=maxpool_color,'black',false);
	return lay;
}

function addDeconvLayer3D(obj,prevLay){
	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? 0 :  _TOT_WEIGHTS;
	var lay = Object.assign({},prevLay);
//	lay = drawVertArrow(obj,lay,'red',dir='up');
	lay.x = drawHorArrow(obj,lay.x,lay.y,deconv_color);
    // Just adding one value for each rows*cols*depth*bands
	var currVal = lay.rows*lay.cols*lay.depth*lay.bands;
    _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;
    _INTPUT_SIZE = lay.rows*lay.cols*lay.depth*lay.bands;

	lay.rows = lay.rows*2;
	lay.cols = lay.cols*2;
	lay.depth =lay.depth*2;
	lay = displayCNNLayer(obj,lay,box_color=deconv_color,'black',check_weights=false);
	return lay;
}

function addDeconvLayer2D(obj,prevLay){
	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? 0 :  _TOT_WEIGHTS;
	var lay = Object.assign({},prevLay);
//	lay = drawVertArrow(obj,lay,'red',dir='up');
	lay.x = drawHorArrow(obj,lay.x,lay.y,deconv_color);
    // Just adding one value for each rows*cols*bands
	var currVal = lay.rows*lay.cols*lay.bands;
    _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;
	lay.rows = lay.rows*2;
	lay.cols = lay.cols*2;
	lay = displayCNNLayer(obj,lay,box_color=deconv_color);
	return lay;
}

function addConvLayer3D(obj,prevLay, box_color=def_color, arrow_color='black'){
	var lay = Object.assign({},prevLay);

	// Computes the total number of weights that will be added by this CNN
	var currVal = (_FILTER_SIZE*lay.bands+1)*lay.filters;
	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? currVal: _TOT_WEIGHTS + currVal;


    // TODO currently we don't take into account strate anywhere
    // _FILTER_SIZE (multiplications) + _FILTER_SIZE (sums) by rows*cols*depth*bands plus activation function (10
    // activation function (10)
	currVal =(lay.rows*lay.cols*lay.depth*lay.bands*(_FILTER_SIZE +_FILTER_SIZE + 10))*lay.filters;
    _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;

	lay.x = drawHorArrow(obj,lay.x,lay.y,arrow_color);
	lay.bands = lay.filters;
	lay = displayCNNLayer(obj,lay, box_color);
	return lay;
}

function addConvLayer2D(obj,prevLay, box_color=def_color, arrow_color='black'){
	var lay = Object.assign({},prevLay);

	// Computes the total number of weights that will be added by this CNN
	var currVal = (_FILTER_SIZE*lay.bands+1)*lay.filters; //the 1 is the bias
	_TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? currVal: _TOT_WEIGHTS + currVal;
    // TODO currently we don't take into account strade anywhere
    // _FILTER_SIZE (multiplications) + _FILTER_SIZE (sums) by rows*cols*bands plus activation function (10
    // activation function (10)
	currVal =(lay.rows*lay.cols*lay.bands*(_FILTER_SIZE+_FILTER_SIZE + 10))*lay.filters;
    _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;

	lay.x = drawHorArrow(obj,lay.x,lay.y,arrow_color);
	lay.bands = lay.filters;
	lay = displayCNNLayer(obj,lay, box_color);
	return lay;
}

function addBatchNormalization(obj,prevLay){
	var lay = Object.assign({}, prevLay);
	if(DISP_BN) {
		var wlay = 10;
		var ystart = (lay.y - lay.rows * _SCALE_H * scale / 2);
		obj.append("rect")
			.attr('x', lay.x)
			.attr('y', ystart)
			.attr('rx', round_borders)
			.attr('ry', round_borders)
			.attr('width', wlay)
			.attr('height', lay.rows * scale * _SCALE_H)
			.style('fill', bn_color);

		obj.append("g")
			.attr('transform', 'translate(' + (lay.x + wlay / 2) + ' ' + (lay.y - 6) + ') rotate(0 0 0)')
			.append("text")
			.style('fill', 'black')
			.attr('font-size', _font_size * .8)
			.attr('writing-mode', 'tb')
			.text('BN');

		lay.x += wlay + 5;
	}
	return lay;
}

function addDropout(obj,prevLay,text){
	var lay = Object.assign({},prevLay);
	if(DISP_DROPOUT) {
		var wlay = 10;
		var ystart = (lay.y - lay.rows * _SCALE_H * scale / 2);
		obj.append("rect")
			.attr('x', lay.x)
			.attr('y', ystart)
			.attr('rx', round_borders)
			.attr('ry', round_borders)
			.attr('width', wlay)
			.attr('height', lay.rows * scale * _SCALE_H)
			.style('fill', dropout_color);

		obj.append("g")
			.attr('transform', 'translate(' + (lay.x + wlay / 2) + ' ' + (lay.y - 20) + ') rotate(0 0 0)')
			.append("text")
			.style('fill', 'black')
			.attr('font-size', _font_size * .9)
			.attr('writing-mode', 'tb')
			//			.text('Dropout '+perc+'%');
			.text(text);

		lay.x += wlay + 5;
	}
	return lay;
}

function displayCNNLayer(obj, prevLay, box_color=def_color, txt_color='black',
						 check_weights=true){
	var lay = Object.assign({},prevLay);
	var sups = _TYPE_NN === "3D"? 3:2;
	var wlay = scale*lay.bands*_SCALE_W;
	lay = prevLay;
	var ystart = (lay.y-lay.rows*_SCALE_H*scale/2);
	var yend = (lay.y+lay.rows*_SCALE_H*scale/2);
	obj.append("rect")
			.attr('x',lay.x)
			.attr('y',ystart)
			.attr('rx',round_borders)
			.attr('ry',round_borders)
			.attr('width',wlay)
			.attr('height',lay.rows*scale*_SCALE_H)
			.style('fill',box_color);

	// Adding the number of bands
	obj.append("text")
			.attr('x',lay.x+wlay/2-10)
			.attr('y',ystart-5)
			.attr('font-size',_font_size)
			.style('fill',txt_color)
			.text(lay.bands);

	// Adding the total size of the input
    if(lay.rows == lay.cols){
		obj.append("g")
			.attr('transform','translate('+(lay.x+wlay/2)+' '+(yend+5)+') rotate(-35 0 0)')
			.append("text")
			.style('fill',txt_color)
			.attr('font-size',_font_size)
			.attr('writing-mode','tb')
			.text(lay.rows)
			.append('tspan')
			.attr('font-size',_font_size*.8)
			.attr('baseline-shift','super')
			.text(sups);
	}else{
		obj.append("g")
			.attr('transform', 'translate(' + (lay.x + wlay / 2) + ' ' + (yend + 5) + ') rotate(-35 0 0)')
			.append("text")
			.style('fill', txt_color)
			.attr('font-size', _font_size)
			.attr('writing-mode', 'tb')
			.text(lay.rows + ' x ' + lay.cols);
	}


	// Adding the # of disp_data
	var disp_data =  0;
	if(_DISPLAY === "GB"){
		disp_data = Number.parseFloat((_TOT_WEIGHTS*_W_TYPE)/10**6).toFixed(2) +' GB';
	}else if(_DISPLAY === "FLOPS"){
		disp_data = Number.parseFloat((_TOT_FLOPS)/10**9).toFixed(1) +' TFP';
    }else if(_DISPLAY === 'Weights') {
	    disp_data =  _TOT_WEIGHTS;
    }else if(_DISPLAY === 'INPUT_SIZE') {
	    disp_data = Number.parseFloat((_INTPUT_SIZE*_W_TYPE)/10**9).toFixed(2) +' GB';
		console.log('aqui');
	}

//	if(_DISPLAY !== "NONE" && check_weights){
	if(_DISPLAY !== "NONE"){
		obj.append("g")
			.attr('transform','translate('+(lay.x+wlay/2+5)+' '+(yend+30)+') rotate(-50 0 0)')
			.append("text")
				.style('fill','blue')
				.attr('writing-mode','tb')
				.attr('font-size',_font_size)
				.attr('word-spacing',5)
				.text(disp_data);
	}

	// GTX 1080 Ti 11 GB
	lay.x = lay.x+wlay+5;
	return lay;
}

function displayFullLayer(obj, prevLay, box_color=def_color, txt_color='black',
					 check_weights=true){
	var lay = Object.assign({},prevLay);
	var sups = _TYPE_NN === "3D"? 3:2;
	var wlay = scale*5*_SCALE_W;
	lay = prevLay;
	var tot_cells = (lay.rows+lay.cols)*lay.output
	var ystart = (lay.y-tot_cells*_SCALE_H*scale/2);
	var yend = (lay.y+tot_cells*_SCALE_H*scale/2);
	obj.append("rect")
		.attr('x',lay.x)
		.attr('y',ystart)
		.attr('rx',round_borders)
		.attr('ry',round_borders)
		.attr('width',wlay)
		.attr('height',tot_cells*scale*_SCALE_H)
		.style('fill',box_color);

	// Adding the number of bands
	obj.append("text")
		.attr('x',lay.x+wlay/2-5)
		.attr('y',ystart-5)
		.attr('font-size',_font_size)
		.style('fill',txt_color)
		.text(lay.output);

	obj.append("g")
		.attr('transform', 'translate(' + (lay.x + wlay / 2) + ' ' + (yend + 5) + ') rotate(-35 0 0)')
		.append("text")
		.style('fill', txt_color)
		.attr('font-size', _font_size)
		.attr('writing-mode', 'tb')
		.text(tot_cells);


	// Adding the # of disp_data
	var disp_data =  0;
	if(_DISPLAY === "GB"){
		disp_data = Number.parseFloat((_TOT_WEIGHTS*_W_TYPE)/10**6).toFixed(2) +' GB';
	}else if(_DISPLAY === "FLOPS"){
		disp_data = Number.parseFloat((_TOT_FLOPS)/10**9).toFixed(1) +' TFP';
	}else if(_DISPLAY === 'Weights') {
		disp_data =  _TOT_WEIGHTS;
	}else if(_DISPLAY === 'INPUT_SIZE') {
		disp_data = Number.parseFloat((_INTPUT_SIZE*_W_TYPE)/10**9).toFixed(2) +' GB';
	}

	if(_DISPLAY !== "NONE"){
		obj.append("g")
			.attr('transform','translate('+(lay.x+wlay/2+5)+' '+(yend+30)+') rotate(-50 0 0)')
			.append("text")
			.style('fill','blue')
			.attr('writing-mode','tb')
			.attr('font-size',_font_size)
			.attr('word-spacing',5)
			.text(disp_data);
	}

	// GTX 1080 Ti 11 GB
	lay.x = lay.x+wlay+5;
	return lay;
}

function addDescriptionArrow(obj, startx, starty, desc, color){
	var x = startx;
	var y = starty;
	var width_arrow = 90*scale*_SCALE_W;

	console.log(color)
	drawHorArrow(obj,x,y,color);
	obj.append("text")
			.attr('transform','translate('+(x+width_arrow+5)+' '+(y)+') rotate(-90 0 0)')
			.style('fill','black')
			.attr('writing-mode','tb')
			.attr('font-size',_font_size*1.3)
			.attr('word-spacing',5)
			.text(desc);
}

function addDescriptionBox(obj, startx, starty, desc, color){
	var x = startx;
	var y = starty;
	var width_rect = 90*scale*_SCALE_W;
	var height_rect = 25*scale;
	obj.append("rect")
			.attr('x',x)
			.attr('y',y) 
			.attr('rx',round_borders)
			.attr('ry',round_borders)
			.attr('width',width_rect)
			.attr('height',height_rect)
			.style('fill',color)
	obj.append("text")
			.attr('transform','translate('+(x+width_rect+10)+' '+(y+height_rect/2)+') rotate(-90 0 0)')
			.style('fill','black')
			.attr('writing-mode','tb')
			.attr('font-size',_font_size*1.3)
			.attr('word-spacing',5)
			.text(desc);
}

function addFullLayer(obj,prevLay, box_color=full_layer_color, arrow_color='black'){
	var lay = Object.assign({},prevLay);

	// Computes the total number of weights that will be added by this CNN
	// var currVal = (_FILTER_SIZE*lay.bands+1)*lay.filters;
	// _TOT_WEIGHTS = _DISPLAY_TYPE === "SINGLE"? currVal: _TOT_WEIGHTS + currVal;

	// TODO currently we don't take into account strate anywhere
	// _FILTER_SIZE (multiplications) + _FILTER_SIZE (sums) by rows*cols*depth*bands plus activation function (10
	// activation function (10)
	// currVal =(lay.rows*lay.cols*lay.depth*lay.bands*(_FILTER_SIZE +_FILTER_SIZE + 10))*lay.filters;
	// _TOT_FLOPS = _DISPLAY_TYPE === "SINGLE"? currVal :  _TOT_FLOPS +currVal;
	lay.x = drawHorArrow(obj,lay.x,lay.y,arrow_color);
	lay.bands = lay.filters;
	lay = displayFullLayer(obj,lay, box_color);

	return lay;
}