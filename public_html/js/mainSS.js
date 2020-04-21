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

var rows=880;
var cols=720;
var depth=168;
var bands=8;
var filters=8;
var x = 10;  // Initial position
var y = 500;  // Initial position
var scale = 0.30;// Scale of the whole NN
var _TOT_WEIGHTS = 0;// TOtal number of weights
var _TOT_FLOPS = 0;// TOtal number of weights
var _W_TYPE = 4; // (in bytes) float 32 bits --> 4 bytes
var _FILTER_SIZE = 27; // 3x3x3
var _TYPE_NN = "2D";
var _SCALE_W= 1.85;//Only to scale the layers width
var _SCALE_H= 1;//Only to scale the layers hight
var _DISPLAY = 'NONE';//Displays GB, FLOPS, NONE, Weigths
var _DISPLAY_TYPE = 'ACCUMULATIVE';//Displays SINGLE or ACCUMULATIVE
//var _DISPLAY_TYPE = 'SINGLE';//Displays SINGLE or ACCUMULATIVE;
var _DESC_OFFSET_X = 150;  // Offsets where to put the description of the network
var _DESC_OFFSET_Y = 150;  // Offsets where to put the description of the network

var DISP_BN = true;  // Indicates if we want to display BN layers
var DISP_DROPOUT = true;  // Indicates if we want to display BN layers

var _font_size = 13

addDefs(mysvg);

var imgsize = 880*scale;
var numImgs = 1;

var input_img = 'images/inc.png'
var output_img = 'images/outc.png'

addImageCube(mysvg, x, y-10-imgsize/2, input_img,numImgs, imgsize)

x = x +imgsize+70*scale;
// Start with the 3 stream layers in the proper position
var lay1 = {x:x,y:y,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};
//Adding each stream at the position of the input layers
var initial_filters=8;
 [ [g1_conv1,g1_conv2,g1_pool1],
   [g2_conv1,g2_conv2,g2_pool1],
   [g3_conv1,g3_conv2,g3_pool1] ] = addStream(mysvg,lay1,initial_filters);

currLay = g3_pool1;
currLay.filters=64;
currLay = addConvLayer3D(mysvg,g3_pool1);
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'');
currLay  = addConvLayer3D(mysvg,currLay);
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'');
currLay = addDeconvLayer3D(mysvg,currLay);

y_off = 8
temp = g3_conv2;
temp.y -= y_off;
positions = [currLay, g3_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 2);
currLay.filters=32;
[up1, up2, currLay] = addLevel(mysvg,currLay,'up'); 

temp = g2_conv2;
temp.y -= y_off;
positions = [currLay, g2_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 3);
currLay.filters=16;
[up1, up2, currLay] = addLevel(mysvg,currLay,'up'); 

temp = g1_conv2;
temp.y -= y_off;
positions = [currLay, g1_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 3);

currLay.filters=8;
currLay = addConvLayer3D(mysvg,currLay); 
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'Dropout 20%');
currLay = addConvLayer3D(mysvg,currLay); 
currLay = addBatchNormalization(mysvg,currLay);
currLay = addDropout(mysvg,currLay,'Dropout 20%');
currLay.filters=1;
addConvLayer3D(mysvg,currLay);
addImageCube(mysvg, currLay.x+50*scale, y-imgsize/2, output_img,1, imgsize*1)

var mysvg = d3.select('svg');
var firstRect= mysvg.select('rect').node();// Select first rectangle
var allBack= mysvg.selectAll('#back'); // Select all the 'things' we want on the back
allBack.each(function(d){
		//Insert before first rectangle
		d3.select(this).node().parentNode.insertBefore(d3.select(this).node(),firstRect);
	});


// This part adds description of each layer
var desc_space = 50;

var start_x = currLay.x/2 + _DESC_OFFSET_X;
var start_y = currLay.y + _DESC_OFFSET_Y;

addDescriptionArrow(mysvg, start_x, start_y+desc_space*scale, '2D Convolution (3x3)', def_color);
addDescriptionArrow(mysvg, start_x, start_y+2*desc_space*scale, '2D MaxPool/Deconvolution (2x2)', maxpool_color);
addDescriptionArrow(mysvg, start_x, start_y+3*desc_space*scale, 'Residual Connection', concat_color3);
addDescriptionBox(mysvg, start_x,   start_y+4*desc_space*scale, 'Batch Normalization', bn_color);
addDescriptionBox(mysvg, start_x,   start_y+5*desc_space*scale, 'Dropout 20%', dropout_color);
