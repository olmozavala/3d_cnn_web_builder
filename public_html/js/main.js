var width = 2500;
var height = 1500;
var bardata =  d3.range(0,20) ;
var round_borders = 2;

var barWidth = 40;
var barHeight = 100;
var barOffset = 5;

d3.select('svg')
		.attr('width',width)
		.attr('height',height)

var mysvg = d3.select('svg');

var rows=168;
var cols=rows;
var depth=168;
var bands=1;
var filters=8;
var x = 10;
var y = 100;
var scale = 0.50;// Scale of the whole NN
var sizeStream = 320*scale;
var arr_offset = 12;
var _TOT_WEIGHTS = 0;// TOtal number of weights
var _TOT_FLOPS = 0;// TOtal number of weights
var _W_TYPE = 4; // (in bytes) float 32 bits --> 4 bytes
var _FILTER_SIZE = 27; // 3x3x3
var _TYPE_NN = "3D";
var _SCALE_W= .35;//Only to scale the layers width
var _DISPLAY = 'Weigths';//Displays GB, FLOPS, NONE, Weigths
//var _DISPLAY_TYPE = 'ACCUMULATIVE';//Displays SINGLE or ACCUMULATIVE
var _DISPLAY_TYPE = 'SINGLE';//Displays SINGLE or ACCUMULATIVE
var _font_size = 12

addDefs(mysvg);

var imgsize = 180*scale;
var numImgs = 8;

addImageCube(mysvg, x, y-10-imgsize/2, 'images/tra.png',numImgs, imgsize)
addImageCube(mysvg, x, y-10-imgsize/2+sizeStream, 'images/sag.png',numImgs, imgsize)
addImageCube(mysvg, x, y-10-imgsize/2+2*sizeStream, 'images/cor.png',numImgs, imgsize)

x = x +imgsize+60*scale;
// Start with the 3 stream layers in the proper position
var lay1 = {x:x,y:y,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};
var lay2 = {x:x,y:y+sizeStream,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};
var lay3 = {x:x,y:y+sizeStream*2,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};

//Adding each stream at the position of the input layers
var initial_filters=8;
 [ [s1_g1_conv1,s1_g1_conv2,s1_g1_pool1],
   [s1_g2_conv1,s1_g2_conv2,s1_g2_pool1],
   [s1_g3_conv1,s1_g3_conv2,s1_g3_pool1] ] = addStream(mysvg,lay1,initial_filters);
 [ [s2_g1_conv1,s2_g1_conv2,s2_g1_pool1],
   [s2_g2_conv1,s2_g2_conv2,s2_g2_pool1],
   [s2_g3_conv1,s2_g3_conv2,s2_g3_pool1] ] = addStream(mysvg,lay2,initial_filters);
 [ [s3_g1_conv1,s3_g1_conv2,s3_g1_pool1],
   [s3_g2_conv1,s3_g2_conv2,s3_g2_pool1],
   [s3_g3_conv1,s3_g3_conv2,s3_g3_pool1] ] = addStream(mysvg,lay3,initial_filters);

positions = [s2_g3_pool1, s1_g3_pool1, s3_g3_pool1];
var currLay  = concatLayers(mysvg, positions,s2_g3_pool1.x,s2_g3_pool1.y, 1);
currLay.filters=192;
//currLay.filters=128;
currLay = addConvLayer3D(mysvg,currLay); 
currLay.filters=128;
currLay  = addConvLayer3D(mysvg,currLay); 
currLay = addDeconvLayer3D(mysvg,currLay); 

[s1_g3_conv2,s2_g3_conv2,s3_g3_conv2] = addYOffset([s1_g3_conv2,s2_g3_conv2,s3_g3_conv2], arr_offset)
positions = [currLay, s1_g3_conv2,s2_g3_conv2,s3_g3_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 2);
currLay.filters=64;
[up1, up2, currLay] = addLevel(mysvg,currLay,'up'); 

[s1_g2_conv2,s2_g2_conv2,s3_g2_conv2] = addYOffset([s1_g2_conv2,s2_g2_conv2,s3_g2_conv2], arr_offset)
positions = [currLay, s1_g2_conv2,s2_g2_conv2,s3_g2_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 3);
currLay.filters=32;
[up1, up2, currLay] = addLevel(mysvg,currLay,'up'); 

[s1_g1_conv2,s2_g1_conv2,s3_g1_conv2] = addYOffset([s1_g1_conv2,s2_g1_conv2,s3_g1_conv2], arr_offset)
positions = [currLay, s1_g1_conv2,s2_g1_conv2,s3_g1_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 4);

currLay.filters=16;
currLay = addConvLayer3D(mysvg,currLay); 
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'Dropout 20%');
currLay = addConvLayer3D(mysvg,currLay); 
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'Dropout 20%');
currLay.filters=1;
addConvLayer3D(mysvg,currLay);

var mysvg = d3.select('svg');
var firstRect= mysvg.select('rect').node();// Select first rectangle
var allBack= mysvg.selectAll('#back'); // Select all the 'things' we want on the back
allBack.each(function(d){
		//Insert before first rectangle
		d3.select(this).node().parentNode.insertBefore(d3.select(this).node(),firstRect);
	});

// This part adds description of each layer
var desc_space = 50;
var start_x = s3_g3_pool1.y - 10
addDescriptionArrow(mysvg, currLay.x, start_x+desc_space*scale, '3D Convolution (3x3x3)', def_color);
addDescriptionArrow(mysvg, currLay.x, start_x+2*desc_space*scale, '3D MaxPool/Deconvolution (2x2x2)', maxpool_color);
addDescriptionArrow(mysvg, currLay.x, start_x+3*desc_space*scale, 'Concatenation', concat_color3);
addDescriptionBox(mysvg, currLay.x,   start_x+4*desc_space*scale, 'Batch Normalization', bn_color);
addDescriptionBox(mysvg, currLay.x,   start_x+5*desc_space*scale, 'Dropout 20%', dropout_color);

//addDescriptionBox(mysvg, currLay.x, s3_g3_pool1.y+desc_space*scale, '3D Convolution', def_color);
//addDescriptionBox(mysvg, currLay.x, s3_g3_pool1.y+2*desc_space*scale, '3D MaxPool/Deconvolution', maxpool_color);
//addDescriptionBox(mysvg, currLay.x, s3_g3_pool1.y+3*desc_space*scale, 'Concatenation', concat_color1);
//addDescriptionBox(mysvg, currLay.x, s3_g3_pool1.y+4*desc_space*scale, 'Batch Normalization', bn_color);
//addDescriptionBox(mysvg, currLay.x, s3_g3_pool1.y+5*desc_space*scale, 'Dropout 20%', dropout_color);


addImageCube(mysvg, currLay.x+30*scale, y-imgsize/2+sizeStream, 'images/pro.png',1, imgsize*1)