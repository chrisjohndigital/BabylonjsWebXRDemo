import { Engine, Scene, Color3, StandardMaterial, Vector3, Vector4, Texture, UniversalCamera, HemisphericLight, MeshBuilder, CubeTexture, Animation, ActionManager, IncrementValueAction, InterpolateValueAction, CombineAction, WebXRState } from "@babylonjs/core";

async function addXR(scene, meshes) {
  if (navigator.xr!=undefined) {
    try {
      let xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: meshes,
        uiOptions: {
          sessionMode: 'immersive-vr'
          //sessionMode: 'inline'
        }
      })
      console.log ('WebXR support: ' + xrHelper);
      if (xrHelper.baseExperience!=undefined) {
        console.log ('baseExperience available');
        xrHelper.baseExperience.onStateChangedObservable.add(function(state){
          switch(state) {
            case WebXRState.ENTERING_XR: {
              console.log ('WebXRState.ENTERING_XR');
            }
            break;
            case WebXRState.IN_XR: {
              console.log ('WebXRState.IN_XR');
            }
            break;
            case WebXRState.EXITING_XR :{
              console.log ('WebXRState.EXITING_XR');
            }
            break;
            case WebXRState.NOT_IN_XR :{
              console.log ('WebXRState.NOT_IN_XR');
            }
            break;
          }
        });
      } else {
        console.log ('baseExperience unavailable');
      }
    } catch (e) {
      console.log ('No WebXR support: ' + e);
    }
  }
}
const createScene = (canvas) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  //Environments
  scene.clearColor = new Color3(1, 1, 1);
  scene.collisionsEnabled = true; 
  scene.gravity = new Vector3(0, -0.15, 0);

  //camera
  const camera = new UniversalCamera('UniversalCamera', new Vector3(0, 1.6, -10), scene);
  camera.setTarget(new Vector3.Zero());
  camera.ellipsoid = new Vector3(1, 1, 1);
  camera.attachControl(canvas, true);
  camera.checkCollisions = true;
  camera.applyGravity = true;

  //Light
  new HemisphericLight('light', new Vector3(1, 1, 0));

  //Platforms
  const groundmat = newMaterial ('floor.png');
  const ground1 = newGround(12, 12, 0, 0, -6, 'floor.png', groundmat);
  const ground2 = newGround(12, 12, 0, 0, -6, 'floor.png', groundmat);
  const ground3 = newGround(6, 8, 0, -2, 4, 'floor.png', groundmat);
  const ground4 = MeshBuilder.CreateBox("ground4", {width: 12, height: 0.1, depth: 12})
  ground4.material = groundmat;
  ground4.position = new Vector3(0, -0.05, 14);
  ground4.checkCollisions = true;
  ground2.isVisible = 0;
  ground3.isVisible = 0;

  //Sky
  const skybox = MeshBuilder.CreateBox("skybox", {size:1000.0}, scene);
  const skyboxmaterial = new StandardMaterial("skyboxmaterial", scene);
  skyboxmaterial.backFaceCulling = false;
  skyboxmaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
  skyboxmaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxmaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxmaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxmaterial;

  //Walls
  const startFrame = 0;
  const endFrame = 3;
  const frameRate = 10;
  const xSlide = new Animation("xSlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
  const keyFrames = [{frame: startFrame,value: -2},{frame: endFrame*frameRate,value: 2}];
  xSlide.setKeys(keyFrames);
  const wallmat = newMaterial ('floor.png');
  wallmat.alpha = 0.1;  
  const wall1 = newWall(12, 4, 1, 0, 2, 0.5, wallmat, xSlide, startFrame, endFrame*frameRate, scene);
  const wall2 = newWall(1, 4, 12, -6.5, 2, -6, wallmat, xSlide, startFrame, endFrame*frameRate, scene);
  const wall3 = newWall(1, 4, 12, 6.5, 2, -6, wallmat, xSlide, startFrame, endFrame*frameRate, scene);
  const wall4 =  newWall(12, 4, 1, 0, 2, -12.5, wallmat, xSlide, startFrame, endFrame*frameRate, scene);

  //Box
  const box = newBox();
  const boxmaterial = new StandardMaterial("boxmaterial", scene);
  const boxtexture = new Texture("cube-faces.png", scene);
  boxmaterial.diffuseColor = new Color3(0, 0, 0);
  boxmaterial.specularColor = new Color3(0, 0, 0);
  boxmaterial.emissiveTexture = boxtexture;
  box.material = boxmaterial;
  box.position = new Vector3(0, 0.5, -4);

  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(new IncrementValueAction(ActionManager.OnEveryFrameTrigger, box, "rotation.y", 0.01));

  box.actionManager = new ActionManager(scene);        
  box.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, box, "scaling", new Vector3(1, 1, 1), 150));
  box.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, box, "scaling", new Vector3(1.1, 1.1, 1.1), 150));
  box.actionManager.registerAction(new CombineAction(
    ActionManager.OnPickTrigger,
    [
          new InterpolateValueAction(ActionManager.OnPickTrigger, ground2, "isVisible", 1, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, ground3, "isVisible", 1, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, ground4, "isVisible", 0, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, ground2, "position", new Vector3(0, 0, 14), 1),
          new InterpolateValueAction(ActionManager.OnPickTrigger, ground3, "position", new Vector3(0, 0, 4), 550),
          new InterpolateValueAction(ActionManager.OnPickTrigger, wall1, "position", new Vector3(0, -5, 0.5), 1100),
          new InterpolateValueAction(ActionManager.OnPickTrigger, wall1, "alpha", 0, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, wall2, "alpha", 0.2, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, wall3, "alpha", 0.2, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, wall4, "alpha", 0.2, 150),
          new InterpolateValueAction(ActionManager.OnPickTrigger, camera, "position", new Vector3(0, 1.6, 8), 2000)
          ]
    ))

  //WebXR
  addXR (scene, [ground1, ground2, ground3]);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', function () {
      engine.resize();
  });
};

const newBox = () => {
    let columns = 6;
    let rows = 1;
    let faceUV = new Array(6);
    for (let i = 0; i < columns; i++) {
        faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    }
    let options = {
        faceUV: faceUV,
        wrap: true,
        size: 0.5
    }
    let box = MeshBuilder.CreateBox("box", options);
    return box;
}

const newGround = (w, h, x, y, z, surface, mat) => {
  let ground = MeshBuilder.CreateGround('ground', {width:w, height:h});            
  ground.material = mat;
  ground.position = new Vector3(x, y, z);
  ground.checkCollisions = true;
  return ground;
}
const newWall = (w, h, d, x, y, z, mat, xSlide, startFrame, endFrame, scene) => {
  let wall = MeshBuilder.CreateBox('wall', {width: w, height: h, depth: d})
  wall.position = new Vector3(x, y, z);
  wall.material = mat;
  wall.checkCollisions = true;
  wall.animations.push(xSlide);
  scene.beginAnimation(wall, startFrame, endFrame, false);
  return wall;
}
const newMaterial = (surface) => {
  let mat = new StandardMaterial('mat');
  mat.diffuseTexture = new Texture(surface);
  return mat;
}

export default createScene;