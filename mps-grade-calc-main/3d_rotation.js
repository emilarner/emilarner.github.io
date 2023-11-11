let vertices = [
    [60, 60, 60],
    [-60, 60, 60],
    [-60, -60, 60],
    [-60, -60, -60],
    [60, -60, -60],
    [60, 60, -60],
    [-60, 60, -60],
    [60, -60, 60]
];
  

let pyramidal_vertices = [
    [60, 60, -60],
    [-60, 60, -60],
    [60, -60, -60],
    [-60, -60, -60],
    [0, 0, 60]
];

let centerX = 320 / 2;
let centerY = 240 / 2;

let mouseX = 0;
let mouseY = 0;

let speed = 1;

let xAngle = 1;
let yAngle = 1;
let zAngle = 0;

document.onmousemove = (e) => {
	mouseX = e.clientX;
  mouseY = e.clientY;
};

function rotate_point_x(point, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cosTheta = Math.cos(angleRadians);
  const sinTheta = Math.sin(angleRadians);

  const x = point[0];
  const y = point[1] * cosTheta - point[2] * sinTheta;
  const z = point[1] * sinTheta + point[2] * cosTheta;

  return [x, y, z];
}

function rotatePointY(point, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cosTheta = Math.cos(angleRadians);
  const sinTheta = Math.sin(angleRadians);

  const x = point[0] * cosTheta + point[2] * sinTheta;
  const y = point[1];
  const z = -point[0] * sinTheta + point[2] * cosTheta;

  return [x, y, z];
}

function rotatePointZ(point, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cosTheta = Math.cos(angleRadians);
  const sinTheta = Math.sin(angleRadians);

  const x = point[0] * cosTheta - point[1] * sinTheta;
  const y = point[0] * sinTheta + point[1] * cosTheta;
  const z = point[2];

  return [x, y, z];
}


function perspective_project(point, focal_length = 20)
{
		return [point[0] / (point[2] / focal_length), point[1] / (point[2] / focal_length)];
}

function orthogonal_project(point)
{
	return [point[0], point[1]];
}

function distance(point1, point2)
{
	let total = 0.00;
  for (let i = 0; i < 3; i++)
  	total += Math.pow(point2[i] - point1[i], 2);
    
  return total;
}

function clearCanvas()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function do_shit_pyramid()
{
	clearCanvas();
  
  for (let i = 0; i < pyramidal_vertices.length; i++)
  {
  	for (let j = i + 1; j < pyramidal_vertices.length; j++)
    {
    	let dist = distance(pyramidal_vertices[i], pyramidal_vertices[j]);
      
      if (dist > 125*125) {
      	if (i != 4 && j != 4)
      		continue;
      }
    
    	let [pXi, pYi] = orthogonal_project(pyramidal_vertices[i]);
      let [pXj, pYj] = orthogonal_project(pyramidal_vertices[j]);
    
    	context.beginPath();
    	context.moveTo(pXi + centerX, pYi + centerY);
      context.lineTo(pXj + centerX, pYj + centerY);
      context.stroke();
    }
  }
  
  for (let i = 0; i < pyramidal_vertices.length; i++)
  {
  	let [pX, pY] = orthogonal_project(pyramidal_vertices[i]);
  	context.fillRect(pX + 250, pY + 250, 1,1);
  	pyramidal_vertices[i] = rotate_point_x(pyramidal_vertices[i], xAngle * speed);
    pyramidal_vertices[i] = rotatePointY(pyramidal_vertices[i], yAngle * speed);
    pyramidal_vertices[i] = rotatePointZ(pyramidal_vertices[i], zAngle * speed);
  }

}

function do_shit()
{
    clearCanvas();
  
  for (let i = 0; i < vertices.length; i++)
  {
  	for (let j = i + 1; j < vertices.length; j++)
    {
    	let dist = distance(vertices[i], vertices[j]);
        if (dist > 125*125)
            continue;
        
      
    
    	let [pXi, pYi] = orthogonal_project(vertices[i]);
      let [pXj, pYj] = orthogonal_project(vertices[j]);
      
      context.beginPath();
      context.moveTo(pXi + centerX, pYi + centerY);
      context.lineTo(pXj + centerX, pYj + centerY);
      context.stroke();
    }
  }
  
  for (let i = 0; i < vertices.length; i++)
  {
  	let [pX, pY] = orthogonal_project(vertices[i]);
    //console.log(`(${pX}, ${pY})`);
  	context.fillRect(pX + 250, pY + 250, 1,1);
  	vertices[i] = rotate_point_x(vertices[i], xAngle * speed);
    vertices[i] = rotatePointY(vertices[i], yAngle * speed);
    vertices[i] = rotatePointZ(vertices[i], zAngle * speed);
  }
}

function change_cube()
{
	clearInterval(process);
  process = setInterval(do_shit, 15);
}

function change_pyramid()
{
	clearInterval(process);
    process = setInterval(do_shit_pyramid, 15);
}

function change_angle()
{
	console.log("changing angle");
	xAngle = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
    yAngle = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
    zAngle = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
}

