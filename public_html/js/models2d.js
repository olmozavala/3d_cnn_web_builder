var width = 2500;
var height = 1500;
var bardata =  d3.range(0,20) ;

var barWidth = 40;
var barHeight = 100;
var barOffset = 5;

d3.select('svg')
		.attr('width',width)
		.attr('height',height)

var mysvg = d3.select('svg');

var rows=168;
var cols=168;
var depth=0;
var bands=3;
var filters=0;
var x = 50;
var y = 100;
var scale = 0.5;
var sizeStream = 200;
var arr_offset = 10;

var _TOT_WEIGHTS = 0;// TOtal number of weights
var _TOT_FLOPS = 0;// TOtal number of weights
var _W_TYPE = 4; // (in bytes) float 32 bits --> 4 bytes
var _FILTER_SIZE = 9; // 3x3
var _TYPE_NN = "2D";
var _SCALE_W= .23;//Only to scale the layers width
var _DISPLAY = 'FLOPS';//Displays GB, FLOPS, or Weigths
//var _DISPLAY = 'Weights';//Displays GB or Weigths

addDefs(mysvg);

var lay1 = {x:x,y:y,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};
var lay2 = {x:x,y:y+sizeStream,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};
var lay3 = {x:x,y:y+sizeStream*2,rows:rows,cols:cols,depth:depth,bands:bands,filters:filters};

var initial_filters=64;
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
currLay.filters=256;
currLay = addConvLayer3D(mysvg,currLay); 
currLay  = addConvLayer3D(mysvg,currLay); 
currLay = addDeconvLayer3D(mysvg,currLay); 

[s1_g3_conv2,s2_g3_conv2,s3_g3_conv2] = addYOffset([s1_g3_conv2,s2_g3_conv2,s3_g3_conv2], arr_offset)
positions = [currLay, s1_g3_conv2,s2_g3_conv2,s3_g3_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 2);
currLay.filters/=2;
[up1, up2, currLay] = addLevel(mysvg,currLay,way='up'); 

[s1_g2_conv2,s2_g2_conv2,s3_g2_conv2] = addYOffset([s1_g2_conv2,s2_g2_conv2,s3_g2_conv2], arr_offset)
positions = [currLay, s1_g2_conv2,s2_g2_conv2,s3_g2_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 3);
currLay.filters/=2;
[up1, up2, currLay] = addLevel(mysvg,currLay,way='up'); 

[s1_g1_conv2,s2_g1_conv2,s3_g1_conv2] = addYOffset([s1_g1_conv2,s2_g1_conv2,s3_g1_conv2], arr_offset)
positions = [currLay, s1_g1_conv2,s2_g1_conv2,s3_g1_conv2];
currLay = concatLayers(mysvg, positions,currLay.x,currLay.y, 4);

currLay.filters=64;
currLay  = addConvLayer3D(mysvg,currLay); 
currLay  = addConvLayer3D(mysvg,currLay); 
currLay.filters=168;
addConvLayer3D(mysvg,currLay,box_color='cyan',arrow_color='blue');

var mysvg = d3.select('svg');
var firstRect= mysvg.select('rect').node();// Select first rectangle
var allBack= mysvg.selectAll('#back'); // Select all the 'things' we want on the back
// TODO we need a FCL at the end

allBack.each(function(d){
		//Insert before first rectangle
		d3.select(this).node().parentNode.insertBefore(d3.select(this).node(),firstRect);
	});