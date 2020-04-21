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
var _DESC_OFFSET_X = -150;  // Offsets where to put the description of the network
var _DESC_OFFSET_Y = +200;  // Offsets where to put the description of the network

var DISP_BN = true;  // Indicates if we want to display BN layers
var DISP_DROPOUT = true;  // Indicates if we want to display BN layers

var _font_size = 13

addDefs(mysvg);

var imgsize = 880*scale;
var numImgs = 1;

var input_img = 'images/inc.png'
var output_img = 'images/outc.png'

var output_classes = 3

addImageCube(mysvg, x, y-10-imgsize/2, input_img,numImgs, imgsize)

x = x +imgsize+70*scale;
// Start with the 3 stream layers in the proper position
var lay1 = {x:x,y:y,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters,output:output_classes};
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
console.log("aqui: ", currLay.x);
currLay  = addFullLayer(mysvg,currLay);
console.log("aqui: ", currLay.x);

var c_space = 20
var a_space = 30
// addDescriptionArrow(mysvg, currLay.x, currLay.y-c_space, '', '#27AA53');
addDescriptionArrow(mysvg, currLay.x, currLay.y-c_space, '', low_risk);
addDescriptionArrow(mysvg, currLay.x, currLay.y, '', moderate_risk);
addDescriptionArrow(mysvg, currLay.x, currLay.y+c_space, '', high_risk);
addDescriptionArrow(mysvg, currLay.x, currLay.y+2*c_space, '', ex_risk);
currLay.y -= 5
addDescriptionBox(mysvg, currLay.x + a_space,currLay.y - c_space ,'Very low risk (no hospitalization)', '#27AA53');
addDescriptionBox(mysvg, currLay.x + a_space,currLay.y  ,    'Moderate risk (hospitalization)', '#EABC46');
// addDescriptionBox(mysvg, currLay.x + a_space,currLay.y + c_space ,    `High risk (ICO${String.fromCharCode(0xB1)}ventilator support)`, '#E08C42');
addDescriptionBox(mysvg, currLay.x + a_space,currLay.y + c_space ,    `High risk (ICU +/- ventilator support)`, '#E08C42');
addDescriptionBox(mysvg, currLay.x + a_space,currLay.y + 2*c_space ,    'Death', '#C50A14');
// Very low risk (no hospitalization),
// Moderate risk (hospitalization),
// High risk (ICU ± ventilator support)
// Death

// This part adds description of each layer
var desc_space = 50;

var start_x = currLay.x + _DESC_OFFSET_X;
var start_y = currLay.y + _DESC_OFFSET_Y;

addDescriptionArrow(mysvg, start_x, start_y+desc_space*scale, '2D Convolution (3x3)', def_color);
addDescriptionArrow(mysvg, start_x, start_y+2*desc_space*scale, '2D MaxPool/Deconvolution (2x2)', maxpool_color);
addDescriptionArrow(mysvg, start_x, start_y+3*desc_space*scale, 'Residual Connection', concat_color3);
addDescriptionBox(mysvg, start_x,   start_y+4*desc_space*scale, 'Batch Normalization', bn_color);
addDescriptionBox(mysvg, start_x,   start_y+5*desc_space*scale, 'Dropout 20%', dropout_color);
addDescriptionBox(mysvg, start_x,   start_y+6*desc_space*scale, 'Full Layer', full_layer_color);
